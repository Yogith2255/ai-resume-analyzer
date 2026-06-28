const aiService = require("../services/aiService");
const { getUserSkills } = require("../services/skillService");

exports.generateQuestions = async (req, res) => {
  try {
    const { jdText } = req.body;
    const userId = req.user.id;

    if (!jdText || jdText.trim() === "") {
      return res.status(400).json({ error: "Job description cannot be empty." });
    }

    const userSkills = getUserSkills(userId);
    const questions = await aiService.generateInterviewQuestions({
      userSkills,
      jdText
    });

    res.json({ questions });
  } catch (error) {
    console.error("Generate Questions Error:", error);
    res.status(500).json({
      error: "Failed to generate interview questions."
    });
  }
};

exports.evaluateAnswers = async (req, res) => {
  try {
    const { questions, answers, deliveryMetrics } = req.body;
    const userId = req.user.id;

    if (!questions || !answers || !Array.isArray(questions) || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Questions and answers must be arrays." });
    }

    const userSkills = getUserSkills(userId);
    const evaluation = await aiService.evaluateInterviewAnswers({
      questions,
      answers,
      userSkills,
      deliveryMetrics
    });

    res.json(evaluation);
  } catch (error) {
    console.error("Evaluate Answers Error:", error);
    res.status(500).json({
      error: "Failed to evaluate interview answers."
    });
  }
};

exports.chatTurn = async (req, res) => {
  try {
    const { jdText, chatHistory = [], turnCount = 0 } = req.body;
    const userId = req.user.id;

    if (!jdText || jdText.trim() === "") {
      return res.status(400).json({ error: "Job description cannot be empty." });
    }

    const userSkills = getUserSkills(userId);
    const reply = await aiService.generateInterviewChatResponse({
      jdText,
      chatHistory,
      userSkills,
      turnCount
    });

    res.json(reply);
  } catch (error) {
    console.error("Chat Turn Error:", error);
    res.status(500).json({
      error: "Failed to generate next conversational response."
    });
  }
};

exports.evaluateChatHistory = async (req, res) => {
  try {
    const { chatHistory, deliveryMetrics } = req.body;
    const userId = req.user.id;

    if (!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) {
      return res.status(400).json({ error: "Chat history must be a non-empty array." });
    }

    const userSkills = getUserSkills(userId);
    const evaluation = await aiService.evaluateInterviewChat({
      chatHistory,
      userSkills,
      deliveryMetrics
    });

    res.json(evaluation);
  } catch (error) {
    console.error("Evaluate Chat Error:", error);
    res.status(500).json({
      error: "Failed to evaluate conversational mock interview."
    });
  }
};
