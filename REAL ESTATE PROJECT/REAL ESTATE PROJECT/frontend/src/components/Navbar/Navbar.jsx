import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Home,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  Star,
  PlusCircle,
  ShieldCheck,
  Layers,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, isBuyer, isSeller, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Helper for user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <nav className="glass-nav navbar" aria-label="Main Navigation">
        <div className="navbar-container">
          {/* Brand Logo */}
          <Link to="/" className="navbar-logo" title="RealEstatePro Home">
            <div className="logo-wrapper">
              <div className="logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 10 9-7 9 7"/>
                  <path d="M5 9v11h14V9"/>
                  <path d="M9 20v-6h6v6"/>
                </svg>
              </div>
              <span className="logo-text">RealEstatePro</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="navbar-links">
            <li>
              <Link
                to="/"
                title="Home"
                aria-label="Home"
                className={`nav-text-link ${isActive('/') ? 'active' : ''}`}
              >
                <span>Home</span>
              </Link>
            </li>

            <li>
              <Link
                to="/properties"
                title="Properties"
                aria-label="Properties"
                className={`nav-text-link ${isActive('/properties') && !location.pathname.includes('/my-properties') && !location.pathname.includes('/add') ? 'active' : ''}`}
              >
                <span>Properties</span>
              </Link>
            </li>

            {/* Buyer Links */}
            {isAuthenticated && (isBuyer || isAdmin) && (
              <>
                <li>
                  <Link
                    to="/bookings/my-bookings"
                    title="My Bookings"
                    aria-label="My Bookings"
                    className={isActive('/bookings') || isActive('/my-bookings') ? 'active' : ''}
                  >
                    <CalendarCheck size={18} />
                    <span className="nav-link-text">My Bookings</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/payments/history"
                    title="Payments"
                    aria-label="Payments"
                    className={isActive('/payments') || isActive('/my-payments') ? 'active' : ''}
                  >
                    <CreditCard size={18} />
                    <span className="nav-link-text">Payments</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/inquiries/my-inquiries"
                    title="My Inquiries"
                    aria-label="My Inquiries"
                    className={isActive('/inquiries') || isActive('/my-inquiries') ? 'active' : ''}
                  >
                    <MessageSquare size={18} />
                    <span className="nav-link-text">Inquiries</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/reviews/my-reviews"
                    title="Reviews"
                    aria-label="Reviews"
                    className={isActive('/reviews') || isActive('/my-reviews') ? 'active' : ''}
                  >
                    <Star size={18} />
                    <span className="nav-link-text">Reviews</span>
                  </Link>
                </li>
              </>
            )}

            {/* Seller Links */}
            {isAuthenticated && (isSeller || isAdmin) && (
              <>
                <li>
                  <Link
                    to="/my-properties"
                    title="My Listings"
                    aria-label="My Listings"
                    className={isActive('/my-properties') ? 'active' : ''}
                  >
                    <Building2 size={18} />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/add-property"
                    title="Add Property"
                    aria-label="Add Property"
                    className={isActive('/add-property') ? 'active' : ''}
                  >
                    <PlusCircle size={18} />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/manage-bookings"
                    title="Manage Bookings"
                    aria-label="Manage Bookings"
                    className={isActive('/manage-bookings') ? 'active' : ''}
                  >
                    <CalendarCheck size={18} />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/seller-inquiries"
                    title="Seller Inquiries"
                    aria-label="Seller Inquiries"
                    className={isActive('/seller-inquiries') ? 'active' : ''}
                  >
                    <MessageSquare size={18} />
                  </Link>
                </li>
              </>
            )}

            {/* Admin Links */}
            {isAuthenticated && isAdmin && (
              <>
                <li>
                  <Link
                    to="/admin"
                    title="Admin Dashboard"
                    aria-label="Admin Dashboard"
                    className={isActive('/admin') ? 'active' : ''}
                  >
                    <ShieldCheck size={18} />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categories"
                    title="Categories"
                    aria-label="Categories"
                    className={isActive('/categories') ? 'active' : ''}
                  >
                    <Layers size={18} />
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Auth Menu */}
          <div className="navbar-auth">
            {!isAuthenticated ? (
              <div className="auth-actions">
                <Link to="/login" className="nav-signin-link" title="Login" aria-label="Login">
                  Login
                </Link>
                <Link to="/register" className="btn-primary auth-btn register-nav-btn">
                  <User size={15} />
                  <span>Register</span>
                </Link>
              </div>
            ) : (
              <div className="user-menu">
                <Link to="/profile" className="user-profile-link" title="My Profile" aria-label="My Profile">
                  <div className="user-avatar initials-avatar">
                    {getInitials(user?.name)}
                  </div>
                  <span className="user-name">
                    {(user?.name || 'User').split(' ')[0]}
                  </span>
                  <span className={`user-role-badge role-${user?.role?.toLowerCase()}`}>
                    {user?.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-outline logout-btn"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                  <span className="logout-text">Logout</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-Down / Floating Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown-menu" role="menu">
          <div className="mobile-menu-header">
            <span className="mobile-menu-title">Navigation</span>
            <button
              className="mobile-close-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close Menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mobile-links-list">
            <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
              <Home size={18} />
              <span>Home</span>
            </Link>

            <Link to="/properties" className={`mobile-nav-item ${isActive('/properties') ? 'active' : ''}`}>
              <Building2 size={18} />
              <span>Properties</span>
            </Link>

            {isAuthenticated && (isBuyer || isAdmin) && (
              <>
                <Link to="/bookings/my-bookings" className={`mobile-nav-item ${isActive('/bookings') || isActive('/my-bookings') ? 'active' : ''}`}>
                  <CalendarCheck size={18} />
                  <span>My Bookings</span>
                </Link>
                <Link to="/payments/history" className={`mobile-nav-item ${isActive('/payments') || isActive('/my-payments') ? 'active' : ''}`}>
                  <CreditCard size={18} />
                  <span>Payments</span>
                </Link>
                <Link to="/inquiries/my-inquiries" className={`mobile-nav-item ${isActive('/inquiries') || isActive('/my-inquiries') ? 'active' : ''}`}>
                  <MessageSquare size={18} />
                  <span>My Inquiries</span>
                </Link>
                <Link to="/reviews/my-reviews" className={`mobile-nav-item ${isActive('/reviews') || isActive('/my-reviews') ? 'active' : ''}`}>
                  <Star size={18} />
                  <span>My Reviews</span>
                </Link>
              </>
            )}

            {isAuthenticated && (isSeller || isAdmin) && (
              <>
                <Link to="/my-properties" className={`mobile-nav-item ${isActive('/my-properties') ? 'active' : ''}`}>
                  <Building2 size={18} />
                  <span>My Listings</span>
                </Link>
                <Link to="/add-property" className={`mobile-nav-item ${isActive('/add-property') ? 'active' : ''}`}>
                  <PlusCircle size={18} />
                  <span>Add Property</span>
                </Link>
                <Link to="/manage-bookings" className={`mobile-nav-item ${isActive('/manage-bookings') ? 'active' : ''}`}>
                  <CalendarCheck size={18} />
                  <span>Manage Bookings</span>
                </Link>
                <Link to="/seller-inquiries" className={`mobile-nav-item ${isActive('/seller-inquiries') ? 'active' : ''}`}>
                  <MessageSquare size={18} />
                  <span>Seller Inquiries</span>
                </Link>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <Link to="/admin" className={`mobile-nav-item ${isActive('/admin') ? 'active' : ''}`}>
                  <ShieldCheck size={18} />
                  <span>Admin Dashboard</span>
                </Link>
                <Link to="/categories" className={`mobile-nav-item ${isActive('/categories') ? 'active' : ''}`}>
                  <Layers size={18} />
                  <span>Category Management</span>
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="mobile-auth-section">
                <Link to="/profile" className="mobile-nav-item">
                  <User size={18} />
                  <span>My Profile ({user?.name})</span>
                </Link>
                <button onClick={handleLogout} className="btn-outline mobile-logout-btn">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div className="mobile-auth-actions">
                <Link to="/login" className="btn-outline auth-btn" style={{ width: '100%' }}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary auth-btn" style={{ width: '100%' }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
