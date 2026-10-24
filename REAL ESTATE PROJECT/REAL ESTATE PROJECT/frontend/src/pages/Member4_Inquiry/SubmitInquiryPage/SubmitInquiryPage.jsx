import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { createInquiry } from '../../../api/inquiryApi';
import { getPropertyById, getProperties } from '../../../api/propertyApi';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import './SubmitInquiryPage.css';

function SubmitInquiryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyIdParam = searchParams.get('propertyId');

  const [property, setProperty] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
  const [selectedPropId, setSelectedPropId] = useState(propertyIdParam || '');
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const propsRes = await getProperties();
        const list = Array.isArray(propsRes) ? propsRes : (propsRes?.data || []);
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
        showToast('Failed to load property details.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [propertyIdParam, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPropId) {
      setError('Please select a property to inquire about.');
      return;
    }
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
      await createInquiry({ propertyId: selectedPropId, question: question.trim() });
      showToast('Inquiry submitted successfully!', 'success');
      navigate('/inquiries/my-inquiries');
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Failed to submit inquiry. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Preparing inquiry form..." />;

  return (
    <div className="submit-inquiry-page page-wrapper container">
      <div className="submit-inquiry-container">
        <div className="submit-inquiry-header" style={{ marginBottom: '2rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(-1)}
            style={{ marginBottom: '1rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <h1 className="page-title gradient-text" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.35rem' }}>
            Submit an Inquiry
          </h1>
          <p className="page-subtitle" style={{ textAlign: 'center', margin: 0 }}>
            Ask questions directly to the property seller
          </p>
        </div>

        {error && (
          <div className="error-banner glass-panel" style={{ padding: '1rem', color: 'var(--danger)', marginBottom: '1.5rem', borderRadius: '10px' }}>
            {error}
          </div>
        )}

        {propertyIdParam && property ? (
          <div className="property-context-card glass-panel">
            <p className="property-context-label">Inquiry Regarding Listing:</p>
            <p className="property-context-title">{property.title}</p>
            {(property.location || property.address) && (
              <p className="property-context-address">📍 {property.location || property.address}</p>
            )}
          </div>
        ) : (
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="selectProperty">
              Select Property to Inquire About <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <select
              id="selectProperty"
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
                  {p.title} ({p.location || 'Real Estate'})
                </option>
              ))}
            </select>

            {property && (
              <div className="property-context-card glass-panel" style={{ marginTop: '1.25rem' }}>
                <p className="property-context-label">Selected Property:</p>
                <p className="property-context-title">{property.title}</p>
                {(property.location || property.address) && (
                  <p className="property-context-address">📍 {property.location || property.address}</p>
                )}
              </div>
            )}
          </div>
        )}

        <form className="inquiry-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="question">
              Your Question <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              id="question"
              className={`form-control question-textarea${error ? ' form-control--error' : ''}`}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (error) setError('');
              }}
              placeholder="Type your question about this property, e.g., viewing times, parking, utilities, maintenance fee..."
              rows={6}
              maxLength={1000}
              required
            />
            <div className="char-count">
              {question.length} / 1000 characters
            </div>
          </div>

          <div className="inquiry-form-actions">
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
              <Send size={16} />
              <span>{submitting ? 'Submitting...' : 'Submit Inquiry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubmitInquiryPage;
