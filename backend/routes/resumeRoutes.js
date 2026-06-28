const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const resumeController = require("../controllers/resumeController");

router.post(
  "/resume",
  authMiddleware,
  upload.single("resume"),
  resumeController.updateResume
);

module.exports = router;