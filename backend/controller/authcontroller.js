const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const crypto = require("crypto");
require("dotenv").config()

const { Passwordmodel } = require("../model/Password");

const {adminmail} = require("../service/adminmail");
const { Employeemodel } = require("../model/Employee");
const { notifyAllAdmins } = require("./notificationController");
const { sendVerificationEmail } = require("../service/nodemailer");

/* =========================
   UTILS
========================= */
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* =========================
   SIGNUP
========================= */
const register = async (req, res) => {
  try {
    const { name, email, password,role } = req.body;

    if (!validator.isEmail(email)) {
      return res.json({ status: 0, message: "Invalid email format" });
    }

    const existingUser = await Passwordmodel.findOne({ email });
    if (existingUser) {
      return res.json({ status: 0, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);

    const user = new Passwordmodel({
      name,
      email,
      password: hashedPassword,
      role,
      otp: hashedOtp,
      otpExpiresAt: Date.now() + 10 * 60 * 1000,
      isVerified: false,
      hrVerified:false,
    });

    await user.save();
    await sendVerificationEmail(email, otp);
    await adminmail(user);

    // Notify all admins that a new user registered and needs HR approval
    await notifyAllAdmins({
      type   : "new_request",
      message: `New registration: ${name} (${email}) is waiting for HR approval.`,
      refId  : user._id,
    });

    return res.json({
      status: 1,
      message: "Verification email sent",
    });
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: err.message,
    });
  }
};

/* =========================
   VERIFY OTP (SIGNUP / FORGOT)
========================= */


/* =========================
   LOGIN (FIXED)
========================= */
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Passwordmodel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 0,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        status: 0,
        message: "Please verify your email first",
      });
    }

    if (!user.hrVerified) {
      return res.status(400).json({
        status: 0,
        message: "Wait for HR approval",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({   // ✅ changed from 401 → 400 to avoid axios interceptor redirect
        status: 0,
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      status: 1,
      message: "Login successful",
      token,
    
      user: {
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: "Server error",
    });
  }
};

/* =========================
   FIND EMAIL (FORGOT PASSWORD)
========================= */
const Find = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Passwordmodel.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = hashedOtp;
    user.otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    user.isVerified = false;

    await user.save();
await sendVerificationEmail(email, otp);
    // TODO: send OTP via email
    console.log("📩 OTP:", otp);

    res.json({
      status: 1,
      message: "OTP sent to email",
    });
  } catch (err) {
    res.status(500).json({ status: 0, message: "Server error" });
  }
};



/* =========================
   RESET PASSWORD (SECURE)
========================= */
 const setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Passwordmodel.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(403).json({
        status: 0,
        message: "OTP verification required",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    user.password = hashed;
    user.passwordChangedAt = new Date();
    user.isVerified = true;

    await user.save();

    res.json({
      status: 1,
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({ status: 0, message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const user = await Passwordmodel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    if (email && email !== user.email) {
      const existing = await Passwordmodel.findOne({ email });
      if (existing) {
        return res.json({ status: 0, message: "Email already in use" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    await user.save();

    const employee = await Employeemodel.findOne({ user: req.user._id });
    if (employee) {
      if (name)  employee.personalInfo.firstName = name;
      if (email) employee.personalInfo.email     = email;
      if (phone) employee.personalInfo.phone     = phone;
      await employee.save();
    }

    return res.json({
      status: 1,
      message: "Profile updated successfully",
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        phone: employee?.personalInfo?.phone || null,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/* =========================
   CHANGE PASSWORD
   PATCH /api/auth/password
========================= */
const changePassword = async (req, res) => {
  try {
    const { current, password } = req.body;

    if (!current || !password) {
      return res.json({ status: 0, message: "Current and new password are required" });
    }

    if (password.length < 8) {
      return res.json({ status: 0, message: "Password must be at least 8 characters" });
    }

    const user = await Passwordmodel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 0, message: "User not found" });
    }

    const match = await bcrypt.compare(current, user.password);
    if (!match) {
      return res.status(401).json({ status: 0, message: "Current password is incorrect" });
    }

    user.password          = await bcrypt.hash(password, 10);
    user.passwordChangedAt = new Date();
    await user.save();

    return res.json({ status: 1, message: "Password changed successfully" });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

module.exports = {
  register,
  Login,
  Find,
  setPassword,
  updateProfile,   // ← add
  changePassword,  // ← add
};
 

/* =========================
   EXPORTS
========================= */
