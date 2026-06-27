const express = require("express");
const { authMiddleware } = require("../middlewaer/authmiddlewear");
const {
  getAllEmployees,
  getEmployeeStats,
  getMyProfile,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controller/employeeController");

const employeeRouter = express.Router();

// NOTE: /me and /stats must come BEFORE /:id so Express doesn't treat them as IDs

// GET  /api/employees/me      → logged-in employee's own profile
employeeRouter.get("/me",      authMiddleware, getMyProfile);

// GET  /api/employees/stats   → summary stats (HR/Admin)
employeeRouter.get("/stats",   authMiddleware, getEmployeeStats);

// GET  /api/employees         → list all employees with filters & pagination
employeeRouter.get("/",        authMiddleware, getAllEmployees);

// GET  /api/employees/:id     → single employee by ID
employeeRouter.get("/:id",     authMiddleware, getEmployeeById);

// POST /api/employees         → create employee profile
employeeRouter.post("/",       authMiddleware, createEmployee);

// PUT  /api/employees/:id     → update employee
employeeRouter.put("/:id",     authMiddleware, updateEmployee);
employeeRouter.delete("/:id", authMiddleware, deleteEmployee)
module.exports = { employeeRouter };
