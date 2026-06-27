const { Departmentmodel } = require("../model/Department");

/* =========================
   GET ALL DEPARTMENTS
========================= */
const getAllDepartments = async (req, res) => {
  try {
    const departments = await Departmentmodel.find({ isActive: true })
    

    return res.json({
      status: 1,
      message: "Departments fetched successfully",
      departments,
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   CREATE DEPARTMENT
========================= */
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.json({ status: 0, message: "Department name is required" });
    }

    const existing = await Departmentmodel.findOne({ name });
    if (existing) {
      return res.json({ status: 0, message: "Department already exists" });
    }

    const department = new Departmentmodel({ name, description });
    await department.save();

    return res.json({
      status: 1,
      message: "Department created successfully",
      department,
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   DELETE DEPARTMENT
========================= */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    await Departmentmodel.findByIdAndUpdate(id, { isActive: false });

    return res.json({ status: 1, message: "Department deleted successfully" });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

module.exports = { getAllDepartments, createDepartment, deleteDepartment };
