import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getMyReviews, deleteReview } from '../../../api/reviewApi';
import { Star, MessageSquare, Edit2, Trash2, Building, ExternalLink, Plus } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/EmptyState/EmptyState';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import './MyReviewsPage.css';

function MyReviewsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err?.data?.message || err?.message || 'Failed to load your reviews.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteReview(deleteTarget.id);
      showToast('Review deleted successfully.', 'success');
      setDeleteTarget(null);
      await fetchReviews(); // Refresh list after successful delete
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Failed to delete review.';
      showToast(msg, 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your reviews..." />;

  return (
    <div className="my-reviews-page page-wrapper container">
      <div className="my-reviews-container">
        <div
          className="my-reviews-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          <div>
            <h1 className="page-title gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.35rem' }}>
              My Feedback & Reviews
            </h1>
            <p className="page-subtitle" style={{ margin: 0 }}>
              Manage your verified ratings and comments across properties
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/properties" className="btn btn-secondary btn-sm">
              <Building size={16} />
              <span>Browse Properties</span>
            </Link>
            <Link to="/reviews/add" className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Add Review</span>
            </Link>
          </div>
        </div>

        {reviews.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={48} />}
            title="You haven't posted any reviews yet"
            message="Share your property experiences to help other buyers and renters on the platform."
            action={{
              label: 'Add Review',
              onClick: () => navigate('/reviews/add')
            }}
            actionLabel="Add Review"
            onAction={() => navigate('/reviews/add')}
          />
        ) : (
          <div className="my-reviews-grid">
            {reviews.map((rev) => (
              <div key={rev.id} className="my-review-card">
                <div className="my-review-top">
                  <div className="my-review-prop-info">
                    <Link to={`/properties/${rev.propertyId}`} className="my-review-property-link">
                      <span>Property #{rev.propertyId}</span>
                      <ExternalLink size={14} />
                    </Link>
                    <span className="my-review-date">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>

                  <div className="my-review-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        fill={s <= rev.rating ? '#f97316' : 'none'}
                        color="#f97316"
                      />
                    ))}
                    <span className="rating-badge-inline">{rev.rating} / 5</span>
                  </div>
                </div>

                <div className="my-review-comment-box">
                  <p>{rev.comment}</p>
                </div>

                <div className="my-review-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/reviews/edit/${rev.id}`)}
                  >
                    <Edit2 size={14} />
                    <span>Edit Review</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteTarget(rev)}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteTarget && (
          <ConfirmModal
            isOpen={true}
            title="Delete Review"
            message={`Are you sure you want to delete your review for Property #${deleteTarget.propertyId}? This will remove your rating and comments permanently.`}
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

export const MyReviews = MyReviewsPage;
export default MyReviewsPage;
