const express = require("express");
const { authMiddleware } = require("../middlewaer/authmiddlewear");
const {
  getMyAttendance,
  clockIn,
  clockOut,
  getAllAttendance,
} = require("../controller/attendanceController");

const attendanceRouter = express.Router();

// GET  /api/attendance/my       → employee sees their own attendance
attendanceRouter.get("/my",       authMiddleware, getMyAttendance);

// POST /api/attendance/clock-in  → employee clocks in
attendanceRouter.post("/clock-in",  authMiddleware, clockIn);

// POST /api/attendance/clock-out → employee clocks out
attendanceRouter.post("/clock-out", authMiddleware, clockOut);

// GET  /api/attendance           → HR/Admin sees all attendance records
attendanceRouter.get("/",         authMiddleware, getAllAttendance);

module.exports = { attendanceRouter };
