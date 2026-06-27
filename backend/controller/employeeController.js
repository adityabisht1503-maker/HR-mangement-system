const { Employeemodel }     = require("../model/Employee");
const { Leavemodel }        = require("../model/Leave");
const { Payrollmodel }      = require("../model/Payroll");
const { Attendancemodel }   = require("../model/Attendance");
const { Passwordmodel }     = require("../model/Password");
const { Notificationmodel } = require("../model/Notification");
const { deletemail } = require("../service/deletemail");

/* =========================
   GET ALL EMPLOYEES
   GET /api/employees?page=1&limit=10&search=john&department=id&status=active
========================= */
const getAllEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, status } = req.query;

    const filter = {};
    if (status)     filter.status = status;
    if (department) filter["jobInfo.department"] = department;
    if (search) {
      filter.$or = [
        { "personalInfo.firstName": { $regex: search, $options: "i" } },
        { "personalInfo.lastName":  { $regex: search, $options: "i" } },
        { "personalInfo.email":     { $regex: search, $options: "i" } },
        { employeeCode:             { $regex: search, $options: "i" } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Employeemodel.countDocuments(filter);

    const employees = await Employeemodel.find(filter)
      .populate("jobInfo.department", "name")
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      status: 1,
      message: "Employees fetched successfully",
      employees,
      pagination: {
        total,
        page:  Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   GET EMPLOYEE STATS
   GET /api/employees/stats
   — field names match exactly what DashboardPage expects:
     stats.totalEmployees, stats.activeEmployees, stats.newThisMonth, stats.onLeave
========================= */
const getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees  = await Employeemodel.countDocuments();
    const activeEmployees = await Employeemodel.countDocuments({ status: "active" });
    const onLeave         = await Employeemodel.countDocuments({ status: "on_leave" });
    const terminated      = await Employeemodel.countDocuments({ status: "terminated" });

    // Employees joined this calendar month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await Employeemodel.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Breakdown by department
    const byDept = await Employeemodel.aggregate([
      { $group: { _id: "$jobInfo.department", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "dept",
        },
      },
      {
        $project: {
          name:  { $arrayElemAt: ["$dept.name", 0] },
          count: 1,
        },
      },
    ]);

    // Average performance score
    const perfAgg = await Employeemodel.aggregate([
      { $match: { performanceScore: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: "$performanceScore" } } },
    ]);
    const avgPerformance = perfAgg[0]?.avg
      ? Math.round(perfAgg[0].avg * 10) / 10
      : null;

    return res.json({
      status: 1,
      message: "Stats fetched successfully",
      // flat fields — used directly by DashboardPage StatCards
      totalEmployees,
      activeEmployees,
      onLeave,
      terminated,
      newThisMonth,
      avgPerformance,
      // nested breakdown for charts
      byDept,
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   GET MY EMPLOYEE PROFILE (logged-in employee)
   GET /api/employees/me
========================= */
const getMyProfile = async (req, res) => {
  try {
    const employee = await Employeemodel.findOne({ user: req.user._id })
      .populate("jobInfo.department", "name")
      .populate("user", "name email role ");

    if (!employee) {
      return res.status(404).json({ status: 0, message: "Employee profile not found" });
    }

    return res.json({ status: 1, message: "Profile fetched", employee });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   GET EMPLOYEE BY ID
   GET /api/employees/:id
========================= */
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employeemodel.findById(req.params.id)
      .populate("jobInfo.department", "name")
      .populate("user", "name email role");

    if (!employee) {
      return res.status(404).json({ status: 0, message: "Employee not found" });
    }

    return res.json({ status: 1, message: "Employee fetched", employee });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   CREATE EMPLOYEE
   POST /api/employees
========================= */
const createEmployee = async (req, res) => {
  try {
    const { user, personalInfo, jobInfo, status } = req.body;

    if (!user || !personalInfo?.firstName || !personalInfo?.lastName || !personalInfo?.email) {
      return res.json({ status: 0, message: "user, firstName, lastName and email are required" });
    }

    const existing = await Employeemodel.findOne({ user });
    if (existing) {
      return res.json({ status: 0, message: "Employee profile already exists for this user" });
    }

    const employee = new Employeemodel({ user, personalInfo, jobInfo, status });
    await employee.save();

    const populated = await Employeemodel.findById(employee._id)
      .populate("jobInfo.department", "name")
      .populate("user", "name email role");

    return res.json({
      status: 1,
      message: "Employee created successfully",
      employee: populated,
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   UPDATE EMPLOYEE
   PUT /api/employees/:id
========================= */
const updateEmployee = async (req, res) => {
  try {
    const { personalInfo, jobInfo, status, performanceScore } = req.body;

    const employee = await Employeemodel.findByIdAndUpdate(
      req.params.id,
      { $set: { personalInfo, jobInfo, status, performanceScore } },
      { new: true, runValidators: true }
    )
      .populate("jobInfo.department", "name")
      .populate("user", "name email role");

    if (!employee) {
      return res.status(404).json({ status: 0, message: "Employee not found" });
    }

    return res.json({ status: 1, message: "Employee updated successfully", employee });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   DELETE EMPLOYEE (cascade)
   DELETE /api/employees/:id
   Removes: Leaves, Payroll, Attendance, Notifications, Employee profile, Login user
========================= */
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employeemodel.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ status: 0, message: "Employee not found" });
    }
         
    const employeeId = employee._id;
    const userId     = employee.user; // the Login model _id

    // 1. Leaves
    const userAccount = await Passwordmodel.findById(userId);

    // 1. Send deletion email BEFORE deleting
    await deletemail(userAccount);
    const leavesDeleted = await Leavemodel.deleteMany({ employee: employeeId });

    // 2. Payroll / payslips
    const payrollDeleted = await Payrollmodel.deleteMany({ employee: employeeId });

    // 3. Attendance
    const attendanceDeleted = await Attendancemodel.deleteMany({ employee: employeeId });

    // 4. Notifications received by this user
    const notifDeleted = await Notificationmodel.deleteMany({ recipient: userId });

    // 5. Employee profile
    await Employeemodel.findByIdAndDelete(employeeId);

    // 6. Login / auth account
    await Passwordmodel.findByIdAndDelete(userId);
       
    return res.json({
      status : 1,
      message: "Employee and all associated records deleted successfully",
      deleted: {
        leaves       : leavesDeleted.deletedCount,
        payroll      : payrollDeleted.deletedCount,
        attendance   : attendanceDeleted.deletedCount,
        notifications: notifDeleted.deletedCount,
        employee     : 1,
        user         : 1,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeStats,
  getMyProfile,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};