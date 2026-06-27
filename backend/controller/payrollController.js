const { Payrollmodel }  = require("../model/Payroll");
const { Employeemodel } = require("../model/Employee");
const { createNotification } = require("./notificationController");

/* =========================
   GET MY PAYSLIPS (Employee)
   GET /api/payroll/my
========================= */
const getMyPayslips = async (req, res) => {
  try {
    const employee = await Employeemodel.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ status: 0, message: "Employee profile not found" });
    }

    const payslips = await Payrollmodel.find({ employee: employee._id })
      .sort({ month: -1 });

    return res.json({ status: 1, message: "Payslips fetched", payslips });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   GET ALL PAYROLL (HR/Admin)
   GET /api/payroll?month=2025-01&status=pending
========================= */
const getAllPayroll = async (req, res) => {
  try {
    const { month, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (month) {
      const start = new Date(month);
      const end   = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      filter.month = { $gte: start, $lt: end };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Payrollmodel.countDocuments(filter);

    const payroll = await Payrollmodel.find(filter)
      .populate({
        path: "employee",
        select: "personalInfo employeeCode jobInfo",
        populate: { path: "jobInfo.department", select: "name" },
      })
      .sort({ month: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      status: 1,
      message: "Payroll fetched",
      payroll,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   CREATE PAYSLIP (HR/Admin)
   POST /api/payroll
========================= */
const createPayslip = async (req, res) => {
  try {
    const { employee, month, basicSalary, allowances, deductions } = req.body;

    if (!employee || !month || basicSalary === undefined) {
      return res.json({ status: 0, message: "employee, month and basicSalary are required" });
    }

    const payslip = new Payrollmodel({
      employee,
      month:        new Date(month),
      basicSalary:  Number(basicSalary),
      allowances:   Number(allowances)  || 0,
      deductions:   Number(deductions)  || 0,
      generatedBy:  req.user._id,
    });

    await payslip.save();

    return res.json({ status: 1, message: "Payslip created successfully", payslip });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   MARK PAYSLIP AS PAID (HR/Admin)
   PUT /api/payroll/:id/pay
========================= */
const markAsPaid = async (req, res) => {
  try {
    const payslip = await Payrollmodel.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "paid", paidAt: new Date() } },
      { new: true }
    );

    if (!payslip) {
      return res.status(404).json({ status: 0, message: "Payslip not found" });
    }

    // Notify the employee their salary has been credited
    const populatedPayslip = await Payrollmodel.findById(req.params.id).populate("employee");
    if (populatedPayslip?.employee?.user) {
      const monthStr = new Date(populatedPayslip.month).toLocaleString("default", { month: "long", year: "numeric" });
      await createNotification({
        recipientId  : populatedPayslip.employee.user,
        recipientRole: "employee",
        type         : "payroll_credited",
        message      : `Your salary for ${monthStr} has been credited. Net: ₹${populatedPayslip.netSalary.toLocaleString()}`,
        refId        : populatedPayslip._id,
      });
    }

    return res.json({ status: 1, message: "Marked as paid", payslip });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

module.exports = { getMyPayslips, getAllPayroll, createPayslip, markAsPaid };
