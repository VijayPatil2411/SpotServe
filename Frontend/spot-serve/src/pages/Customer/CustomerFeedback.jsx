import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { submitFeedback, getJobDetailsForFeedback } from "../../services/feedbackService";
import { useToast } from "../../components/Toast";
import "./CustomerFeedback.css";

const CustomerFeedback = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [jobDetails, setJobDetails] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const data = await getJobDetailsForFeedback(jobId);

      if (data.alreadySubmitted) {
        showToast("✅ You have already submitted feedback for this job.", "info");
        setTimeout(() => navigate("/customer/dashboard"), 2000);
        return;
      }

      setJobDetails(data);
    } catch (error) {
      showToast(error.message || "❌ Error loading job details", "error");
      setTimeout(() => navigate("/customer/dashboard"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      showToast("⚠️ Please select a rating", "warning");
      return;
    }

    if (!comment.trim()) {
      showToast("⚠️ Please add a comment", "warning");
      return;
    }

    setSubmitting(true);

    try {
      await submitFeedback(jobId, rating, comment);
      showToast("✅ Thank you for your feedback!", "success");
      setSubmitted(true);

      setTimeout(() => {
        navigate("/customer/dashboard");
      }, 2000);
    } catch (error) {
      showToast(error.message || "❌ Error submitting feedback", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="feedback-container">
        <div className="feedback-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="feedback-container">
        <div className="feedback-success-message">
          <div className="success-icon">✓</div>
          <h2>Thank You!</h2>
          <p>Your feedback has been submitted successfully.</p>
          <p className="text-muted">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <div className="feedback-header">
          <h2>Rate Your Experience</h2>
          <p className="text-muted">Help us improve our service</p>
        </div>

        {jobDetails && (
          <div className="job-info">
            <div className="info-row">
              <span className="label">Service:</span>
              <span className="value">{jobDetails.serviceName}</span>
            </div>
            <div className="info-row">
              <span className="label">Mechanic:</span>
              <span className="value">{jobDetails.mechanicName}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="feedback-form">
          {/* Star Rating */}
          <div className="form-group">
            <label className="form-label">Rating *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${
                    star <= (hoverRating || rating) ? "active" : ""
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${star} stars`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="rating-text">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Comment Box */}
          <div className="form-group">
            <label htmlFor="comment" className="form-label">
              Your Feedback *
            </label>
            <textarea
              id="comment"
              className="form-control"
              rows="5"
              placeholder="Tell us about your experience with the mechanic..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <small className="text-muted">
              {comment.length}/500 characters
            </small>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/customer/dashboard")}
              disabled={submitting}
            >
              Skip for Now
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || rating === 0 || !comment.trim()}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFeedback;
