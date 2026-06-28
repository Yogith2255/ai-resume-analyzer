const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const interviewController = require("../controllers/interviewController");

router.post("/questions", authMiddleware, interviewController.generateQuestions);
router.post("/evaluate", authMiddleware, interviewController.evaluateAnswers);
router.post("/chat", authMiddleware, interviewController.chatTurn);
router.post("/evaluate-chat", authMiddleware, interviewController.evaluateChatHistory);

module.exports = router;
