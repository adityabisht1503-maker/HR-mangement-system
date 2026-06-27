const jwt = require("jsonwebtoken");
const { Passwordmodel } = require("../model/Password");
require("dotenv").config()

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Session expired! please Login again"
      });
    }

    const token = authHeader.split(" ")[1];


    // SAME secret you used in Login
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
    

    const user = await Passwordmodel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = user; // 🔑 THIS IS THE KEY
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = {authMiddleware};
