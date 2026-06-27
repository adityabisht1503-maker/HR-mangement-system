const mongoose = require("mongoose")

const passwordschema = mongoose.Schema({
    name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // No duplicate emails
    lowercase: true
  },
  role: {
    type: String,
    required:true,
  },
  password: {
    type: String,
    required: true
  },
  isVerified: { type: Boolean, default: false },
    hrVerified: { type: Boolean, default: false },
  // verificationToken: String
  otp: String,
  otpExpiresAt: Date,
   passwordChangedAt: Date,
   
}, { timestamps: true });

const Passwordmodel = mongoose.model("Login",passwordschema)

module.exports={Passwordmodel}
