const mongoose = require("mongoose")

const departmentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Departmentmodel = mongoose.model("Department", departmentSchema);

module.exports = { Departmentmodel };
