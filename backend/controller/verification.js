const bcrypt = require("bcryptjs");
const { Passwordmodel } = require("../model/Password");

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await Passwordmodel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, user.otp);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    res.json({ status: 1, message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports={verifyOtp}