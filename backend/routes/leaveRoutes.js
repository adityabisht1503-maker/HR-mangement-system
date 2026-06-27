const express = require("express");
const { authMiddleware } = require("../middlewaer/authmiddlewear");
const {
  getAllLeaves,
  getMyLeaves,
  applyLeave,
  createLeave,
  approveLeave,
  cancelLeave,
} = require("../controller/leaveController");

const leaveRouter = express.Router();

// NOTE: /my and /apply come BEFORE /:id

// GET    /api/leaves/my          → employee sees their own leaves
leaveRouter.get("/my",           authMiddleware, getMyLeaves);

// POST   /api/leaves/apply       → employee applies for leave (self-service)
leaveRouter.post("/apply",       authMiddleware, applyLeave);

// GET    /api/leaves             → HR/Admin sees all leaves
leaveRouter.get("/",             authMiddleware, getAllLeaves);

// POST   /api/leaves             → HR creates leave on behalf of employee
leaveRouter.post("/",            authMiddleware, createLeave);

// PUT    /api/leaves/:id/approve → HR approves or rejects leave
leaveRouter.put("/:id/approve",  authMiddleware, approveLeave);

// DELETE /api/leaves/:id         → cancel/delete a pending leave
leaveRouter.delete("/:id",       authMiddleware, cancelLeave);

module.exports = { leaveRouter };
