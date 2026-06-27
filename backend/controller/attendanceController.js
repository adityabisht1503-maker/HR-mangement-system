const { Attendancemodel } = require("../model/Attendance");
const { Employeemodel }   = require("../model/Employee");

/* ── helpers ─────────────────────────────────────────────────── */
// Strip time from a date so we can match just the calendar day
const startOfDay = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};
const endOfDay = (d) => {
  const date = new Date(d);
  date.setHours(23, 59, 59, 999);
  return date;
};

/* =========================
   GET MY ATTENDANCE
   GET /api/attendance/my
========================= */
const getMyAttendance = async (req, res) => {
  try {
    const employee = await Employeemodel.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ status: 0, message: "Employee profile not found" });
    }

    const attendance = await Attendancemodel.find({ employee: employee._id })
      .sort({ date: -1 })
      .limit(90);   // last 90 days

    return res.json({ status: 1, message: "Attendance fetched", attendance });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   CLOCK IN
   POST /api/attendance/clock-in
========================= */
const clockIn = async (req, res) => {
  try {
    const employee = await Employeemodel.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ status: 0, message: "Employee profile not found" });
    }

    const today = new Date();

    // Check if already clocked in today
    const existing = await Attendancemodel.findOne({
      employee: employee._id,
      date: { $gte: startOfDay(today), $lte: endOfDay(today) },
    });

    if (existing && existing.clockIn) {
      return res.json({ status: 0, message: "Already clocked in today" });
    }

    // Determine status (late if after 09:30)
    const hour   = today.getHours();
    const minute = today.getMinutes();
    const isLate = hour > 9 || (hour === 9 && minute > 30);

    let attendance;

    if (existing) {
      // Update existing record
      existing.clockIn = today;
      existing.status  = isLate ? "late" : "present";
      await existing.save();
      attendance = existing;
    } else {
      attendance = new Attendancemodel({
        employee: employee._id,
        date:     startOfDay(today),
        clockIn:  today,
        status:   isLate ? "late" : "present",
      });
      await attendance.save();
    }

    return res.json({
      status: 1,
      message: "Clocked in successfully",
      attendance,
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   CLOCK OUT
   POST /api/attendance/clock-out
========================= */
const clockOut = async (req, res) => {
  try {
    const employee = await Employeemodel.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ status: 0, message: "Employee profile not found" });
    }

    const today = new Date();

    const attendance = await Attendancemodel.findOne({
      employee: employee._id,
      date: { $gte: startOfDay(today), $lte: endOfDay(today) },
    });

    if (!attendance || !attendance.clockIn) {
      return res.json({ status: 0, message: "You have not clocked in today" });
    }

    if (attendance.clockOut) {
      return res.json({ status: 0, message: "Already clocked out today" });
    }

    attendance.clockOut    = today;
    attendance.hoursWorked = parseFloat(
      ((today - attendance.clockIn) / (1000 * 60 * 60)).toFixed(2)
    );

    await attendance.save();

    return res.json({
      status: 1,
      message: "Clocked out successfully",
      attendance,
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   GET ALL ATTENDANCE (HR/Admin)
   GET /api/attendance?employeeId=&date=
========================= */
const getAllAttendance = async (req, res) => {
  try {
    const { employeeId, date, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (employeeId) filter.employee = employeeId;
    if (date) {
      const d = new Date(date);
      filter.date = { $gte: startOfDay(d), $lte: endOfDay(d) };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Attendancemodel.countDocuments(filter);

    const attendance = await Attendancemodel.find(filter)
      .populate({
        path: "employee",
        select: "personalInfo employeeCode",
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      status: 1,
      message: "Attendance fetched",
      attendance,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

module.exports = { getMyAttendance, clockIn, clockOut, getAllAttendance };
