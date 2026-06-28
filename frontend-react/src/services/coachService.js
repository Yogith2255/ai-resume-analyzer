import api from "./api";

export const sendMessageToCoach = async (message, chatHistory = []) => {
  const response = await api.post("/chatbot/message", {
    message,
    chatHistory
  });
  return response.data;
};

export const analyzeJobDescription = async (jdText) => {
  const response = await api.post("/chatbot/analyze-jd", {
    jdText
  });
  return response.data;
};
