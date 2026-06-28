const jwt = require("jsonwebtoken");
const db = require("../config/database");

const authMiddleware = async (req, res, next) => {
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

    const result = await db.query(
      "SELECT id, full_name, email FROM users WHERE id = $1",
      [decoded.userId]
    );
    const user = result.rows[0];

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