const aiService = require("../services/aiService");
const { getUserSkills } = require("../services/skillService");
const { getRecommendations } = require("../services/recommendationService");
const extractSkills = require("../utils/extractSkills");
const calculateATSScore = require("../utils/atsCalculator");

exports.sendMessage = async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;
    const userId = req.user.id;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    // 1. Get user skills
    const userSkills = await getUserSkills(userId);

    // 2. Get recommendations to calculate ATS matching & gaps
    const currentJobs = await getRecommendations(userSkills);

    // 3. Generate response using AI Service
    const replyText = await aiService.generateCoachResponse({
      message,
      userSkills,
      currentJobs,
      chatHistory
    });

    res.json({
      response: replyText
    });
  } catch (error) {
    console.error("Chatbot Controller Error:", error);
    res.status(500).json({
      error: "An error occurred while generating coach feedback."
    });
  }
};

exports.analyzeJD = async (req, res) => {
  try {
    const { jdText } = req.body;
    const userId = req.user.id;

    if (!jdText || jdText.trim() === "") {
      return res.status(400).json({ error: "Job description text cannot be empty." });
    }

    // 1. Get user skills
    const userSkills = await getUserSkills(userId);

    // 2. Extract skills from the pasted JD
    const jdSkills = extractSkills(jdText);

    // 3. Compute ATS match
    const matchAnalysis = calculateATSScore(userSkills, jdSkills);

    // 4. Generate AI analysis response
    const coachingResponse = await aiService.generateJDCoachingResponse({
      userSkills,
      jdSkills,
      matchedSkills: matchAnalysis.matchedSkills,
      missingSkills: matchAnalysis.missingSkills
    });

    res.json({
      score: matchAnalysis.score,
      matchedSkills: matchAnalysis.matchedSkills,
      missingSkills: matchAnalysis.missingSkills,
      coachingResponse
    });
  } catch (error) {
    console.error("Analyze JD Controller Error:", error);
    res.status(500).json({
      error: "An error occurred while analyzing the job description."
    });
  }
};
