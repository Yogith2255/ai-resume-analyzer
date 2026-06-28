const bcrypt = require("bcryptjs");
const db = require("../config/database");
const generateToken = require("../utils/generateToken");
const jwt = require("jsonwebtoken");

function currentResume(userId) {
  return (
    db
      .prepare(
        `
        SELECT
          original_filename AS name,
          content_type AS contentType,
          size_bytes AS size
        FROM resumes
        WHERE user_id = ?
        AND is_current = 1
      `
      )
      .get(userId) || null
  );
}

function userResponse(user) {
  return {
    user: {
      id: user.id,
      name: user.full_name,
      email: user.email
    },
    resume: currentResume(user.id)
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

    const existingUser = db
      .prepare(
        "SELECT id FROM users WHERE email = ?"
      )
      .get(email);

    if (existingUser) {
      return res.status(409).json({
        error:
          "An account already exists with this email."
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const result = db
      .prepare(
        `
        INSERT INTO users
        (full_name, email, password_hash)
        VALUES (?, ?, ?)
      `
      )
      .run(
        fullName,
        email,
        passwordHash
      );

    const user = db
      .prepare(
        `
        SELECT id, full_name, email
        FROM users
        WHERE id = ?
      `
      )
      .get(result.lastInsertRowid);

    if (req.file) {
      db.prepare(
        `
        INSERT INTO resumes
        (
          user_id,
          stored_filename,
          original_filename,
          content_type,
          size_bytes
        )
        VALUES (?, ?, ?, ?, ?)
      `
      ).run(
        user.id,
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size
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
      userResponse(user)
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

    const user = db
      .prepare(
        `
        SELECT
          id,
          full_name,
          email,
          password_hash
        FROM users
        WHERE email = ?
      `
      )
      .get(email);

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
    res.json(userResponse(user));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Login failed"
    });
  }
};

exports.me = async (req, res) => {
    res.json(userResponse(req.user));
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