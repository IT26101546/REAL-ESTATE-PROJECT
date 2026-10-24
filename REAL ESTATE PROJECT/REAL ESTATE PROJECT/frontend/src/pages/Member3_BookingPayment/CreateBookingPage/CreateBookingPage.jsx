import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { createBooking, getMyBookings } from '../../../api/bookingPaymentApi';
import { getPropertyById } from '../../../api/propertyApi';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import './CreateBookingPage.css';

function CreateBookingPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [property, setProperty] = useState(null);
  const [existingBooking, setExistingBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default to today or tomorrow
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!propertyId) {
      setError('No property selected. Please select a property to book.');
      setLoading(false);
      return;
    }

    Promise.allSettled([
      getPropertyById(propertyId),
      getMyBookings()
    ]).then(([propRes, bookRes]) => {
      if (propRes.status === 'fulfilled') {
        setProperty(propRes.value?.data ?? propRes.value);
      } else {
        setError('Failed to load property details.');
      }
      if (bookRes.status === 'fulfilled') {
        const bookings = Array.isArray(bookRes.value?.data ?? bookRes.value) ? (bookRes.value?.data ?? bookRes.value) : [];
        const found = bookings.find(
          (b) => b.propertyId === propertyId && b.status !== 'CANCELLED' && b.status !== 'REJECTED'
        );
        if (found) {
          setExistingBooking(found);
        }
      }
    }).finally(() => setLoading(false));
  }, [propertyId]);

  function formatCurrency(amount) {
    return `LKR ${Number(amount || 0).toLocaleString('en-US')}`;
  }

  function calcReservationFee(price) {
    return Math.max((price || 0) * 0.02, 250);
  }

  function validate() {
    const errors = {};
    if (!bookingDate) errors.bookingDate = 'Please select a preferred date.';
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSubmitting(true);

    const payload = {
      propertyId,
      bookingDate,
      notes: notes.trim()
    };

    try {
      await createBooking(payload);
      showToast('Property booked successfully! Reservation created with status UNPAID.', 'success');
      navigate('/bookings/my-bookings');
    } catch (err) {
      const msg = err?.data?.message || err?.response?.data?.message || err?.message || 'Failed to book property.';
      showToast(msg, 'error');
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('conflict')) {
        try {
          const bookings = await getMyBookings();
          const list = Array.isArray(bookings?.data ?? bookings) ? (bookings?.data ?? bookings) : [];
          const found = list.find(
            (b) => b.propertyId === propertyId && b.status !== 'CANCELLED' && b.status !== 'REJECTED'
          );
          if (found) {
            setExistingBooking(found);
          }
        } catch (_) {}
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading property details..." />;

  if (error) {
    return (
      <div className="create-booking-page page-wrapper container">
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
          <p className="form-error" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>{error}</p>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/properties')}>
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const reservationFee = property ? calcReservationFee(property.price) : 0;

  return (
    <div className="create-booking-page page-wrapper container">
      <div className="create-booking-container">
        <div className="create-booking-header">
          <h1 className="create-booking-title page-title gradient-text">Book Property</h1>
          <p className="page-subtitle">Direct reservation — secures your booking immediately with payment status UNPAID</p>
        </div>

        {existingBooking && (
          <div
            className="existing-booking-alert glass-panel"
            style={{
              padding: '1.25rem',
              marginBottom: '1.5rem',
              borderLeft: '4px solid #f59e0b',
              background: 'rgba(217, 119, 6, 0.08)',
              borderRadius: '12px'
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#b45309', fontSize: '1.1rem' }}>
              Active Reservation Already Exists
            </h3>
            <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              You already have an active booking for this property: <strong>#{existingBooking.id}</strong> (Status: {existingBooking.status?.replace('_', ' ')} / Payment: {existingBooking.paymentStatus || 'UNPAID'}).
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/bookings/my-bookings')}
              >
                Go to My Bookings
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/bookings/${existingBooking.id}`)}
              >
                View My Booking
              </button>
            </div>
          </div>
        )}

        {!existingBooking && property && property.status !== 'AVAILABLE' && (
          <div
            className="unavailable-booking-alert glass-panel"
            style={{
              padding: '1.25rem',
              marginBottom: '1.5rem',
              borderLeft: '4px solid #dc2626',
              background: 'rgba(220, 38, 38, 0.08)',
              borderRadius: '12px'
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#dc2626', fontSize: '1.1rem' }}>
              Property Unavailable for Reservation
            </h3>
            <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              This property is currently <strong>{property.status}</strong> and cannot be reserved at this time.
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/properties')}
            >
              Browse Available Properties
            </button>
          </div>
        )}

        {/* Compact Property & Reservation Fee Summary */}
        {property && (
          <div className="booking-compact-summary glass-panel">
            <div className="booking-summary-top">
              <div>
                <span className={`badge ${property.type === 'RENT' ? 'badge-rent' : 'badge-sale'}`} style={{ marginBottom: '0.35rem', display: 'inline-block' }}>
                  {property.type === 'RENT' ? 'For Rent' : 'For Sale'}
                </span>
                <h2 className="booking-summary-property-title">{property.title}</h2>
                <p className="booking-summary-property-location">📍 {property.location || property.address}</p>
              </div>
            </div>

            <div className="booking-fee-breakdown">
              <div className="fee-item">
                <span className="fee-label">Property Listed Price</span>
                <span className="fee-val-price">{formatCurrency(property.price)}{property.type === 'RENT' ? ' / mo' : ''}</span>
              </div>
              <div className="fee-divider" />
              <div className="fee-item highlight-fee">
                <span className="fee-label">
                  Reservation Deposit Fee (2%)
                  <span className="fee-subtext">Payable after booking to complete confirmation</span>
                </span>
                <span className="fee-val-deposit">{formatCurrency(reservationFee)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Compact Booking Form */}
        <form className="booking-form glass-panel" onSubmit={handleSubmit} noValidate>
          {/* Buyer Details (Autofilled) */}
          <div className="autofill-buyer-info">
            <h3 className="section-small-title">Buyer Account Details</h3>
            <div className="buyer-info-grid">
              <div>
                <label className="form-label-sub">Buyer Name</label>
                <div className="autofill-value">{user?.name || 'Authenticated Buyer'}</div>
              </div>
              <div>
                <label className="form-label-sub">Email Address</label>
                <div className="autofill-value">{user?.email || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label" htmlFor="bookingDate">
              Preferred Viewing / Move-in Date *
            </label>
            <input
              id="bookingDate"
              type="date"
              className={`form-control${formErrors.bookingDate ? ' form-control--error' : ''}`}
              value={bookingDate}
              min={todayStr}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />
            {formErrors.bookingDate && (
              <span className="form-error">{formErrors.bookingDate}</span>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label" htmlFor="notes">
              Optional Notes / Requests
            </label>
            <textarea
              id="notes"
              className="form-control"
              rows={3}
              placeholder="e.g. Preferred time of day, architect inspection request, questions for owner..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="booking-form__actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || (existingBooking != null) || (property != null && property.status !== 'AVAILABLE')}
              style={{ minWidth: '150px' }}
            >
              {submitting ? 'Booking...' : 'Book Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBookingPage;
