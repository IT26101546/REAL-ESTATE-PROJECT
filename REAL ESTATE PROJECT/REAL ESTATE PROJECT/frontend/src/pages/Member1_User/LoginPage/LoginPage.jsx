import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { userApi } from '../../../api/userApi';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: location.state?.prefillEmail || '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickLogin = (email, password) => {
    setFormData({ email, password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const response = await userApi.login(formData);
      const { token, user } = response.data;
      login(token, user);
      showToast(`Welcome back, ${user.name}!`, 'success');

      // Navigate based on role or previous location
      const destination = location.state?.from?.pathname || (user.role === 'ADMIN' ? '/admin' : '/properties');
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
      showToast(err.message || 'Login failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="form-card auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <LogIn size={28} />
          </div>
          <h2 className="page-title">Login to Your Account</h2>
          <p className="page-subtitle">Access your property listings, bookings, inquiries, and reviews</p>
        </div>

        {/* Quick Demo Fill Pills */}
        <div className="demo-credentials-box">
          <div className="demo-badge-row">
            <Sparkles size={14} />
            <span>Quick Demo Accounts</span>
          </div>
          <div className="demo-pills">
            <button
              type="button"
              className="demo-pill admin-pill"
              onClick={() => handleQuickLogin('admin@realestate.com', 'Admin@123')}
            >
              Default Admin
            </button>
            <button
              type="button"
              className="demo-pill seller-pill"
              onClick={() => handleQuickLogin('seller1@realestate.com', 'Seller@123')}
            >
              Seller (Kamal)
            </button>
            <button
              type="button"
              className="demo-pill buyer-pill"
              onClick={() => handleQuickLogin('buyer1@realestate.com', 'Buyer@123')}
            >
              Buyer (Anura)
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="auth-success-banner">
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="auth-error-banner">
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="Enter registered email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                name="password"
                required
                className="form-input"
                placeholder="Enter account password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register" className="auth-link">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
}
