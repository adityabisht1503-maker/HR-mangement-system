const express = require("express");
const { authMiddleware } = require("../middlewaer/authmiddlewear");
const {
  getAllDepartments,
  createDepartment,
  deleteDepartment,
} = require("../controller/departmentController");

const departmentRouter = express.Router();

// GET  /api/departments       → get all departments (authenticated)
departmentRouter.get("/",        authMiddleware, getAllDepartments);

// POST /api/departments       → create department (HR/Admin only)
departmentRouter.post("/create",       authMiddleware, createDepartment);

// DELETE /api/departments/:id → soft delete department
departmentRouter.delete("/delete/:id",  authMiddleware, deleteDepartment);

module.exports = { departmentRouter };
