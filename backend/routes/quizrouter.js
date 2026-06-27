const express = require("express")
const { model } = require("mongoose")
const { Signup, Login, Find, setPassword, sendOtp, register, changePassword, updateProfile } = require("../controller/authcontroller")

const {  verifyOtp } = require("../controller/verification")
const { Ai } = require("../controller/Geminicontoller")
const { authMiddleware } = require("../middlewaer/authmiddlewear")


let Router = express.Router()

let authrouter = express.Router()

let verfiyRoute = express.Router()
let Findroute = express.Router()
let Airoute = express.Router()

authrouter.post("/register",register)
authrouter.post("/login",Login)
// ── ADD THESE TWO LINES to whichever file defines your authrouter ────────────
// (likely routes/quizrouter.js or routes/authRoutes.js)

authrouter.patch('/profile',  authMiddleware, updateProfile)
authrouter.patch('/password', authMiddleware, changePassword)


verfiyRoute.post('/auth/verify-otp',verifyOtp)
Findroute.post('/auth/findgmail',Find)
Findroute.post('/auth/reset-password',setPassword)
Airoute.post('/auth/Aiadd',Ai)
module.exports={authrouter,verfiyRoute,Findroute,Router,Airoute}