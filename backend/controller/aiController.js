require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Employeemodel }      = require("../model/Employee");
const { Leavemodel }         = require("../model/Leave");
const { Attendancemodel }    = require("../model/Attendance");
const { Payrollmodel } = require("../model/Payroll");

// Same pattern as your existing Geminicontoller.js
const genAI = new GoogleGenerativeAI(process.env.KEY);

/* =========================
   WORKFORCE INSIGHTS
   GET /api/ai/workforce-insights
   — Response shape matches exactly what DashboardPage expects:
     insights.data.avgPerformance
     insights.insights.healthScore
     insights.insights.trend
     insights.insights.keyRisks
========================= */
const workforceInsights = async (req, res) => {
  try {
    // Gather live data to give Gemini context
    const totalEmployees  = await Employeemodel.countDocuments();
    const activeEmployees = await Employeemodel.countDocuments({ status: "active" });
    const onLeave         = await Employeemodel.countDocuments({ status: "on_leave" });
    const terminated      = await Employeemodel.countDocuments({ status: "terminated" });
    const pendingLeaves   = await Leavemodel.countDocuments({ status: "pending" });

    // Average performance score
    const perfAgg = await Employeemodel.aggregate([
      { $match: { performanceScore: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: "$performanceScore" } } },
    ]);
    const avgPerformance = perfAgg[0]?.avg
      ? Math.round(perfAgg[0].avg * 10) / 10
      : null;

    // Attendance this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const totalAttendance = await Attendancemodel.countDocuments({
      date:   { $gte: startOfMonth },
      status: "present",
    });

    const prompt = `
You are an HR analytics AI assistant. Based on the following live workforce data, provide a brief JSON analysis.

Data:
- Total employees: ${totalEmployees}
- Active: ${activeEmployees}
- On leave: ${onLeave}
- Terminated this period: ${terminated}
- Pending leave requests: ${pendingLeaves}
- Average performance score: ${avgPerformance ?? "not available"} (out of 100)
- Present days recorded this month: ${totalAttendance}

Respond ONLY with a valid JSON object in this exact shape (no markdown, no extra text):
{
  "healthScore": <number 0-100>,
  "trend": "<improving|stable|declining>",
  "keyRisks": ["<risk 1>", "<risk 2>", "<risk 3>"]
}
    `.trim();

    const model  = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    const text   = result.response.text().trim();

    // Strip any accidental markdown fences
    const clean  = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.json({
      status: 1,
      message: "Workforce insights generated",
      // shape the frontend expects
      data: { avgPerformance },
      insights: {
        healthScore: parsed.healthScore ?? 75,
        trend:       parsed.trend       ?? "stable",
        keyRisks:    parsed.keyRisks    ?? [],
      },
    });
  } catch (err) {
    console.error("AI workforce insights error:", err.message);
    // Return graceful fallback so dashboard doesn't break
    return res.json({
      status: 1,
      message: "Insights unavailable",
      data:     { avgPerformance: null },
      insights: null,
    });
  }
};

/* =========================
   ANALYZE SINGLE EMPLOYEE
   POST /api/ai/analyze-employee/:id
========================= */
const analyzeEmployee = async (req, res) => {
  try {
    const { message } = req.body; // ✅ dynamic message from frontend
    
    if (!message) {
      return res.status(400).json({ status: 0, message: "Message is required" });
    }

    const employee = await Employeemodel.findById(req.params.id)
      .populate("jobInfo.department", "name");

    if (!employee) {
      return res.status(404).json({ status: 0, message: "Employee not found" });
    }

    // ✅ Fetch all related data
    const [leaves, payroll, attendance] = await Promise.all([
      Leavemodel.find({ employee: employee._id }),
      Payrollmodel.find({ employee: employee._id }),
      Attendancemodel.find({ employee: employee._id }),
    ]);

    // ✅ Build context for AI
    const employeeContext = `
Employee Details:
- Name: ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}
- Phone: ${employee.personalInfo.phone || "N/A"}         // ✅ add this
- Address: ${employee.personalInfo.address || "N/A"}     // ✅ optional but useful
- Date of Birth: ${employee.personalInfo.dateOfBirth?.toDateString() || "N/A"} // ✅ optional
- Title: ${employee.jobInfo?.title || "N/A"}
- Department: ${employee.jobInfo?.department?.name || "N/A"}
- Employment Type: ${employee.jobInfo?.employmentType || "N/A"}
- Status: ${employee.status}
- Performance Score: ${employee.performanceScore}/100
- Joined: ${employee.jobInfo?.hireDate?.toDateString() || "N/A"}
Attendance Summary:
- Total Records: ${attendance.length}
- Present Days: ${attendance.filter(a => a.status === "present").length}
- Absent Days: ${attendance.filter(a => a.status === "absent").length}
- Late Days: ${attendance.filter(a => a.status === "late").length}

Leave Summary:
- Total Leaves: ${leaves.length}
- Approved: ${leaves.filter(l => l.status === "approved").length}
- Pending: ${leaves.filter(l => l.status === "pending").length}
- Rejected: ${leaves.filter(l => l.status === "rejected").length}

Payroll Summary:
- Total Payslips: ${payroll.length}
- Latest Salary: ${payroll.at(-1)?.netSalary || "N/A"}
- Total Paid: ${payroll.reduce((sum, p) => sum + (p.netSalary || 0), 0)}
    `.trim();

    const prompt = `
You are an HR assistant. Based on the employee data below, answer the HR's question.

${employeeContext}

HR Question: ${message}

Respond ONLY with valid JSON (no markdown):
{
  "answer": "<direct answer to the question>",
  "insights": ["<insight 1>", "<insight 2>"],
  "recommendation": "<one actionable recommendation>"
}
    `.trim();

    const model  = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    const text   = result.response.text().trim();
    const clean  = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.json({ status: 1, message: "Analysis complete", analysis: parsed });
  } catch (err) {
    console.error("AI analyze employee error:", err.message);
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   GENERATE JOB DESCRIPTION
   POST /api/ai/generate-job-description
========================= */
const generateJobDescription = async (req, res) => {
  try {
    const { title, department, requirements } = req.body;

    if (!title) {
      return res.json({ status: 0, message: "Job title is required" });
    }

    const prompt = `
Write a professional job description for the following role. Respond ONLY with a JSON object (no markdown):

Role: ${title}
Department: ${department || "Not specified"}
Key requirements: ${requirements || "Not specified"}

Respond ONLY with valid JSON:
{
  "title": "${title}",
  "overview": "<2-sentence overview>",
  "responsibilities": ["<item 1>", "<item 2>", "<item 3>", "<item 4>", "<item 5>"],
  "requirements": ["<item 1>", "<item 2>", "<item 3>", "<item 4>"],
  "benefits": ["<item 1>", "<item 2>", "<item 3>"]
}
    `.trim();

    const model  = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    const text   = result.response.text().trim();
    const clean  = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.json({ status: 1, message: "Job description generated", jobDescription: parsed });
  } catch (err) {
    console.error("AI generate JD error:", err.message);
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   AI CHAT
   POST /api/ai/chat
========================= */
const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.json({ status: 0, message: "Message is required" });
    }

    const prompt = `
You are an HR assistant chatbot for an HR Management System. Answer the following HR-related question helpfully and concisely.

Question: ${message}
    `.trim();

    const model  = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return res.json({ status: 1, message: "Response generated", answer });
  } catch (err) {
    console.error("AI chat error:", err.message);
    return res.status(500).json({ status: 0, message: err.message });
  }
};

module.exports = { workforceInsights, analyzeEmployee, generateJobDescription, chat };
