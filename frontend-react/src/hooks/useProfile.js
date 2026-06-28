import { useState, useEffect, useCallback } from "react";
import { getProfileSkills, uploadResume, addProfileSkill, deleteProfileSkill } from "../services/profileService";
import useAuth from "./useAuth";

export default function useProfile() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser } = useAuth();

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfileSkills();
      setSkills(data.skills || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch skills");
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadResumeFile = async (file) => {
    setUploading(true);
    setError(null);
    try {
      const data = await uploadResume(file);
      setSkills(data.skills || []);
      
      // Update resume metadata in AuthContext
      if (data.resume) {
        setUser(prev => prev ? { ...prev, resume: data.resume } : null);
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload and parse resume");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const addSkill = async (skillName) => {
    setError(null);
    try {
      const data = await addProfileSkill(skillName);
      setSkills(data.skills || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add skill");
      throw err;
    }
  };

  const removeSkill = async (skillName) => {
    setError(null);
    try {
      const data = await deleteProfileSkill(skillName);
      setSkills(data.skills || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete skill");
      throw err;
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return {
    skills,
    loading,
    uploading,
    error,
    refetchSkills: fetchSkills,
    uploadResumeFile,
    addSkill,
    removeSkill
  };
}
