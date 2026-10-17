import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Shield, CheckCircle } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="premium-footer" aria-label="Site Footer">
      <div className="container footer-content-container">
        <div className="footer-grid">
          {/* Brand & About */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 10 9-7 9 7"/>
                  <path d="M5 9v11h14V9"/>
                  <path d="M9 20v-6h6v6"/>
                </svg>
              </div>
              <span className="footer-logo-text">RealEstatePro</span>
            </div>
            <p className="footer-desc">
              Sri Lanka's premier real estate listings and investment portal. Discover houses, apartments, lands, and commercial properties with verified listings and secure transactions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links-list">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/properties" className="footer-link">Browse Properties</Link></li>
              <li><Link to="/my-bookings" className="footer-link">My Bookings</Link></li>
              <li><Link to="/my-payments" className="footer-link">Payment History</Link></li>
              <li><Link to="/my-reviews" className="footer-link">Property Reviews</Link></li>
            </ul>
          </div>

          {/* Property Types */}
          <div className="footer-col">
            <h4 className="footer-col-title">Property Types</h4>
            <ul className="footer-links-list">
              <li><Link to="/properties?type=SALE" className="footer-link">Properties For Sale</Link></li>
              <li><Link to="/properties?type=RENT" className="footer-link">Properties For Rent</Link></li>
              <li><Link to="/properties" className="footer-link">Luxury Apartments</Link></li>
              <li><Link to="/properties" className="footer-link">Commercial Real Estate</Link></li>
              <li><Link to="/profile" className="footer-link">User Account</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="footer-col">
            <h4 className="footer-col-title">Portal Contact</h4>
            <ul className="footer-contact-list">
              <li>
                <MapPin size={17} className="text-primary" />
                <span>Colombo & Western Province, Sri Lanka</span>
              </li>
              <li>
                <Mail size={17} className="text-primary" />
                <span>support@realestatepro.lk</span>
              </li>
              <li>
                <Phone size={17} className="text-primary" />
                <span>+94 11 234 5678</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-flex">
          <p className="copyright-text">
            &copy; 2026 RealEstatePro. All rights reserved.
          </p>
          <p className="footer-trust-badge">
            <Shield size={16} className="text-primary" />
            <span>Verified Property Listings | Secure Simulated Transactions</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
