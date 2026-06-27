const mongoose = require("mongoose")

const payrollSchema = mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    month: {
      type: Date,
      required: true,
    },

    basicSalary:  { type: Number, default: 0 },
    allowances:   { type: Number, default: 0 },
    deductions:   { type: Number, default: 0 },
    netSalary:    { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    paidAt: { type: Date, default: null },
    pdfUrl: { type: String, default: null },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Login",
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-calculate netSalary before saving
payrollSchema.pre("save", function (next) {
  this.netSalary = (this.basicSalary + this.allowances) - this.deductions;
  next();
});

const Payrollmodel = mongoose.model("Payroll", payrollSchema);

module.exports = { Payrollmodel };
