import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize2, Tag, Home, ArrowRight } from 'lucide-react';
import './PropertyCard.css';

export default function PropertyCard({ property, userBooking }) {
  if (!property) return null;

  // Format price in LKR with "per month" for rentals
  const formattedPrice = Number(property.price || 0).toLocaleString('en-US');
  const isRent = property.type === 'RENT';

  // Fallback image handling
  const defaultFallbackImg = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="property-card glass-panel">
      {/* Image Container with Badges */}
      <div className="property-image-container">
        <img
          src={property.imageUrl || defaultFallbackImg}
          alt={property.title || 'Property Listing'}
          className="property-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultFallbackImg;
          }}
        />

        {/* Top Badges */}
        <div className="card-top-badges">
          <span className={`property-type-pill ${isRent ? 'pill-rent' : 'pill-sale'}`}>
            {isRent ? 'For Rent' : 'For Sale'}
          </span>
          <span className={`badge badge-${property.status?.toLowerCase() || 'available'}`}>
            {property.status || 'AVAILABLE'}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="property-details">
        <h3 className="property-card-title" title={property.title}>
          {property.title}
        </h3>

        <div className="property-location-row">
          <MapPin size={15} className="text-primary flex-shrink-0" />
          <span className="location-text">{property.location || 'Location upon inquiry'}</span>
        </div>

        {/* Specs (Bedrooms, Bathrooms, Area) */}
        <div className="property-specs-row">
          {property.bedrooms !== undefined && property.bedrooms !== null && Number(property.bedrooms) > 0 ? (
            <div className="spec-item" title={`${property.bedrooms} Bedrooms`}>
              <Bed size={14} className="text-secondary" />
              <span>{property.bedrooms} Beds</span>
            </div>
          ) : null}

          {property.bathrooms !== undefined && property.bathrooms !== null && Number(property.bathrooms) > 0 ? (
            <div className="spec-item" title={`${property.bathrooms} Bathrooms`}>
              <Bath size={14} className="text-secondary" />
              <span>{property.bathrooms} Baths</span>
            </div>
          ) : null}

          {property.area !== undefined && property.area !== null && Number(property.area) > 0 ? (
            <div className="spec-item" title={`${property.area} sqft`}>
              <Maximize2 size={14} className="text-secondary" />
              <span>{Number(property.area).toLocaleString()} sqft</span>
            </div>
          ) : null}
        </div>

        {/* Footer with Price and View Details Action */}
        <div className="property-footer">
          <div className="property-price-box">
            <span className="price-label">Price</span>
            <span className="price-amount">
              LKR {formattedPrice}
              {isRent && <span className="price-term"> per month</span>}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {userBooking ? (
              <Link to={`/bookings/${userBooking.id}`} className="my-booking-btn">
                <span>View My Booking</span>
              </Link>
            ) : (
              <Link to={`/properties/${property.id}`} className="btn-primary btn-sm details-btn">
                <span>View Details</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
