const bcrypt = require("bcryptjs");
const db = require("../config/database");
const generateToken = require("../utils/generateToken");
const jwt = require("jsonwebtoken");

async function currentResume(userId) {
  const result = await db.query(
    `
    SELECT
      original_filename AS name,
      content_type AS "contentType",
      size_bytes AS size
    FROM resumes
    WHERE user_id = $1
    AND is_current = 1
    `,
    [userId]
  );
  return result.rows[0] || null;
}

async function userResponse(user) {
  const resume = await currentResume(user.id);
  return {
    user: {
      id: user.id,
      name: user.full_name,
      email: user.email
    },
    resume
  };
}

exports.register = async (req, res) => {
  try {
    const fullName = (req.body.fullName || "").trim();
    const email = (req.body.email || "")
      .trim()
      .toLowerCase();
    const password = req.body.password || "";

    if (
      !fullName ||
      !email ||
      password.length < 6
    ) {
      return res.status(400).json({
        error:
          "Enter a valid name, email and password."
      });
    }

    const existingUserResult = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    const existingUser = existingUserResult.rows[0];

    if (existingUser) {
      return res.status(409).json({
        error:
          "An account already exists with this email."
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const result = await db.query(
      `
      INSERT INTO users
      (full_name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, full_name, email
      `,
      [
        fullName,
        email,
        passwordHash
      ]
    );
    const user = result.rows[0];

    if (req.file) {
      await db.query(
        `
        INSERT INTO resumes
        (
          user_id,
          stored_filename,
          original_filename,
          content_type,
          size_bytes
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          user.id,
          req.file.filename,
          req.file.originalname,
          req.file.mimetype,
          req.file.size
        ]
      );
    }

    const token = generateToken(user.id);

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

    res.status(201).json(
      await userResponse(user)
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Registration failed"
    });
  }
};

exports.login = async (req, res) => {
  try {
    const email = (req.body.email || "")
      .trim()
      .toLowerCase();

    const password =
      req.body.password || "";

    const userResult = await db.query(
      `
      SELECT
        id,
        full_name,
        email,
        password_hash
      FROM users
      WHERE email = $1
      `,
      [email]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({
        error:
          "No account found with that email."
      });
    }

    const isValid =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!isValid) {
      return res.status(401).json({
        error: "Invalid password."
      });
    }

    const token = generateToken(user.id);

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
    res.json(await userResponse(user));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Login failed"
    });
  }
};

exports.me = async (req, res) => {
    res.json(await userResponse(req.user));
  };

exports.logout = async (_req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      });

  res.status(200).json({
    message: "Logged out successfully"
  });
};