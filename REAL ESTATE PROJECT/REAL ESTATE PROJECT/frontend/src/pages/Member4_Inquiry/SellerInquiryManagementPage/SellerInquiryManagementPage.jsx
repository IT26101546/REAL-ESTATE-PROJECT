import { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { getSellerInquiries, replyToInquiry } from '../../../api/inquiryApi';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/EmptyState/EmptyState';
import './SellerInquiryManagementPage.css';

function SellerInquiryManagementPage() {
  const { showToast } = useToast();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  // replyDrafts stores the text for each inquiry reply by id
  const [replyDrafts, setReplyDrafts] = useState({});
  // openReplies tracks which inquiry has the reply form open
  const [openReplies, setOpenReplies] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await getSellerInquiries();
      setInquiries(data);
    } catch (err) {
      showToast('Failed to load inquiries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleReplyDraftChange = (id, value) => {
    setReplyDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const toggleReplyForm = (id, existingResponse) => {
    setOpenReplies((prev) => ({ ...prev, [id]: !prev[id] }));
    if (existingResponse && !replyDrafts[id]) {
      setReplyDrafts((prev) => ({ ...prev, [id]: existingResponse }));
    }
  };

  const handleSubmitReply = async (inquiryId) => {
    const response = (replyDrafts[inquiryId] || '').trim();
    if (!response) {
      showToast('Reply cannot be empty.', 'error');
      return;
    }
    setSubmittingId(inquiryId);
    try {
      const updated = await replyToInquiry(inquiryId, { response });
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === inquiryId ? { ...inq, ...updated, status: 'ANSWERED', response } : inq))
      );
      setOpenReplies((prev) => ({ ...prev, [inquiryId]: false }));
      showToast('Reply submitted successfully.', 'success');
    } catch (err) {
      showToast('Failed to submit reply.', 'error');
    } finally {
      setSubmittingId(null);
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="seller-inquiry-page page-wrapper container">
      <div className="seller-inquiry-header">
        <h1 className="page-title">Inquiry Management</h1>
        <p className="page-subtitle">Answer buyer questions about your properties.</p>
      </div>

      {inquiries.length === 0 ? (
        <EmptyState
          title="No Inquiries"
          message="You have not received any inquiries on your properties yet."
        />
      ) : (
        <div className="inquiry-management-list">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="inquiry-management-card">
              <div className="inquiry-property-label">
                {inquiry.propertyTitle || 'Property'}
              </div>

              <div className="inquiry-buyer-info">
                <span className="buyer-name">
                  <strong>Buyer:</strong> {inquiry.buyerName || inquiry.buyerEmail || 'Unknown'}
                </span>
                <span className="inquiry-date">{formatDate(inquiry.createdAt)}</span>
                <span className={`badge badge-${inquiry.status?.toLowerCase()}`}>
                  {inquiry.status}
                </span>
              </div>

              <div className="inquiry-question-block">
                <p className="inquiry-question-label">Question:</p>
                <p className="inquiry-question-text">{inquiry.question}</p>
              </div>

              {inquiry.status === 'ANSWERED' && inquiry.response && !openReplies[inquiry.id] && (
                <div className="existing-response-box">
                  <p className="existing-response-label">Your Response:</p>
                  <p className="existing-response-text">{inquiry.response}</p>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => toggleReplyForm(inquiry.id, inquiry.response)}
                  >
                    Update Reply
                  </button>
                </div>
              )}

              {(inquiry.status === 'PENDING' || openReplies[inquiry.id]) && (
                <div className="reply-form-inline">
                  <label className="reply-form-label">
                    {inquiry.status === 'ANSWERED' ? 'Update your response:' : 'Write a reply:'}
                  </label>
                  <textarea
                    className="reply-textarea"
                    rows={4}
                    value={replyDrafts[inquiry.id] || ''}
                    onChange={(e) => handleReplyDraftChange(inquiry.id, e.target.value)}
                    placeholder="Type your response to the buyer..."
                  />
                  <div className="reply-form-actions">
                    {openReplies[inquiry.id] && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setOpenReplies((prev) => ({ ...prev, [inquiry.id]: false }))}
                        disabled={submittingId === inquiry.id}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSubmitReply(inquiry.id)}
                      disabled={submittingId === inquiry.id}
                    >
                      {submittingId === inquiry.id ? 'Submitting...' : 'Submit Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerInquiryManagementPage;
