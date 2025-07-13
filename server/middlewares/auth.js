const jwt = require("jsonwebtoken");
require("dotenv").config();


exports.isAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    // If no token in cookies, check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token)
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });

    const decoded = jwt.verify(token, process.env.JWT_SECRETS);
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


exports.isStudent = (req, res, next) => {
  if (req.user.role !== "Student") {
    return res.status(403).json({
      success: false,
      message: "Only Students can access this route",
    });
  }
  next();
};


exports.isTeacher = (req, res, next) => {
  if (req.user.role !== "Teacher") {
    return res.status(403).json({
      success: false,
      message: "Only Teachers can access this route",
    });
  }
  next();
};
