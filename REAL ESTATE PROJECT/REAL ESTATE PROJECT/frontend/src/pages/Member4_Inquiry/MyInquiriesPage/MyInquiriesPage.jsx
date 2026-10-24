import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getMyInquiries, deleteInquiry } from '../../../api/inquiryApi';
import { Plus, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/EmptyState/EmptyState';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import './MyInquiriesPage.css';

function MyInquiriesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyInquiries();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Failed to load your inquiries.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInquiry(deleteTarget.id);
      showToast('Inquiry deleted successfully.', 'success');
      setDeleteTarget(null);
      await fetchInquiries(); // Refresh the list after successful delete
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Failed to delete inquiry.';
      showToast(msg, 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner message="Loading your inquiries..." />;

  return (
    <div className="my-inquiries-page page-wrapper container">
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}
      >
        <div>
          <h1 className="page-title gradient-text" style={{ fontSize: '2.5rem', textAlign: 'left', marginBottom: '0.35rem' }}>
            My Inquiries
          </h1>
          <p className="page-subtitle" style={{ textAlign: 'left', margin: '0' }}>
            Questions you have submitted about properties and seller responses
          </p>
        </div>
        <Link to="/inquiries/create" className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>New Inquiry</span>
        </Link>
      </div>

      {inquiries.length === 0 ? (
        <EmptyState
          title="No Inquiries Yet"
          message="You haven't submitted any inquiries yet. Ask questions to property owners directly."
          action={{
            label: 'New Inquiry',
            onClick: () => navigate('/inquiries/create')
          }}
          actionLabel="New Inquiry"
          onAction={() => navigate('/inquiries/create')}
        />
      ) : (
        <div className="inquiries-list">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="inquiry-card">
              <div className="inquiry-meta">
                <Link
                  to={`/properties/${inquiry.propertyId}`}
                  className="inquiry-property-link"
                >
                  {inquiry.propertyTitle || `Property #${inquiry.propertyId}`}
                </Link>
                <span className={`badge badge-${inquiry.status?.toLowerCase()}`}>
                  {inquiry.status}
                </span>
                <span className="inquiry-date">{formatDate(inquiry.createdAt)}</span>
              </div>

              <div className="inquiry-question-text">
                <strong>Your Question:</strong>
                <p>{inquiry.question}</p>
              </div>

              {inquiry.status === 'ANSWERED' && inquiry.response && (
                <div className="inquiry-response-box">
                  <p className="seller-response-label">
                    Seller Response {inquiry.answeredAt ? `(${formatDate(inquiry.answeredAt)})` : ''}:
                  </p>
                  <p className="seller-response-text">{inquiry.response}</p>
                </div>
              )}

              <div className="inquiry-actions">
                {inquiry.status === 'PENDING' && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/inquiries/edit/${inquiry.id}`)}
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setDeleteTarget(inquiry)}
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
          title="Delete Inquiry"
          message={`Are you sure you want to delete your inquiry regarding "${deleteTarget.propertyTitle || 'this property'}"? This action cannot be undone.`}
          confirmLabel="Delete Inquiry"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
          danger={true}
        />
      )}
    </div>
  );
}

export default MyInquiriesPage;
