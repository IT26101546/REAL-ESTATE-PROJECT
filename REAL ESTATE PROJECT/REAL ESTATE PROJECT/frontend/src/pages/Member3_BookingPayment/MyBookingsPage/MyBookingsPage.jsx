import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import {
  getMyBookings,
  updateBookingDetails,
  cancelBooking,
  deleteBooking
} from '../../../api/bookingPaymentApi';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/EmptyState/EmptyState';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import './MyBookingsPage.css';

function MyBookingsPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel booking modal state
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Delete booking modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Update booking modal state
  const [editTarget, setEditTarget] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Failed to load bookings.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  function formatCurrency(amount) {
    return `LKR ${Number(amount || 0).toLocaleString('en-US')}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function openEditModal(booking) {
    setEditTarget(booking);
    setEditDate(booking.bookingDate || (booking.startDate ? booking.startDate.split('T')[0] : ''));
    setEditNotes(booking.notes || '');
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editTarget) return;
    if (!editDate) {
      showToast('Preferred date is required.', 'error');
      return;
    }

    setUpdating(true);
    try {
      const updated = await updateBookingDetails(editTarget.id, {
        bookingDate: editDate,
        notes: editNotes.trim()
      });
      showToast('Booking updated successfully!', 'success');
      setBookings((prev) =>
        prev.map((b) => (b.id === editTarget.id ? { ...b, bookingDate: editDate, notes: editNotes.trim() } : b))
      );
      setEditTarget(null);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update booking.';
      showToast(msg, 'error');
    } finally {
      setUpdating(false);
    }
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelTarget.id);
      showToast('Booking cancelled successfully and reservation released.', 'success');
      // Refresh list to show accurate paymentStatus and status from backend
      await fetchBookings();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to cancel booking.';
      showToast(msg, 'error');
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBooking(deleteTarget.id);
      setBookings((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      showToast('Booking record deleted permanently.', 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete booking.';
      showToast(msg, 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function getBookingStatusBadge(status) {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge-completed">CONFIRMED</span>;
      case 'CANCELLED':
        return <span className="badge badge-cancelled">CANCELLED</span>;
      case 'APPROVED':
        return <span className="badge badge-approved">APPROVED</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected">REJECTED</span>;
      default:
        return <span className="badge badge-pending">{status?.replace('_', ' ') || 'ACTIVE'}</span>;
    }
  }

  function getPaymentStatusBadge(paymentStatus) {
    const ps = (paymentStatus || 'UNPAID').toUpperCase();
    switch (ps) {
      case 'PAID':
        return <span className="badge badge-completed">PAID</span>;
      case 'PENDING_COLLECTION':
        return <span className="badge badge-warning" style={{ background: '#f59e0b', color: '#fff' }}>PENDING COLLECTION (CASH)</span>;
      case 'REFUND_REVIEW':
        return <span className="badge" style={{ background: '#8b5cf6', color: '#fff' }}>REFUND REVIEW</span>;
      case 'CANCELLED':
        return <span className="badge badge-cancelled">CANCELLED</span>;
      case 'UNPAID':
      default:
        return <span className="badge badge-pending">UNPAID</span>;
    }
  }

  if (loading) return <LoadingSpinner message="Loading your bookings..." />;

  if (error) {
    return (
      <div className="my-bookings-page page-wrapper container">
        <div className="my-bookings-header">
          <h1 className="page-title gradient-text">My Bookings</h1>
          <p className="page-subtitle">Track and manage your property bookings and payments</p>
        </div>
        <div className="error-banner glass-panel" style={{ padding: '2rem', textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{error}</p>
          <button type="button" className="btn btn-primary" onClick={fetchBookings}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page page-wrapper container">
      <div className="my-bookings-header">
        <h1 className="page-title gradient-text">My Bookings</h1>
        <p className="page-subtitle">Track and manage your property bookings, dates, and reservation payments</p>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No Bookings Yet"
          message="You have no property reservation records yet. Browse available properties to book a reservation."
          action={{ label: 'Browse Properties', onClick: () => navigate('/properties') }}
        />
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'CANCELLED';
            const paymentStatus = (booking.paymentStatus || 'UNPAID').toUpperCase();
            const canPay = !isCancelled && paymentStatus !== 'PAID';
            const canUpdate = !isCancelled;
            const canCancel = !isCancelled;
            // Full CRUD delete requirement: separate Delete action ONLY for cancelled bookings without successful payment
            const canDelete = isCancelled && paymentStatus !== 'PAID' && paymentStatus !== 'PENDING_COLLECTION';

            return (
              <div className={`booking-card ${isCancelled ? 'booking-card--cancelled' : ''}`} key={booking.id}>
                {/* Header: ID, Property link, and Badges */}
                <div className="booking-card-header">
                  <div className="booking-status-section">
                    <span className="booking-id-tag">#{booking.id}</span>
                    <Link
                      className="booking-property-link"
                      to={`/properties/${booking.propertyId || booking.property?.id}`}
                    >
                      {booking.propertyTitle || booking.property?.title || 'Property'}
                    </Link>
                  </div>
                  <div className="booking-badges-row">
                    <div className="status-pair">
                      <span className="pair-label">Booking:</span>
                      {getBookingStatusBadge(booking.status)}
                    </div>
                    <div className="status-pair">
                      <span className="pair-label">Payment:</span>
                      {getPaymentStatusBadge(paymentStatus)}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="booking-details-grid">
                  <div className="booking-detail-item">
                    <span className="detail-label">Preferred Date</span>
                    <span className="detail-value">📅 {formatDate(booking.bookingDate || booking.startDate)}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Reservation Fee</span>
                    <span className="detail-value fee-highlight">{formatCurrency(booking.reservationFee)}</span>
                  </div>
                  <div className="booking-detail-item">
                    <span className="detail-label">Created</span>
                    <span className="detail-value">{formatDate(booking.createdAt)}</span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="booking-notes-box">
                    <strong>Notes:</strong> {booking.notes}
                  </div>
                )}

                {/* Notice for Refund Review if paid booking was cancelled */}
                {paymentStatus === 'REFUND_REVIEW' && (
                  <div className="refund-review-banner">
                    ⚠️ <strong>Requires Refund Review:</strong> This booking was cancelled after payment. An administrator will review your reservation deposit for manual refund processing.
                  </div>
                )}

                {/* Action Buttons */}
                <div className="booking-actions">
                  {canPay && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/payments/pay?bookingId=${booking.id}`)}
                    >
                      💳 Pay Now
                    </button>
                  )}

                  {canUpdate && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEditModal(booking)}
                    >
                      ✏️ Update Booking
                    </button>
                  )}

                  {canCancel && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setCancelTarget(booking)}
                    >
                      Cancel Booking
                    </button>
                  )}

                  {canDelete && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteTarget(booking)}
                    >
                      🗑️ Delete Record
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Update Booking Modal */}
      {editTarget && (
        <div className="modal-backdrop">
          <div className="modal-card glass-panel">
            <h2 className="modal-title">Update Booking #{editTarget.id}</h2>
            <p className="modal-subtitle">
              Updating preferred date or notes for <strong>{editTarget.propertyTitle || 'Property'}</strong>
            </p>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" htmlFor="editDate">
                  Preferred Date *
                </label>
                <input
                  id="editDate"
                  type="date"
                  className="form-control"
                  value={editDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="editNotes">
                  Notes / Requests
                </label>
                <textarea
                  id="editNotes"
                  className="form-control"
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Additional viewing requests or schedule adjustments..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditTarget(null)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {cancelTarget && (
        <ConfirmModal
          isOpen={true}
          title="Cancel Booking"
          message={`Are you sure you want to cancel booking #${cancelTarget.id} for "${cancelTarget.propertyTitle || 'this property'}"? Its reservation will be released back to the market.${(cancelTarget.paymentStatus || '').toUpperCase() === 'PAID' ? ' Note: As this booking was paid, it will be marked for refund review.' : ''}`}
          confirmLabel="Yes, Cancel Booking"
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
          loading={cancelling}
          danger={true}
        />
      )}

      {/* Delete Record Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title="Delete Booking Record"
          message={`Are you sure you want to permanently delete cancelled booking #${deleteTarget.id}? This will remove it completely from your history.`}
          confirmLabel="Delete Permanently"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
          danger={true}
        />
      )}
    </div>
  );
}

export default MyBookingsPage;
