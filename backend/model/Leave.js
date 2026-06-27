const mongoose = require("mongoose")

const leaveSchema = mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    leaveType: {
      type: String,
      enum: ["annual", "sick", "casual", "unpaid", "maternity", "paternity"],
      required: true,
    },

    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },

    totalDays: { type: Number, default: 0 },

    reason: { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Login",
      default: null,
    },

    reviewNote: { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto-calculate totalDays before saving
leaveSchema.pre("save", function (next) {
  if (this.startDate && this.endDate) {
    const diff = this.endDate - this.startDate;
    this.totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

const Leavemodel = mongoose.model("Leave", leaveSchema);

module.exports = { Leavemodel };
