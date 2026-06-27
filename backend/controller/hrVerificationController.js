const { Employeemodel } = require("../model/Employee");
const { Passwordmodel } = require("../model/Password");
const { hrmail } = require("../service/hrmail");
const { createNotification } = require("./notificationController");

/* =========================
   GET ALL PENDING VERIFICATION REQUESTS
   GET /api/hr/verifications?status=pending
========================= */
const getVerificationRequests = async (req, res) => {
  try {
    const { status = "pending" } = req.query;

    let filter = {};

    if (status === "pending") {
      filter = { isVerified: true, hrVerified: false };
    } else if (status === "approved") {
      filter = { hrVerified: true };
    } else if (status === "all") {
      filter = { isVerified: true };
    }

    const users = await Passwordmodel.find(filter)
      .select("-password -otp -otpExpiresAt")
      .sort({ createdAt: -1 });

    return res.json({
      status: 1,
      message: "Verification requests fetched",
      users,
      count: users.length,
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   APPROVE A USER (HR Verify)
   PUT /api/hr/verifications/:id/approve
========================= */
const approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Passwordmodel.findById(id);
    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    if (user.hrVerified) {
      return res.json({ status: 0, message: "User is already approved" });
    }

    user.hrVerified = true;
    await user.save();
   await hrmail(user, true);

    // Create skeleton Employee record after HR approves
    const existingEmployee = await Employeemodel.findOne({ user: user._id });
    console.log("Existing employee:", existingEmployee);
    if (!existingEmployee) {
      const emp = await Employeemodel.create({
        user: user._id,
        personalInfo: {
          firstName: user.name,
          lastName: "",
          email: user.email,
        },
        status: "active",
      });
      console.log("Employee created:", emp);
    }

    // Notify the employee their account is approved
    await createNotification({
      recipientId  : user._id,
      recipientRole: "employee",
      type         : "request_approved",
      message      : "Your account has been verified and approved by HR. You can now log in.",
      refId        : user._id,
    });

    return res.json({
      status: 1,
      message: `${user.name} has been approved successfully`,
      user: {
        _id       : user._id,
        name      : user.name,
        email     : user.email,
        role      : user.role,
        hrVerified: user.hrVerified,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   REJECT / DELETE A USER REQUEST
   DELETE /api/hr/verifications/:id/reject
========================= */
const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Passwordmodel.findById(id);
    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    // Notify before deleting so the record still exists
    await createNotification({
      recipientId  : user._id,
      recipientRole: "employee",
      type         : "request_rejected",
      message      : "Your verification request was rejected by HR. Please contact support.",
      refId        : user._id,
    });
await hrmail(user, false);
    await Passwordmodel.findByIdAndDelete(id);

    return res.json({
      status: 1,
      message: `${user.name}'s request has been rejected and removed`,
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   REVOKE APPROVAL
   PUT /api/hr/verifications/:id/revoke
========================= */
const revokeUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Passwordmodel.findById(id);
    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    if (!user.hrVerified) {
      return res.json({ status: 0, message: "User is not approved yet" });
    }

    user.hrVerified = false;
    await user.save();

    return res.json({
      status: 1,
      message: `${user.name}'s approval has been revoked`,
      user: {
        _id       : user._id,
        name      : user.name,
        email     : user.email,
        role      : user.role,
        hrVerified: user.hrVerified,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   GET STATS
   GET /api/hr/verifications/stats
========================= */
const getVerificationStats = async (req, res) => {
  try {
    const [pending, approved, total] = await Promise.all([
      Passwordmodel.countDocuments({ isVerified: true, hrVerified: false }),
      Passwordmodel.countDocuments({ hrVerified: true }),
      Passwordmodel.countDocuments({ isVerified: true }),
    ]);

    return res.json({
      status: 1,
      stats: { pending, approved, total, rejected: total - approved - pending },
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

module.exports = {
  getVerificationRequests,
  approveUser,
  rejectUser,
  revokeUser,
  getVerificationStats,
};
