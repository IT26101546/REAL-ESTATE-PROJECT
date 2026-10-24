import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getBookingById, getMyPayments, updateBookingDetails, updateBookingStatus, deleteBooking } from '../../../api/bookingPaymentApi';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import './BookingDetailsPage.css';

function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isSeller } = useAuth();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Cancel / Delete modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const bookingData = await getBookingById(id);
        setBooking(bookingData);
        setEditDate(bookingData.bookingDate || bookingData.startDate || '');
        setEditNotes(bookingData.notes || '');

        try {
          const payments = await getMyPayments();
          const linked = Array.isArray(payments)
            ? payments.find((p) => String(p.bookingId) === String(id))
            : null;
          setPayment(linked || null);
        } catch {
          // payments not critical
        }
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to load booking details.';
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, showToast]);

  function formatCurrency(amount) {
    if (amount == null) return '—';
    return `LKR ${Number(amount || 0).toLocaleString('en-US')}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  function getStatusBadgeClass(status) {
    const map = {
      PENDING_APPROVAL: 'badge-pending_approval',
      APPROVED: 'badge-approved',
      REJECTED: 'badge-rejected',
      CANCELLED: 'badge-cancelled',
      CONFIRMED: 'badge-completed',
      COMPLETED: 'badge-completed',
    };
    return map[status] || 'badge-pending';
  }

  function getPaymentBadgeClass(status) {
    const map = {
      COMPLETED: 'badge-completed',
      PENDING: 'badge-pending',
      FAILED: 'badge-failed',
    };
    return map[status] || 'badge-pending';
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editDate) {
      showToast('Please select a valid viewing date.', 'error');
      return;
    }
    setUpdating(true);
    try {
      const updated = await updateBookingDetails(id, {
        bookingDate: editDate,
        notes: editNotes
      });
      setBooking((prev) => ({ ...prev, ...updated, bookingDate: editDate, notes: editNotes }));
      setIsEditing(false);
      showToast('Booking details updated successfully.', 'success');
    } catch (err) {
      const msg = err?.data?.message || err?.response?.data?.message || err?.message || 'Failed to update booking.';
      showToast(msg, 'error');
    } finally {
      setUpdating(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await updateBookingStatus(id, { status: 'CANCELLED' });
      setBooking((prev) => ({ ...prev, status: 'CANCELLED' }));
      showToast('Booking cancelled.', 'success');
      setCancelModalOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to cancel booking.';
      showToast(msg, 'error');
    } finally {
      setCancelling(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteBooking(id);
      showToast('Booking deleted.', 'success');
      navigate('/bookings/my-bookings');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete booking.';
      showToast(msg, 'error');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  }

  const STATUS_STEPS = ['PENDING_APPROVAL', 'APPROVED', 'CONFIRMED'];

  function getStepState(step, currentStatus) {
    if (currentStatus === 'REJECTED' || currentStatus === 'CANCELLED') {
      return step === 'PENDING_APPROVAL' ? 'done' : 'inactive';
    }
    const idx = STATUS_STEPS.indexOf(step);
    const currentIdx = STATUS_STEPS.indexOf(currentStatus);
    if (idx < currentIdx) return 'done';
    if (idx === currentIdx) return 'active';
    return 'inactive';
  }

  if (loading) return <LoadingSpinner message="Loading booking details..." />;

  if (!booking) {
    return (
      <div className="booking-details-page page-wrapper container">
        <div className="booking-details-container glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p className="form-error">Booking not found.</p>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/bookings/my-bookings')}>
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  const reservationFee =
    booking.reservationFee ?? Math.max((booking.property?.price ?? booking.propertyPrice ?? 0) * 0.02, 250);

  const isBuyerOwner = user && (user.id === booking.buyerId || isAdmin);
  const isPending = booking.status === 'PENDING_APPROVAL';
  const isApproved = booking.status === 'APPROVED';
  const isCancelledOrRejected = booking.status === 'CANCELLED' || booking.status === 'REJECTED';

  return (
    <div className="booking-details-page page-wrapper container">
      <div className="booking-details-container">
        <div className="booking-details-header">
          <button type="button" className="btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
            ← Back
          </button>
          <div className="booking-details-header__title">
            <h1 className="gradient-text">Booking Details</h1>
            <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
              {booking.status?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        {booking.status !== 'REJECTED' && booking.status !== 'CANCELLED' && (
          <div className="status-timeline">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className={`status-timeline__step status-timeline__step--${getStepState(step, booking.status)}`}>
                <div className="status-timeline__dot" />
                <span className="status-timeline__label">{step.replace('_', ' ')}</span>
                {i < STATUS_STEPS.length - 1 && <div className="status-timeline__line" />}
              </div>
            ))}
          </div>
        )}

        {isCancelledOrRejected && (
          <div className="status-timeline status-timeline--cancelled" style={{ padding: '1rem', background: 'rgba(220, 38, 38, 0.08)', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'var(--danger-color)' }}>
              This booking reservation was <strong>{booking.status.toLowerCase()}</strong>.
            </p>
          </div>
        )}

        <div className="details-grid">
          {/* Property Info */}
          <div className="detail-section glass-panel">
            <h2 className="detail-section__title">Property Information</h2>
            <div className="detail-row">
              <span className="detail-row__label">Title</span>
              <span className="detail-row__value">
                <Link to={`/properties/${booking.propertyId || booking.property?.id}`} style={{ color: 'var(--primary-accent)', fontWeight: 600 }}>
                  {booking.propertyTitle || booking.property?.title || '—'}
                </Link>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Location</span>
              <span className="detail-row__value">
                {booking.propertyLocation || booking.property?.location || booking.property?.address || '—'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Listed Price</span>
              <span className="detail-row__value">
                {formatCurrency(booking.property?.price ?? booking.propertyPrice)}
              </span>
            </div>
          </div>

          {/* Booking Info */}
          <div className="detail-section glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 className="detail-section__title" style={{ margin: 0 }}>Booking Information</h2>
              {isBuyerOwner && isPending && !isEditing && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Request
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveEdit} style={{ marginTop: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="editBookingDate">
                    Preferred Viewing Date *
                  </label>
                  <input
                    id="editBookingDate"
                    type="date"
                    className="form-control"
                    min={new Date().toISOString().split('T')[0]}
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="editBookingNotes">
                    Notes
                  </label>
                  <textarea
                    id="editBookingNotes"
                    className="form-control"
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Update notes or questions for the owner..."
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={updating}>
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)} disabled={updating}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="detail-row">
                  <span className="detail-row__label">Booking ID</span>
                  <span className="detail-row__value">{booking.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-row__label">Viewing Date</span>
                  <span className="detail-row__value">{formatDate(booking.bookingDate || booking.startDate)}</span>
                </div>
                {booking.endDate && (
                  <div className="detail-row">
                    <span className="detail-row__label">End Date</span>
                    <span className="detail-row__value">{formatDate(booking.endDate)}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-row__label">Submitted On</span>
                  <span className="detail-row__value">{formatDateTime(booking.createdAt)}</span>
                </div>
                {booking.notes && (
                  <div className="detail-row">
                    <span className="detail-row__label">Notes</span>
                    <span className="detail-row__value">{booking.notes}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Seller Info */}
          <div className="detail-section glass-panel">
            <h2 className="detail-section__title">Seller Information</h2>
            <div className="detail-row">
              <span className="detail-row__label">Seller Name</span>
              <span className="detail-row__value">
                {booking.sellerName || booking.seller?.name || '—'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Seller Email</span>
              <span className="detail-row__value">
                {booking.sellerEmail || booking.seller?.email || '—'}
              </span>
            </div>
          </div>

          {/* Fee & Payment Status */}
          <div className="detail-section glass-panel">
            <h2 className="detail-section__title">Reservation & Payment</h2>
            <div className="detail-row">
              <span className="detail-row__label">Reservation Fee (2%)</span>
              <span className="detail-row__value detail-row__value--highlight">
                {formatCurrency(reservationFee)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-row__label">Payment Status</span>
              <span className="detail-row__value">
                <span className={`badge ${(booking.paymentStatus || 'UNPAID') === 'PAID' ? 'badge-completed' : (booking.paymentStatus || '').includes('PENDING') ? 'badge-warning' : 'badge-pending'}`} style={(booking.paymentStatus || '').includes('PENDING') ? { background: '#f59e0b', color: '#fff' } : {}}>
                  {booking.paymentStatus || 'UNPAID'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls for Booking */}
        <div className="booking-control-actions" style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0', flexWrap: 'wrap' }}>
          {isBuyerOwner && !isCancelledOrRejected && (booking.paymentStatus || 'UNPAID') !== 'PAID' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/payments/pay?bookingId=${booking.id}`)}
            >
              💳 Pay Reservation Fee ({formatCurrency(reservationFee)})
            </button>
          )}

          {isBuyerOwner && !isCancelledOrRejected && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Update Booking
            </button>
          )}

          {isBuyerOwner && !isCancelledOrRejected && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setCancelModalOpen(true)}
            >
              Cancel Reservation
            </button>
          )}

          {isCancelledOrRejected && isBuyerOwner && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setDeleteModalOpen(true)}
            >
              🗑️ Delete Record
            </button>
          )}
        </div>

        {/* Payment Section */}
        <div className="payment-section glass-panel">
          <h2 className="payment-section__title">Payment Status</h2>
          {payment ? (
            <div className="payment-section__content">
              <div className="detail-row">
                <span className="detail-row__label">Payment Method</span>
                <span className="detail-row__value">{payment.paymentMethod?.replace('_', ' ')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-row__label">Amount Paid</span>
                <span className="detail-row__value">{formatCurrency(payment.amount)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-row__label">Payment Status</span>
                <span className={`badge ${getPaymentBadgeClass(payment.status)}`}>
                  {payment.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-row__label">Payment Date</span>
                <span className="detail-row__value">{formatDateTime(payment.createdAt || payment.paymentDate)}</span>
              </div>
              {payment.status === 'COMPLETED' && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => navigate(`/payments/receipt/${payment.id}`)}
                >
                  View Receipt
                </button>
              )}
            </div>
          ) : (
            <div className="payment-section__empty">
              {booking.status === 'APPROVED' ? (
                <>
                  <p>Your booking has been approved by the seller! Please complete the simulated reservation deposit payment.</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate(`/payments/pay?bookingId=${booking.id}`)}
                  >
                    Pay Now — {formatCurrency(reservationFee)}
                  </button>
                </>
              ) : booking.status === 'CONFIRMED' ? (
                <p>Reservation confirmed and paid.</p>
              ) : (
                <p>No payment has been processed for this booking. Payment opens once the seller approves your request.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {cancelModalOpen && (
        <ConfirmModal
          isOpen={true}
          title="Cancel Booking"
          message={`Are you sure you want to cancel your booking for "${booking.propertyTitle || 'this property'}"?`}
          confirmLabel="Yes, Cancel"
          onConfirm={handleCancel}
          onCancel={() => setCancelModalOpen(false)}
          loading={cancelling}
          danger={true}
        />
      )}

      {deleteModalOpen && (
        <ConfirmModal
          isOpen={true}
          title="Delete Booking Record"
          message="Are you sure you want to delete this cancelled/rejected booking record? This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteModalOpen(false)}
          loading={deleting}
          danger={true}
        />
      )}
    </div>
  );
}

export default BookingDetailsPage;
