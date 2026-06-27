const express = require("express");
const { authMiddleware } = require("../middlewaer/authmiddlewear");
const {
  getMyPayslips,
  getAllPayroll,
  createPayslip,
  markAsPaid,
} = require("../controller/payrollController");

const payrollRouter = express.Router();

// GET  /api/payroll/my       → employee sees their own payslips
payrollRouter.get("/my",       authMiddleware, getMyPayslips);

// GET  /api/payroll           → HR/Admin sees all payroll
payrollRouter.get("/",         authMiddleware, getAllPayroll);

// POST /api/payroll           → HR creates a payslip
payrollRouter.post("/",        authMiddleware, createPayslip);

// PUT  /api/payroll/:id/pay   → HR marks payslip as paid
payrollRouter.put("/:id/pay",  authMiddleware, markAsPaid);

module.exports = { payrollRouter };
