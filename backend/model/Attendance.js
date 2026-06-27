const mongoose = require("mongoose")

const attendanceSchema = mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    clockIn:  { type: Date, default: null },
    clockOut: { type: Date, default: null },

    hoursWorked: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["present", "absent", "late", "holiday", "half_day"],
      default: "present",
    },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// One attendance record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendancemodel = mongoose.model("Attendance", attendanceSchema);

module.exports = { Attendancemodel };
