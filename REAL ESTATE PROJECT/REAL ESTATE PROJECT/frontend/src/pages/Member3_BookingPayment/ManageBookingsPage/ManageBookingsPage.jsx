import { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { getSellerBookings, updateBookingStatus } from '../../../api/bookingPaymentApi';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/EmptyState/EmptyState';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import './ManageBookingsPage.css';

function ManageBookingsPage() {
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getSellerBookings()
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => showToast('Failed to load bookings.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  function formatCurrency(amount) {
    if (amount == null) return '—';
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

  function calcReservationFee(price) {
    if (!price) return 0;
    return Math.max(price * 0.02, 250);
  }

  function getStatusBadgeClass(status) {
    const map = {
      PENDING_APPROVAL: 'badge-pending_approval',
      APPROVED: 'badge-approved',
      REJECTED: 'badge-rejected',
      CANCELLED: 'badge-cancelled',
      COMPLETED: 'badge-completed',
    };
    return map[status] || 'badge-pending';
  }

  async function handleApprove(bookingId) {
    setActionLoading(true);
    try {
      await updateBookingStatus(bookingId, { status: 'APPROVED' });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'APPROVED' } : b))
      );
      showToast('Booking approved successfully.', 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to approve booking.';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      await updateBookingStatus(rejectTarget.id, { status: 'REJECTED' });
      setBookings((prev) =>
        prev.map((b) => (b.id === rejectTarget.id ? { ...b, status: 'REJECTED' } : b))
      );
      showToast('Booking rejected.', 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to reject booking.';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
      setRejectTarget(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="manage-bookings-page page-wrapper container">
      <div className="manage-bookings-header">
        <h1 className="page-title gradient-text" style={{ fontSize: '2.5rem', textAlign: 'left', marginBottom: '0.35rem' }}>Manage Bookings</h1>
        <p className="page-subtitle" style={{ textAlign: 'left', margin: '0 0 2rem' }}>
          Review and respond to client booking requests for your properties
        </p>
      </div>

      {bookings.length === 0 ? (
        <EmptyState message="No booking requests received yet." />
      ) : (
        <div className="bookings-table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Buyer</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reservation Fee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const fee =
                  booking.reservationFee ??
                  calcReservationFee(booking.property?.price ?? booking.propertyPrice ?? 0);
                const isPending = booking.status === 'PENDING_APPROVAL';
                const isApproved = booking.status === 'APPROVED';

                return (
                  <tr
                    key={booking.id}
                    className={isApproved ? 'booking-row-approved' : ''}
                  >
                    <td className="bookings-table__property">
                      {booking.propertyTitle || booking.property?.title || '—'}
                    </td>
                    <td>{booking.buyerName || booking.buyer?.name || '—'}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{formatDate(booking.startDate)}</td>
                    <td>{formatDate(booking.endDate)}</td>
                    <td>{formatCurrency(fee)}</td>
                    <td>
                      <div className="action-buttons">
                        {isPending && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={actionLoading}
                              onClick={() => handleApprove(booking.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              disabled={actionLoading}
                              onClick={() => setRejectTarget(booking)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {isApproved && (
                          <span className="already-approved-label">✔ Already Approved</span>
                        )}
                        {!isPending && !isApproved && (
                          <span className="no-action-label">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rejectTarget && (
        <ConfirmModal
          title="Reject Booking"
          message={`Are you sure you want to reject the booking from "${rejectTarget.buyerName || rejectTarget.buyer?.name || 'this buyer'}" for "${rejectTarget.propertyTitle || rejectTarget.property?.title || 'this property'}"?`}
          confirmLabel="Yes, Reject"
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

export default ManageBookingsPage;
