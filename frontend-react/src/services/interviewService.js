import api from "./api";

export const getInterviewQuestions = async (jdText) => {
  const response = await api.post("/interview/questions", { jdText });
  return response.data;
};

export const evaluateInterviewAnswers = async (questions, answers) => {
  const response = await api.post("/interview/evaluate", { questions, answers });
  return response.data;
};

export const getInterviewChatResponse = async (jdText, chatHistory, turnCount) => {
  const response = await api.post("/interview/chat", { jdText, chatHistory, turnCount });
  return response.data;
};

export const evaluateInterviewChat = async (chatHistory, deliveryMetrics) => {
  const response = await api.post("/interview/evaluate-chat", { chatHistory, deliveryMetrics });
  return response.data;
};
