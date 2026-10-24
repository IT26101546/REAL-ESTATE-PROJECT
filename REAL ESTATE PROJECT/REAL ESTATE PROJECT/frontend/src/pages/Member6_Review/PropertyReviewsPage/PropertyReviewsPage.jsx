import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getPropertyReviews, deleteReview } from '../../../api/reviewApi';
import { getPropertyById } from '../../../api/propertyApi';
import { Star, MessageSquare, Plus, ArrowLeft, Building, Calendar, User } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/EmptyState/EmptyState';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import './PropertyReviewsPage.css';

export default function PropertyReviewsPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [summary, setSummary] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [sumData, propData] = await Promise.allSettled([
          getPropertyReviews(propertyId),
          getPropertyById(propertyId)
        ]);

        if (sumData.status === 'fulfilled') {
          setSummary(sumData.value);
        }
        if (propData.status === 'fulfilled') {
          setProperty(propData.value);
        }
      } catch (err) {
        setError('Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [propertyId]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteReview(deleteTarget.id);
      showToast('Review removed successfully.', 'success');
      setSummary((prev) => {
        if (!prev) return prev;
        const updatedReviews = (prev.reviews || []).filter((r) => r.id !== deleteTarget.id);
        const newTotal = updatedReviews.length;
        const newAvg = newTotal > 0 ? updatedReviews.reduce((acc, r) => acc + r.rating, 0) / newTotal : 0;
        return {
          ...prev,
          reviews: updatedReviews,
          totalReviews: newTotal,
          averageRating: newAvg
        };
      });
    } catch (err) {
      showToast(err.message || 'Failed to delete review.', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading customer reviews..." />;

  const reviews = summary?.reviews || [];
  const avg = summary?.averageRating || 0;
  const count = summary?.totalReviews || reviews.length;

  return (
    <div className="property-reviews-page page-wrapper container">
      <div className="property-reviews-container">
        <div className="reviews-header-row">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/properties/${propertyId}`)}>
            <ArrowLeft size={16} />
            <span>Back to Property</span>
          </button>
          <div className="reviews-header-titles">
            <h1 className="page-title">Ratings & Customer Reviews</h1>
            <p className="page-subtitle">Verified feedback and ratings from buyers and tenants.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!isAuthenticated) navigate('/login');
              else navigate(`/reviews/add?propertyId=${propertyId}`);
            }}
          >
            <Plus size={16} />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Property Brief Card */}
        {property && (
          <div className="property-brief-card">
            <Building size={20} className="brief-icon" />
            <div className="brief-info">
              <span className="brief-label">Reviews for:</span>
              <Link to={`/properties/${property.id}`} className="brief-title">
                {property.title}
              </Link>
              <span className="brief-location">{property.location}</span>
            </div>
          </div>
        )}

        {/* Overall Rating Score Card */}
        <div className="rating-overview-card">
          <div className="big-rating-score">
            <span className="score-number">{avg > 0 ? avg.toFixed(1) : '—'}</span>
            <div className="score-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={22}
                  fill={star <= Math.round(avg) ? '#f97316' : 'none'}
                  color="#f97316"
                />
              ))}
            </div>
            <span className="score-meta">Based on {count} review{count === 1 ? '' : 's'}</span>
          </div>

          <div className="rating-stats-note">
            <p>
              Verified user reviews help buyers and tenants evaluate property listings and broker responsiveness accurately.
            </p>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={48} />}
            title="No reviews yet"
            message="No feedback has been submitted for this property listing yet. Be the first to share your thoughts!"
            action={{
              label: 'Write First Review',
              onClick: () => {
                if (!isAuthenticated) navigate('/login');
                else navigate(`/reviews/add?propertyId=${propertyId}`);
              }
            }}
          />
        ) : (
          <div className="reviews-cards-list">
            {reviews.map((rev) => (
              <div key={rev.id} className="review-card">
                <div className="review-card-top">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="reviewer-name">{rev.userName || 'Verified User'}</h4>
                      <span className="review-date">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>

                  <div className="review-rating-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        fill={s <= rev.rating ? '#f97316' : 'none'}
                        color="#f97316"
                      />
                    ))}
                    <span className="rating-num-badge">{rev.rating}/5</span>
                  </div>
                </div>

                <p className="review-comment-text">{rev.comment}</p>

                {(user?.id === rev.userId || isAdmin) && (
                  <div className="review-card-actions" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {user?.id === rev.userId && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/reviews/edit/${rev.id}`)}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteTarget(rev)}
                    >
                      {isAdmin && user?.id !== rev.userId ? 'Remove (Admin)' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {deleteTarget && (
          <ConfirmModal
            isOpen={true}
            title={isAdmin && user?.id !== deleteTarget.userId ? 'Remove Inappropriate Review' : 'Delete Review'}
            message={`Are you sure you want to delete this review by ${deleteTarget.userName || 'user'}? This action cannot be undone.`}
            confirmLabel="Delete Review"
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
            danger={true}
          />
        )}
      </div>
    </div>
  );
}
