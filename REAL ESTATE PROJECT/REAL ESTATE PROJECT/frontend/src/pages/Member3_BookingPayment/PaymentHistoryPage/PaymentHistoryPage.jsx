import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { getMyPayments, deletePayment } from '../../../api/bookingPaymentApi';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/EmptyState/EmptyState';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import './PaymentHistoryPage.css';

function PaymentHistoryPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getMyPayments()
      .then((data) => setPayments(Array.isArray(data) ? data : []))
      .catch(() => showToast('Failed to load payment history.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  function formatCurrency(amount) {
    if (amount == null) return '—';
    return `LKR ${Number(amount || 0).toLocaleString('en-US')}`;
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function shortId(id) {
    if (!id) return '—';
    const str = String(id);
    return str.length > 8 ? `...${str.slice(-6)}` : str;
  }

  function getStatusBadgeClass(status) {
    const map = {
      COMPLETED: 'badge-completed',
      PENDING: 'badge-pending',
      PENDING_COLLECTION: 'badge-warning',
      FAILED: 'badge-failed',
    };
    return map[status] || 'badge-pending';
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePayment(deleteTarget.id);
      setPayments((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast('Payment record deleted.', 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete payment.';
      showToast(msg, 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="payment-history-page page-wrapper container">
      <div className="payment-history-header">
        <h1 className="page-title gradient-text" style={{ fontSize: '2.5rem', textAlign: 'left', marginBottom: '0.35rem' }}>Payment History</h1>
        <p className="page-subtitle" style={{ textAlign: 'left', margin: '0 0 2rem' }}>All your reservation fee payments and transaction receipts</p>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          message="No payment records found."
          action={{ label: 'Browse Properties', onClick: () => navigate('/properties') }}
        />
      ) : (
        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Booking ID</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="payments-table__id" title={payment.id}>
                    #{shortId(payment.id)}
                  </td>
                  <td className="payments-table__id" title={payment.bookingId}>
                    #{shortId(payment.bookingId)}
                  </td>
                  <td>{payment.paymentMethod?.replace('_', ' ') || '—'}</td>
                  <td className="payment-amount">{formatCurrency(payment.amount)}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(payment.status)}`} style={payment.status === 'PENDING_COLLECTION' ? { background: '#f59e0b', color: '#fff' } : {}}>
                      {payment.status === 'PENDING_COLLECTION' ? 'PENDING CASH' : payment.status}
                    </span>
                  </td>
                  <td>{formatDateTime(payment.createdAt || payment.paymentDate)}</td>
                  <td>
                    <div className="payment-actions">
                      {(payment.status === 'COMPLETED' || payment.status === 'PENDING_COLLECTION') && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/payments/receipt/${payment.id}`)}
                        >
                          View Receipt
                        </button>
                      )}
                      {payment.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/payments/pay?bookingId=${payment.bookingId}`)}
                          >
                            Pay Now
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteTarget(payment)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      {payment.status === 'FAILED' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(payment)}
                        >
                          Delete
                        </button>
                      )}
                      {payment.status !== 'COMPLETED' && payment.status !== 'FAILED' && payment.status !== 'PENDING' && payment.status !== 'PENDING_COLLECTION' && (
                        <span className="no-action-label">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title="Delete Payment Record"
          message={`Are you sure you want to delete this ${deleteTarget.status?.toLowerCase() || ''} payment record (ID: #${shortId(deleteTarget.id)})? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
          danger={true}
        />
      )}
    </div>
  );
}

export default PaymentHistoryPage;
