const jwt = require("jsonwebtoken");
const db = require("../config/database");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        error: "Authentication required"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = db
      .prepare(
        "SELECT id, full_name, email FROM users WHERE id = ?"
      )
      .get(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: "User not found"
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid token"
    });
  }
};

module.exports = authMiddleware;