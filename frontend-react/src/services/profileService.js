import api from "./api";

export const getProfileSkills = async () => {
  const response = await api.get("/profile/skills");
  return response.data;
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  
  const response = await api.post("/profile/resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

export const addProfileSkill = async (skillName) => {
  const response = await api.post("/profile/skills", { skillName });
  return response.data;
};

export const deleteProfileSkill = async (skillName) => {
  const response = await api.delete(`/profile/skills/${encodeURIComponent(skillName)}`);
  return response.data;
};
