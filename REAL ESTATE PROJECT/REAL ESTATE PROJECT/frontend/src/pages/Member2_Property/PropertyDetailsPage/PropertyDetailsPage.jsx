import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { getPropertyById } from '../../../api/propertyApi';
import { getPropertyReviews } from '../../../api/reviewApi';
import { getMyBookings } from '../../../api/bookingPaymentApi';
import {
  Building,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  CalendarCheck,
  MessageCircle,
  Star,
  Edit,
  ArrowLeft,
  User,
  CheckCircle,
  Tag
} from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import './PropertyDetailsPage.css';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isBuyer, isSeller, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [property, setProperty] = useState(null);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [existingBooking, setExistingBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [propData, reviewsData] = await Promise.allSettled([
          getPropertyById(id),
          getPropertyReviews(id)
        ]);

        if (propData.status === 'fulfilled' && propData.value) {
          setProperty(propData.value);
        } else {
          setError('Property listing could not be found.');
        }

        if (reviewsData.status === 'fulfilled' && reviewsData.value) {
          setReviewSummary(reviewsData.value);
        }

        if (isAuthenticated) {
          try {
            const bookings = await getMyBookings();
            const found = (Array.isArray(bookings) ? bookings : []).find(
              (b) => b.propertyId === id && b.status !== 'CANCELLED' && b.status !== 'REJECTED'
            );
            if (found) {
              setExistingBooking(found);
            }
          } catch (e) {
            // Non-critical, continue
          }
        }
      } catch (err) {
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isAuthenticated]);

  if (loading) return <LoadingSpinner message="Loading property details..." />;

  if (error || !property) {
    return (
      <div className="property-details-page">
        <div className="property-details-container">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/properties')}>
            <ArrowLeft size={16} />
            <span>Back to Listings</span>
          </button>
          <div className="error-box" style={{ marginTop: '1.5rem' }}>
            {error || 'Property not found.'}
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user && (user.id === property.sellerId || isAdmin);
  const isAvailable = property.status === 'AVAILABLE';

  const avgRating = reviewSummary?.averageRating || 0;
  const reviewCount = reviewSummary?.totalReviews || (reviewSummary?.reviews?.length || 0);

  return (
    <div className="property-details-page page-wrapper container">
      <div className="property-details-container">
        {/* Navigation & Header */}
        <div className="property-details-header">
          <button className="btn-outline btn-sm" onClick={() => navigate('/properties')}>
            <ArrowLeft size={16} />
            <span>All Properties</span>
          </button>
          <h1 className="gradient-text">{property.title}</h1>
          <span className={`badge ${property.type === 'RENT' ? 'badge-rent' : 'badge-sale'}`}>
            {property.type === 'RENT' ? 'For Rent' : 'For Sale'}
          </span>
          <span className={`badge badge-${property.status?.toLowerCase()}`}>
            {property.status}
          </span>
        </div>

        {/* Main Image */}
        <div className="property-image-section">
          {property.imageUrl ? (
            <img
              src={property.imageUrl}
              alt={property.title}
              className="property-main-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="property-no-image">
              <Building size={48} />
              <span>No image uploaded for this property</span>
            </div>
          )}
        </div>

        {/* Body 2-Column Grid */}
        <div className="property-details-body">
          {/* Main Details Column */}
          <div className="property-main-content">
            {/* Specs */}
            <div className="property-specs-section">
              <h2>Property Details & Specs</h2>
              <div className="spec-grid">
                <div className="spec-item">
                  <Bed size={20} />
                  <span className="spec-value">{property.bedrooms ?? '—'}</span>
                  <span className="spec-label">Bedrooms</span>
                </div>
                <div className="spec-item">
                  <Bath size={20} />
                  <span className="spec-value">{property.bathrooms ?? '—'}</span>
                  <span className="spec-label">Bathrooms</span>
                </div>
                <div className="spec-item">
                  <Maximize2 size={20} />
                  <span className="spec-value">{property.area ? `${property.area} sqft` : '—'}</span>
                  <span className="spec-label">Living Area</span>
                </div>
                <div className="spec-item">
                  <Tag size={20} />
                  <span className="spec-value">{property.categoryName || 'Residential'}</span>
                  <span className="spec-label">Category</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="property-description-section">
              <h2>Description</h2>
              <p>{property.description}</p>
            </div>

            {/* Reviews Section Preview */}
            <div className="property-description-section" style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, border: 'none', padding: 0 }}>
                  Ratings & Reviews ({reviewCount})
                </h2>
                <Link to={`/reviews/property/${property.id}`} className="btn btn-secondary btn-sm">
                  View All Reviews
                </Link>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  <Star fill="#f59e0b" size={22} />
                  <span>{avgRating > 0 ? avgRating.toFixed(1) : 'New'}</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  ({reviewCount} customer review{reviewCount === 1 ? '' : 's'})
                </span>
              </div>

              {reviewSummary?.reviews && reviewSummary.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {reviewSummary.reviews.slice(0, 2).map((rev) => (
                    <div key={rev.id} style={{ background: 'var(--background)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.85rem' }}>{rev.userName || 'Verified Buyer'}</strong>
                        <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>★ {rev.rating} / 5</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  No reviews yet for this property. Be the first to leave feedback!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="property-sidebar">
            {/* Price Card */}
            <div className="price-card glass-panel">
              <span className="category-tag">{property.categoryName || 'Real Estate'}</span>
              <div className="price-display">
                LKR {Number(property.price).toLocaleString()}
                {property.type === 'RENT' && <span className="price-per-month"> per month</span>}
              </div>
              <div className="price-type-label">
                {property.type === 'RENT' ? 'Monthly Rental Fee' : 'Total Purchase Price'}
              </div>

              <div className="badges-row">
                <span className={`badge ${property.type === 'RENT' ? 'badge-rent' : 'badge-sale'}`}>
                  {property.type === 'RENT' ? 'Rental' : 'Outright Sale'}
                </span>
                <span className={`badge badge-${property.status?.toLowerCase()}`}>
                  {property.status}
                </span>
              </div>

              {/* Action Buttons Stack */}
              <div className="action-buttons-stack">
                {existingBooking && (
                  <div
                    className="existing-booking-badge-card"
                    style={{
                      background: 'rgba(217, 119, 6, 0.1)',
                      border: '1px solid rgba(217, 119, 6, 0.35)',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      marginBottom: '0.5rem',
                      textAlign: 'center'
                    }}
                  >
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#b45309', fontWeight: 600 }}>
                      📌 You have an active reservation ({existingBooking.status?.replace('_', ' ')})
                    </p>
                    <Link
                      to={`/bookings/${existingBooking.id}`}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <CalendarCheck size={16} />
                      <span>View My Booking</span>
                    </Link>
                  </div>
                )}

                {isAvailable && !existingBooking && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (!isAuthenticated) navigate('/login');
                      else navigate(`/bookings/create?propertyId=${property.id}`);
                    }}
                  >
                    <CalendarCheck size={16} />
                    <span>Book Property Reservation</span>
                  </button>
                )}

                {!isAvailable && !existingBooking && (
                  <div
                    className="unavailable-property-notice"
                    style={{
                      background: 'rgba(96, 61, 40, 0.08)',
                      border: '1px solid rgba(96, 61, 40, 0.25)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontSize: '0.88rem',
                      fontWeight: 600
                    }}
                  >
                    Property is currently {property.status}. Reservations unavailable.
                  </div>
                )}

                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (!isAuthenticated) navigate('/login');
                    else navigate(`/inquiries/create?propertyId=${property.id}`);
                  }}
                >
                  <MessageCircle size={16} />
                  <span>Submit Inquiry / Question</span>
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (!isAuthenticated) navigate('/login');
                    else navigate(`/reviews/add?propertyId=${property.id}`);
                  }}
                >
                  <Star size={16} />
                  <span>Leave Review & Rating</span>
                </button>

                {isOwner && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate(`/properties/edit/${property.id}`)}
                  >
                    <Edit size={16} />
                    <span>Edit Listing (Seller)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Seller Info Card */}
            <div className="seller-info-card">
              <h3>Seller Details</h3>
              <div className="seller-name">
                <User size={16} />
                <span>{property.sellerName || 'Verified Broker'}</span>
              </div>
              <div className="seller-email">
                Listed: {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            {/* Location Card */}
            <div className="location-info-card">
              <h3>Location</h3>
              <div className="location-text">
                <MapPin size={16} />
                <span>{property.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
