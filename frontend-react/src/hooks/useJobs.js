import { useState, useEffect, useCallback } from "react";
import { getJobRecommendations } from "../services/jobsService";

export default function useJobs() {
  const [jobsSections, setJobsSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJobRecommendations();
      setJobsSections(data.sections || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch job recommendations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobsSections,
    loading,
    error,
    refetch: fetchJobs
  };
}
