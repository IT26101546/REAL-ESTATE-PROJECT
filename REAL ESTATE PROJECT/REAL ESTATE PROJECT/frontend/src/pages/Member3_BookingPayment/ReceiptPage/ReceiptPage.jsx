import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getPaymentReceipt, confirmCashPayment } from '../../../api/bookingPaymentApi';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import './ReceiptPage.css';

function ReceiptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmingCash, setConfirmingCash] = useState(false);

  useEffect(() => {
    getPaymentReceipt(id)
      .then((data) => setReceipt(data))
      .catch(() => {
        showToast('Failed to load receipt.', 'error');
      })
      .finally(() => setLoading(false));
  }, [id, showToast]);

  function formatCurrency(amount) {
    if (amount == null) return '—';
    return `LKR ${Number(amount || 0).toLocaleString('en-US')}`;
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function shortId(id) {
    if (!id) return '—';
    const str = String(id);
    return str.length > 10 ? str.slice(0, 8) + '...' : str;
  }

  async function handleAdminConfirmCash() {
    setConfirmingCash(true);
    try {
      await confirmCashPayment(receipt.paymentId);
      showToast('Cash payment confirmed! Marked as COMPLETED and booking marked PAID.', 'success');
      // Re-fetch updated receipt
      const updated = await getPaymentReceipt(id);
      setReceipt(updated);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to confirm cash payment.';
      showToast(msg, 'error');
    } finally {
      setConfirmingCash(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading receipt details..." />;

  if (!receipt) {
    return (
      <div className="receipt-page page-wrapper container">
        <div className="receipt-container">
          <p className="form-error">Receipt not found.</p>
          <Link to="/payments/history" className="btn btn-secondary">
            Back to Payment History
          </Link>
        </div>
      </div>
    );
  }

  const isPendingCollection = receipt.status === 'PENDING_COLLECTION';

  return (
    <div className="receipt-page page-wrapper container">
      <div className="receipt-container">
        <div className="receipt-header">
          {isPendingCollection ? (
            <>
              <div className="receipt-header__checkmark" style={{ background: '#f59e0b' }}>⏳</div>
              <h1 className="receipt-title">Cash Payment Pending</h1>
              <p className="receipt-header__subtitle">
                Reservation held. Please complete cash payment at our agency office.
              </p>
            </>
          ) : (
            <>
              <div className="receipt-header__checkmark">✓</div>
              <h1 className="receipt-title">Payment Confirmed</h1>
              <p className="receipt-header__subtitle">Your reservation deposit fee has been received.</p>
            </>
          )}
        </div>

        <div className="receipt-body">
          <p className="receipt-reference">
            Receipt Ref: <strong>#{shortId(receipt.paymentId)}</strong> (Txn: {receipt.transactionRef || '—'})
          </p>

          <div className="receipt-divider" />

          <div className="receipt-field-row">
            <span className="receipt-field-row__label">Payment Date / Initiation</span>
            <span className="receipt-field-row__value">{formatDateTime(receipt.paymentDate)}</span>
          </div>

          <div className="receipt-field-row">
            <span className="receipt-field-row__label">Property</span>
            <span className="receipt-field-row__value">{receipt.propertyTitle || '—'}</span>
          </div>

          <div className="receipt-field-row">
            <span className="receipt-field-row__label">Buyer</span>
            <span className="receipt-field-row__value">{receipt.buyerName || '—'}</span>
          </div>

          <div className="receipt-field-row">
            <span className="receipt-field-row__label">Payment Method</span>
            <span className="receipt-field-row__value" style={{ fontWeight: 600 }}>
              {receipt.paymentMethod === 'CASH' ? 'Cash (In-Person Collection)' : (receipt.paymentMethod?.replace('_', ' ') || '—')}
            </span>
          </div>

          <div className="receipt-field-row">
            <span className="receipt-field-row__label">Booking ID</span>
            <span className="receipt-field-row__value">#{receipt.bookingId}</span>
          </div>

          {receipt.notes && (
            <div className="receipt-field-row">
              <span className="receipt-field-row__label">Notes</span>
              <span className="receipt-field-row__value" style={{ fontStyle: 'italic' }}>{receipt.notes}</span>
            </div>
          )}

          <div className="receipt-divider" />

          <div className="receipt-total">
            <span className="receipt-total__label">{isPendingCollection ? 'Amount Due (Cash)' : 'Amount Paid'}</span>
            <span className="receipt-total__amount">{formatCurrency(receipt.amount)}</span>
          </div>

          <div className="receipt-status">
            {isPendingCollection ? (
              <span className="badge" style={{ background: '#f59e0b', color: '#fff', fontSize: '0.95rem', padding: '0.45rem 1rem' }}>
                ⏳ PENDING COLLECTION (CASH)
              </span>
            ) : (
              <span className="badge badge-completed" style={{ fontSize: '0.95rem', padding: '0.45rem 1rem' }}>
                ✓ {receipt.status || 'COMPLETED'}
              </span>
            )}
          </div>

          {/* Admin Cash Confirmation Action */}
          {isPendingCollection && (isAdmin || user?.role === 'ADMIN') && (
            <div
              className="admin-cash-confirm-panel"
              style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                background: 'rgba(217, 119, 6, 0.08)',
                border: '1px solid rgba(217, 119, 6, 0.3)',
                borderRadius: '12px',
                textAlign: 'center'
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#b45309', fontSize: '1.05rem' }}>
                Admin Cash Collection
              </h4>
              <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Click below once the physical cash of <strong>{formatCurrency(receipt.amount)}</strong> has been collected at the agency office.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAdminConfirmCash}
                disabled={confirmingCash}
                style={{ minWidth: '200px' }}
              >
                {confirmingCash ? 'Verifying...' : '✓ Confirm Cash Received'}
              </button>
            </div>
          )}
        </div>

        <div className="receipt-actions">
          <button className="btn btn-primary" onClick={() => window.print()}>
            🖨 Print Receipt
          </button>
          <Link to="/payments/history" className="btn btn-secondary">
            ← Payment History
          </Link>
          <Link to="/bookings/my-bookings" className="btn btn-secondary">
            My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ReceiptPage;
