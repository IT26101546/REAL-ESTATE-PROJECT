import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { createReview } from '../../../api/reviewApi';
import { getPropertyById, getProperties } from '../../../api/propertyApi';
import { Star, ArrowLeft, Send } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import './AddReviewPage.css';

function AddReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyIdParam = searchParams.get('propertyId');
  const { user } = useAuth();
  const { showToast } = useToast();

  const [property, setProperty] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
  const [selectedPropId, setSelectedPropId] = useState(propertyIdParam || '');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const props = await getProperties();
        const list = Array.isArray(props) ? props : (props?.data || []);
        setAllProperties(list);

        if (propertyIdParam) {
          const prop = list.find((p) => p.id === propertyIdParam);
          if (prop) {
            setProperty(prop);
            setSelectedPropId(propertyIdParam);
          } else {
            const fetched = await getPropertyById(propertyIdParam);
            setProperty(fetched);
            setSelectedPropId(propertyIdParam);
          }
        } else if (list.length > 0) {
          setSelectedPropId(list[0].id);
          setProperty(list[0]);
        }
      } catch (err) {
        showToast('Failed to load property listing details.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [propertyIdParam, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPropId) {
      setError('Please select a property to review.');
      return;
    }
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
      await createReview({
        propertyId: selectedPropId,
        rating,
        comment: comment.trim()
      });
      showToast('Thank you! Your review has been submitted.', 'success');
      navigate('/reviews/my-reviews');
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Failed to submit review.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Preparing review form..." />;

  const starLabels = ['', '1 - Poor experience', '2 - Below average', '3 - Satisfactory', '4 - Very good property', '5 - Outstanding & exceptional!'];

  return (
    <div className="add-review-page page-wrapper container">
      <div className="add-review-container">
        <div className="add-review-header" style={{ marginBottom: '2rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(-1)}
            style={{ marginBottom: '1rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <h1 className="page-title gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.35rem' }}>
            Submit Property Feedback & Review
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Share your verified experience and property insights
          </p>
        </div>

        {error && (
          <div className="error-banner glass-panel" style={{ padding: '1rem', color: 'var(--danger)', marginBottom: '1.5rem', borderRadius: '10px' }}>
            {error}
          </div>
        )}

        <div className="form-card review-form-card">
          {propertyIdParam && property ? (
            <div className="reviewing-property-banner" style={{ marginBottom: '1.5rem' }}>
              <span className="banner-label">Reviewing Property:</span>
              <h3 className="banner-title" style={{ margin: '0.25rem 0' }}>{property.title}</h3>
              <span className="banner-location">📍 {property.location || property.address || 'Real Estate Listing'}</span>
            </div>
          ) : (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="selectPropertyToReview">
                Select Property to Review <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                id="selectPropertyToReview"
                className="form-control"
                value={selectedPropId}
                onChange={(e) => {
                  const chosenId = e.target.value;
                  setSelectedPropId(chosenId);
                  const found = allProperties.find((p) => p.id === chosenId);
                  setProperty(found);
                }}
              >
                {allProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.location || 'Listing'})
                  </option>
                ))}
              </select>

              {property && (
                <div className="reviewing-property-banner" style={{ marginTop: '1.25rem' }}>
                  <span className="banner-label">Selected Property:</span>
                  <h3 className="banner-title" style={{ margin: '0.25rem 0' }}>{property.title}</h3>
                  <span className="banner-location">📍 {property.location || property.address || 'Real Estate Listing'}</span>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Star Rating Section */}
            <div className="star-rating-group">
              <label className="form-label">
                Overall Rating (1 to 5 Stars) <span style={{ color: 'var(--danger)' }}>*</span>
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

            {/* Comment Area */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label" htmlFor="reviewComment">
                Written Feedback & Experience <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                id="reviewComment"
                className="form-control"
                rows={5}
                required
                placeholder="Describe property condition, neighborhood ambiance, broker responsiveness, amenities, etc..."
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
                <Send size={16} />
                <span>{submitting ? 'Submitting...' : 'Post Review'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export const AddReview = AddReviewPage;
export default AddReviewPage;
