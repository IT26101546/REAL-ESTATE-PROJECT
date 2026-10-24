import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getInquiryById, updateInquiry } from '../../../api/inquiryApi';
import { getPropertyById } from '../../../api/propertyApi';
import { ArrowLeft, Save } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import './EditInquiryPage.css';

function EditInquiryPage() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [inquiry, setInquiry] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const data = await getInquiryById(id);
        if (data.status === 'ANSWERED') {
          showToast('Cannot edit answered inquiries. The seller has already replied.', 'error');
          navigate('/inquiries/my-inquiries');
          return;
        }

        if (user && data.buyerId && data.buyerId !== user.id && !isAdmin) {
          showToast('You can only edit your own inquiries.', 'error');
          navigate('/inquiries/my-inquiries');
          return;
        }

        setInquiry(data);
        setQuestion(data.question || '');

        if (data.propertyId) {
          try {
            const prop = await getPropertyById(data.propertyId);
            setProperty(prop);
          } catch (_) {
            // Non-critical property info fallback
          }
        }
      } catch (err) {
        showToast('Failed to load inquiry details.', 'error');
        navigate('/inquiries/my-inquiries');
      } finally {
        setLoading(false);
      }
    };
    fetchInquiry();
  }, [id, user, isAdmin, navigate, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (question.trim().length < 10) {
      setError('Question must be at least 10 characters.');
      return;
    }
    if (question.trim().length > 1000) {
      setError('Question must be at most 1000 characters.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await updateInquiry(id, { question: question.trim() });
      showToast('Inquiry question updated successfully!', 'success');
      navigate('/inquiries/my-inquiries');
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Failed to update inquiry. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading inquiry details..." />;

  return (
    <div className="edit-inquiry-page page-wrapper container">
      <div className="edit-inquiry-container">
        <div className="edit-inquiry-header" style={{ marginBottom: '2rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/inquiries/my-inquiries')}
            style={{ marginBottom: '1rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to My Inquiries</span>
          </button>
          <h1 className="page-title gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.35rem' }}>
            Edit Inquiry
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Update your unanswered question for the property seller
          </p>
        </div>

        {error && (
          <div className="error-banner glass-panel" style={{ padding: '1rem', color: 'var(--danger)', marginBottom: '1.5rem', borderRadius: '10px' }}>
            {error}
          </div>
        )}

        {inquiry && (
          <div className="property-context-card glass-panel" style={{ marginBottom: '1.5rem' }}>
            <p className="property-context-label">Inquiry Regarding Listing:</p>
            <p className="property-context-title">
              {property?.title || inquiry.propertyTitle || `Property #${inquiry.propertyId}`}
            </p>
            {(property?.location || property?.address) && (
              <p className="property-context-address">📍 {property.location || property.address}</p>
            )}
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Status: <span className="badge badge-pending">PENDING (Unanswered)</span>
            </p>
          </div>
        )}

        <form className="edit-inquiry-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="question">
              Updated Question <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              id="question"
              className={`form-control question-textarea${error ? ' form-control--error' : ''}`}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (error) setError('');
              }}
              rows={6}
              maxLength={1000}
              required
            />
            <div className="char-count-edit" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.35rem' }}>
              {question.length} / 1000 characters
            </div>
          </div>

          <div className="edit-inquiry-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/inquiries/my-inquiries')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <Save size={16} />
              <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditInquiryPage;
