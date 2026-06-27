const mongoose = require("mongoose")

const employeeSchema = mongoose.Schema(
  {
    // Link to the auth user (Passwordmodel)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Login",
      required: true,
      unique: true,
    },

    employeeCode: {
      type: String,
      unique: true,
      trim: true,
    },

    personalInfo: {
      firstName: { type: String, required: true, trim: true },
      // In Employee model
lastName: { type: String, required: false, trim: true }, // ✅
      email:     { type: String, required: true, lowercase: true, trim: true },
      phone:     { type: String, trim: true },
      address:   { type: String, trim: true },
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
    },

    jobInfo: {
      title:      { type: String, trim: true },
      department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
      hireDate:   { type: Date, default: Date.now },
      employmentType: {
        type: String,
        enum: ["full_time", "part_time", "contract", "intern"],
        default: "full_time",
      },
      salary: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ["active", "inactive", "on_leave", "terminated"],
      default: "active",
    },

    performanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-generate employee code before saving
employeeSchema.pre("save", async function (next) {
  if (!this.employeeCode) {
    const count = await mongoose.model("Employee").countDocuments();
    this.employeeCode = `EMP${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

const Employeemodel = mongoose.model("Employee", employeeSchema);

module.exports = { Employeemodel };
