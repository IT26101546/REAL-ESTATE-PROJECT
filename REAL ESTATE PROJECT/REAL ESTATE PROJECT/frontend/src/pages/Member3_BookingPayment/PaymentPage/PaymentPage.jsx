import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { createPayment, getBookingById } from '../../../api/bookingPaymentApi';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import './PaymentPage.css';

function PaymentPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Two choices: 'CARD' or 'CASH'
  const [paymentChoice, setPaymentChoice] = useState('CARD');

  // Simulated card fields (demo only — not stored or sent to server)
  const [demoCardNumber, setDemoCardNumber] = useState('4242 4242 4242 4242');
  const [demoExpiry, setDemoExpiry] = useState('12/28');
  const [demoCvv, setDemoCvv] = useState('123');

  // Cash notes
  const [cashNotes, setCashNotes] = useState('');

  useEffect(() => {
    if (!bookingId) {
      showToast('No booking selected.', 'error');
      setLoading(false);
      return;
    }
    getBookingById(bookingId)
      .then((data) => setBooking(data))
      .catch(() => showToast('Failed to load booking details.', 'error'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  function formatCurrency(amount) {
    return `LKR ${Number(amount || 0).toLocaleString('en-US')}`;
  }

  function formatDemoCardNumber(value) {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  function formatDemoExpiry(value) {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  }

  async function handleCardSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createPayment({
        bookingId,
        paymentMethod: 'CREDIT_CARD',
        notes: 'Simulated card payment for reservation deposit'
      });
      const paymentId = result?.id || result?.paymentId || result?.data?.id || result?.data?.paymentId;
      showToast('Card payment successful! Reservation confirmed and marked PAID.', 'success');
      navigate(`/payments/receipt/${paymentId}`);
    } catch (err) {
      const msg = err?.data?.message || err?.response?.data?.message || err?.message || 'Payment failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCashSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createPayment({
        bookingId,
        paymentMethod: 'CASH',
        notes: cashNotes.trim() || 'In-person cash settlement at agency office'
      });
      const paymentId = result?.id || result?.paymentId || result?.data?.id || result?.data?.paymentId;
      showToast('Cash payment record created! Status is PENDING COLLECTION.', 'success');
      navigate(`/payments/receipt/${paymentId}`);
    } catch (err) {
      const msg = err?.data?.message || err?.response?.data?.message || err?.message || 'Failed to record cash payment choice.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading booking details for payment..." />;

  if (!booking) {
    return (
      <div className="payment-page page-wrapper container">
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
          <p className="form-error" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            Booking not found. Please select a valid booking from My Bookings.
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/bookings/my-bookings')}>
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const fee = booking.reservationFee || 0;
  const isPaid = (booking.paymentStatus || '').toUpperCase() === 'PAID';
  const isCancelled = booking.status === 'CANCELLED';

  return (
    <div className="payment-page page-wrapper container">
      <div className="payment-container">
        <div className="payment-header">
          <h1 className="payment-title page-title gradient-text">Pay Reservation Deposit</h1>
          <p className="page-subtitle">Select your payment method to secure your property booking</p>
        </div>

        {/* Booking Summary Card */}
        <div className="payment-booking-summary glass-panel">
          <div className="booking-summary-header">
            <div>
              <span className="summary-booking-id">Booking #{booking.id}</span>
              <h2 className="payment-booking-summary__property">
                {booking.propertyTitle || 'Property Reservation'}
              </h2>
            </div>
            <div className="summary-fee-badge">
              <span className="fee-badge-label">Amount Due</span>
              <span className="fee-badge-val">{formatCurrency(fee)}</span>
            </div>
          </div>
          <p className="payment-booking-summary__fee-note">
            Deposit required to confirm reservation. Separated from total property price.
          </p>
        </div>

        {/* Status Guards */}
        {isPaid ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem', borderRadius: '16px' }}>
            <p style={{ color: '#16a34a', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              ✓ This booking has already been paid and confirmed!
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Your reservation deposit is complete. No further payments are required.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/payments/history')}>
                View Payment History
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/bookings/my-bookings')}>
                Back to My Bookings
              </button>
            </div>
          </div>
        ) : isCancelled ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem', borderRadius: '16px' }}>
            <p style={{ color: 'var(--danger-color)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              ⚠️ This booking was cancelled.
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Payments cannot be processed for cancelled property reservations.
            </p>
            <button className="btn btn-secondary" onClick={() => navigate('/bookings/my-bookings')}>
              Back to My Bookings
            </button>
          </div>
        ) : (
          <>
            {/* Payment Method Selector: Card vs. Cash */}
            <div className="payment-method-selector">
              <button
                type="button"
                className={`method-select-btn ${paymentChoice === 'CARD' ? 'active' : ''}`}
                onClick={() => setPaymentChoice('CARD')}
              >
                <span className="method-btn-icon">💳</span>
                <span className="method-btn-title">Card Payment</span>
                <span className="method-btn-sub">Instant Simulated Checkout</span>
              </button>

              <button
                type="button"
                className={`method-select-btn ${paymentChoice === 'CASH' ? 'active' : ''}`}
                onClick={() => setPaymentChoice('CASH')}
              >
                <span className="method-btn-icon">💵</span>
                <span className="method-btn-title">Cash Payment</span>
                <span className="method-btn-sub">Pay In Person at Agency Office</span>
              </button>
            </div>

            {/* Card Payment Form */}
            {paymentChoice === 'CARD' && (
              <form className="payment-card-form glass-panel" onSubmit={handleCardSubmit}>
                <div className="payment-choice-banner">
                  <h3 className="choice-title">Simulated Card Payment</h3>
                  <p className="choice-desc">
                    Use our safe test payment simulator to immediately confirm your reservation.
                  </p>
                </div>

                <div className="demo-notice">
                  ⚠️ <strong>Demo Test Details Only:</strong> Do NOT enter real credit or debit card numbers. No financial charges will be made.
                </div>

                <div className="demo-card-fields">
                  <div className="form-group">
                    <label className="form-label" htmlFor="demoCardNumber">
                      Test Card Number <span className="demo-tag">(Simulated)</span>
                    </label>
                    <input
                      id="demoCardNumber"
                      type="text"
                      className="form-control"
                      value={demoCardNumber}
                      onChange={(e) => setDemoCardNumber(formatDemoCardNumber(e.target.value))}
                      maxLength={19}
                      placeholder="4242 4242 4242 4242"
                      required
                    />
                  </div>

                  <div className="demo-card-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="demoExpiry">
                        Expiration <span className="demo-tag">(Simulated)</span>
                      </label>
                      <input
                        id="demoExpiry"
                        type="text"
                        className="form-control"
                        value={demoExpiry}
                        onChange={(e) => setDemoExpiry(formatDemoExpiry(e.target.value))}
                        maxLength={5}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="demoCvv">
                        CVV / CVC <span className="demo-tag">(Simulated)</span>
                      </label>
                      <input
                        id="demoCvv"
                        type="text"
                        className="form-control"
                        value={demoCvv}
                        onChange={(e) => setDemoCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="payment-form__actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/bookings/my-bookings')}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary payment-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : `Confirm Card Payment — ${formatCurrency(fee)}`}
                  </button>
                </div>
              </form>
            )}

            {/* Cash Payment Form */}
            {paymentChoice === 'CASH' && (
              <form className="payment-cash-form glass-panel" onSubmit={handleCashSubmit}>
                <div className="payment-choice-banner">
                  <h3 className="choice-title">In-Person Cash Payment</h3>
                  <p className="choice-desc">
                    Settle your reservation fee directly at the RealEstatePro agency office.
                  </p>
                </div>

                <div className="cash-policy-box">
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#b45309', fontSize: '1rem' }}>
                    📌 How Cash Payment Works:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem' }}>
                    <li>Selecting Cash will record a payment with status <strong>PENDING COLLECTION</strong>.</li>
                    <li>The booking is held, but <strong>not marked PAID</strong> until you visit the office with cash.</li>
                    <li>Our authorized administrator will verify your physical cash payment and confirm it as <strong>PAID</strong>.</li>
                    <li>Total amount due at office: <strong>{formatCurrency(fee)}</strong>.</li>
                  </ul>
                </div>

                <div className="form-group" style={{ marginTop: '1.25rem' }}>
                  <label className="form-label" htmlFor="cashNotes">
                    Optional Note (e.g. planned date/time of office visit)
                  </label>
                  <textarea
                    id="cashNotes"
                    className="form-control"
                    rows={3}
                    placeholder="e.g. Planning to visit office tomorrow morning to settle deposit..."
                    value={cashNotes}
                    onChange={(e) => setCashNotes(e.target.value)}
                  />
                </div>

                <div className="payment-form__actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/bookings/my-bookings')}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary payment-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : `Select Cash Payment (${formatCurrency(fee)})`}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentPage;
