const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const authController = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/register",
  upload.single("resume"),
  authController.register
);

router.post(
  "/login",
  authController.login
);

router.get(
    "/me",
    authMiddleware,
    authController.me
  );

router.post(
  "/logout",
  authController.logout
);

module.exports = router;