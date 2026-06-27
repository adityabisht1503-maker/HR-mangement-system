const express = require("express")
const mongoose = require("mongoose");

const { Router, verfiyRoute, Findroute, authrouter, Airoute } = require("./routes/quizrouter");
let cors = require("cors")

// ── HR module routes ──────────────────────────────────────────────────────────
const { employeeRouter }   = require("./routes/employeeRoutes");
const { leaveRouter }      = require("./routes/leaveRoutes");
const { attendanceRouter } = require("./routes/attendanceRoutes");
const { payrollRouter }    = require("./routes/payrollRoutes");
const { departmentRouter } = require("./routes/departmentRoutes");
const { aiRouter }         = require("./routes/aiRoutes");
const Hrrouter = require("./routes/HrRoutes");
const { notificationRouter } = require("./routes/notificationRoutes");
// ─────────────────────────────────────────────────────────────────────────────

let app = express();
require("dotenv").config()
app.use(cors())

app.use(express.json())
app.use("/api/auth",authrouter)
app.use("/",Router)

app.use("/api",verfiyRoute)
app.use("/api",Findroute)
app.use("/api",Airoute)
app.get("/get",(req,res)=>{
  res.send("hello")
})

// ── HR module endpoints ───────────────────────────────────────────────────────
app.use("/api/employees",   employeeRouter);
app.use("/api/leaves",      leaveRouter);
app.use("/api/attendance",  attendanceRouter);
app.use("/api/payroll",     payrollRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/ai",          aiRouter);
app.use("/api/hr",Hrrouter);
app.use("/api/notifications", notificationRouter);

// ─────────────────────────────────────────────────────────────────────────────

mongoose.connect(process.env.DBURL).then(()=>{
  console.log("connnected to mongoose");
  
   app.listen(process.env.PORT,()=>{
    console.log(`server is running on port http://localhost:${process.env.PORT}`);
    
   })
})
