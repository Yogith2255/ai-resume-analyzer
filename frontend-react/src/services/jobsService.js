import api from "./api";

export const getJobRecommendations = async () => {
  const response = await api.get("/jobs/recommendations");
  return response.data;
};
