import api from "./api";

/**
 * Submit feedback for a job
 */
export const submitFeedback = async (jobId, rating, comment) => {
  try {
    const res = await api.post("/api/feedback", {
      jobId: parseInt(jobId),
      rating: rating,
      comment: comment.trim(),
    });
    return res.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to submit feedback";
    throw new Error(message);
  }
};

/**
 * Get job details for feedback form
 */
export const getJobDetailsForFeedback = async (jobId) => {
  try {
    const res = await api.get(`/api/feedback/job/${jobId}/details`);
    return res.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to load job details";
    throw new Error(message);
  }
};

/**
 * Check if feedback exists for a job
 */
export const checkFeedbackExists = async (jobId) => {
  try {
    const res = await api.get(`/api/feedback/job/${jobId}/exists`);
    return res.data.exists;
  } catch (error) {
    return false;
  }
};

/**
 * Get feedback for a mechanic
 */
export const getMechanicFeedback = async (mechanicId) => {
  try {
    const res = await api.get(`/api/feedback/mechanic/${mechanicId}`);
    return res.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to load feedback";
    throw new Error(message);
  }
};
