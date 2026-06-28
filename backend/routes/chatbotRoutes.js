const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const chatbotController = require("../controllers/chatbotController");

router.post("/message", authMiddleware, chatbotController.sendMessage);
router.post("/analyze-jd", authMiddleware, chatbotController.analyzeJD);

module.exports = router;
