const { Leavemodel }    = require("../model/Leave");
const { Employeemodel } = require("../model/Employee");
const { createNotification, notifyAllAdmins } = require("./notificationController");

/* =========================
   GET ALL LEAVES (HR/Admin)
   GET /api/leaves?status=pending&page=1
========================= */
const getAllLeaves = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Leavemodel.countDocuments(filter);

    const leaves = await Leavemodel.find(filter)
      .populate({
        path: "employee",
        select: "personalInfo employeeCode jobInfo",
        populate: { path: "jobInfo.department", select: "name" },
      })
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      status: 1,
      message: "Leaves fetched successfully",
      leaves,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   GET MY LEAVES (Employee)
   GET /api/leaves/my
========================= */
const getMyLeaves = async (req, res) => {
  try {
    const employee = await Employeemodel.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ status: 0, message: "Employee profile not found" });
    }

    const leaves = await Leavemodel.find({ employee: employee._id })
      .sort({ createdAt: -1 });

    return res.json({ status: 1, message: "Your leaves fetched", leaves });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   APPLY FOR LEAVE (Employee self-service)
   POST /api/leaves/apply
========================= */
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.json({ status: 0, message: "All fields are required" });
    }

    const employee = await Employeemodel.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ status: 0, message: "Employee profile not found" });
    }

    const leave = new Leavemodel({
      employee: employee._id,
      leaveType,
      startDate: new Date(startDate),
      endDate:   new Date(endDate),
      reason,
    });

    await leave.save();

    // Notify all admins that an employee applied for leave
    await notifyAllAdmins({
      type   : "leave_request",
      message: `${employee.personalInfo.firstName} ${employee.personalInfo.lastName || ""} applied for ${leaveType} leave (${leave.totalDays} days)`.trim(),
      refId  : leave._id,
    });

    return res.json({
      status: 1,
      message: "Leave request submitted successfully",
      leave,
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   CREATE LEAVE (HR creates on behalf)
   POST /api/leaves
========================= */
const createLeave = async (req, res) => {
  try {
    const { employee, leaveType, startDate, endDate, reason } = req.body;

    if (!employee || !leaveType || !startDate || !endDate || !reason) {
      return res.json({ status: 0, message: "All fields are required" });
    }

    const leave = new Leavemodel({
      employee,
      leaveType,
      startDate: new Date(startDate),
      endDate:   new Date(endDate),
      reason,
    });

    await leave.save();

    return res.json({ status: 1, message: "Leave created successfully", leave });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   APPROVE / REJECT LEAVE (HR/Admin)
   PUT /api/leaves/:id/approve
========================= */
const approveLeave = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;  // status: "approved" | "rejected"

    if (!["approved", "rejected"].includes(status)) {
      return res.json({ status: 0, message: "Status must be approved or rejected" });
    }

    const leave = await Leavemodel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status,
          reviewNote,
          reviewedBy: req.user._id,
        },
      },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({ status: 0, message: "Leave not found" });
    }

    // Notify the employee of the HR decision
    const populatedLeave = await Leavemodel.findById(req.params.id).populate("employee");
    if (populatedLeave?.employee?.user) {
      await createNotification({
        recipientId  : populatedLeave.employee.user,
        recipientRole: "employee",
        type         : status === "approved" ? "leave_approved" : "leave_rejected",
        message      : `Your ${populatedLeave.leaveType} leave has been ${status}${reviewNote ? `: ${reviewNote}` : "."}`,
        refId        : populatedLeave._id,
      });
    }

    return res.json({ status: 1, message: `Leave ${status} successfully`, leave });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   CANCEL / DELETE LEAVE
   DELETE /api/leaves/:id
========================= */
const cancelLeave = async (req, res) => {
  try {
    const leave = await Leavemodel.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ status: 0, message: "Leave not found" });
    }

    // Only pending leaves can be cancelled
    if (leave.status !== "pending") {
      return res.json({ status: 0, message: "Only pending leaves can be cancelled" });
    }

    await Leavemodel.findByIdAndDelete(req.params.id);

    return res.json({ status: 1, message: "Leave cancelled successfully" });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

module.exports = {
  getAllLeaves,
  getMyLeaves,
  applyLeave,
  createLeave,
  approveLeave,
  cancelLeave,
};
