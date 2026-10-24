import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getReviewById, updateReview } from '../../../api/reviewApi';
import { getPropertyById } from '../../../api/propertyApi';
import { Star, ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import './EditReviewPage.css';

function EditReviewPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [review, setReview] = useState(null);
  const [property, setProperty] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadReview() {
      try {
        const data = await getReviewById(id);
        if (!data) {
          showToast('Review not found.', 'error');
          navigate('/reviews/my-reviews');
          return;
        }

        if (user && data.userId && data.userId !== user.id && !isAdmin) {
          showToast('You are only authorized to edit your own reviews.', 'error');
          navigate('/reviews/my-reviews');
          return;
        }

        setReview(data);
        setRating(data.rating || 5);
        setComment(data.comment || '');

        if (data.propertyId) {
          try {
            const prop = await getPropertyById(data.propertyId);
            setProperty(prop);
          } catch (_) {
            // Non-critical property details
          }
        }
      } catch (err) {
        showToast(err?.data?.message || err?.message || 'Failed to load review.', 'error');
        navigate('/reviews/my-reviews');
      } finally {
        setLoading(false);
      }
    }
    loadReview();
  }, [id, user, isAdmin, navigate, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setError('Please write at least 5 characters of feedback.');
      return;
    }
    if (comment.trim().length > 1000) {
      setError('Review comment cannot exceed 1000 characters.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await updateReview(id, {
        propertyId: review.propertyId,
        rating,
        comment: comment.trim()
      });
      showToast('Review updated successfully!', 'success');
      navigate('/reviews/my-reviews');
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Failed to update review.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your review..." />;

  const starLabels = ['', '1 - Poor experience', '2 - Below average', '3 - Satisfactory', '4 - Very good property', '5 - Outstanding & exceptional!'];

  return (
    <div className="edit-review-page page-wrapper container">
      <div className="edit-review-container">
        <div className="edit-review-header" style={{ marginBottom: '2rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/reviews/my-reviews')}
            style={{ marginBottom: '1rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to My Reviews</span>
          </button>
          <h1 className="page-title gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.35rem' }}>
            Edit Your Review
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Update your rating and feedback for this property
          </p>
        </div>

        {error && (
          <div className="error-banner glass-panel" style={{ padding: '1rem', color: 'var(--danger)', marginBottom: '1.5rem', borderRadius: '10px' }}>
            {error}
          </div>
        )}

        <div className="form-card edit-review-card">
          {review && (
            <div className="reviewing-property-banner" style={{ marginBottom: '1.5rem' }}>
              <span className="banner-label">Reviewing Property:</span>
              <h3 className="banner-title" style={{ margin: '0.25rem 0' }}>
                {property?.title || `Property #${review.propertyId}`}
              </h3>
              {(property?.location || property?.address) && (
                <span className="banner-location">📍 {property.location || property.address}</span>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Rating Stars */}
            <div className="star-rating-group">
              <label className="form-label">
                Updated Rating (1 to 5 Stars) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div className="interactive-stars-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className="star-btn"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      size={32}
                      fill={(hoverRating || rating) >= star ? '#f97316' : 'none'}
                      color="#f97316"
                    />
                  </button>
                ))}
                <span className="star-text-label" style={{ marginLeft: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {starLabels[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label" htmlFor="editComment">
                Review Comment <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                id="editComment"
                className="form-control"
                rows={5}
                required
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (error) setError('');
                }}
                maxLength={1000}
              />
              <div className="char-counter" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.35rem' }}>
                {comment.length} / 1000 characters (min. 5)
              </div>
            </div>

            <div className="review-form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/reviews/my-reviews')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Save size={16} />
                <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export const EditReview = EditReviewPage;
export default EditReviewPage;
