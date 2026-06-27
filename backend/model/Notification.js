const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    // Who receives this notification (the Login/Passwordmodel user)
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Login",
      required: true,
    },

    // Role-based filter so frontend can query by role easily
    recipientRole: {
      type: String,
      enum: ["admin", "employee"],
      required: true,
    },

    // Notification category — drives icon + colour on frontend
    type: {
      type: String,
      enum: [
        // HR / admin receives these
        "leave_request",      // employee applied for leave
        "new_request",        // employee submitted a verification / HR request
        "new_employee",       // a new employee profile was created

        // Employee receives these
        "leave_approved",     // HR approved their leave
        "leave_rejected",     // HR rejected their leave
        "payroll_credited",   // HR marked their payslip as paid
        "request_approved",   // HR approved their verification request
        "request_rejected",   // HR rejected their verification request
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional: link to the related document so frontend can navigate
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    is_read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notificationmodel = mongoose.model("Notification", notificationSchema);

module.exports = { Notificationmodel };
