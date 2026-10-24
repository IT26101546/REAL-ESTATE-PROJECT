import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userApi } from '../../../api/userApi';
import { useToast } from '../../../context/ToastContext';
import { UserPlus, Shield, User, Mail, Lock, Phone, FileText } from 'lucide-react';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'BUYER',
    bio: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      // Ensure only BUYER or SELLER can be registered publicly
      const sanitizedRole = formData.role === 'SELLER' ? 'SELLER' : 'BUYER';
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: sanitizedRole,
        bio: formData.bio.trim()
      };

      const response = await userApi.register(payload);
      showToast('Account registered successfully! Please login.', 'success');
      navigate('/login', {
        state: {
          successMessage: 'Account created successfully! Please login with your credentials.',
          prefillEmail: payload.email
        }
      });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="form-card auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <UserPlus size={28} />
          </div>
          <h2 className="page-title">Create an Account</h2>
          <p className="page-subtitle">Join RealEstatePro to browse, book, or list properties</p>
        </div>

        {errorMessage && (
          <div className="auth-error-banner">
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="name"
                required
                className="form-input"
                placeholder="e.g. Kamal Perera"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="e.g. kamal@example.com"
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
                minLength={6}
                className="form-input"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input
                type="text"
                name="phone"
                className="form-input"
                placeholder="e.g. +94 77 123 4567"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div className="role-selector-grid">
              <label className={`role-option-card ${formData.role === 'BUYER' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="BUYER"
                  checked={formData.role === 'BUYER'}
                  onChange={handleChange}
                />
                <div className="role-option-content">
                  <strong>Property Buyer</strong>
                  <small>Browse, reserve properties, submit inquiries & reviews</small>
                </div>
              </label>

              <label className={`role-option-card ${formData.role === 'SELLER' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="SELLER"
                  checked={formData.role === 'SELLER'}
                  onChange={handleChange}
                />
                <div className="role-option-content">
                  <strong>Property Seller</strong>
                  <small>Post listings, manage reservations, answer inquiries</small>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Bio (Optional)</label>
            <textarea
              name="bio"
              rows={2}
              className="form-textarea"
              placeholder="Tell other members a little about yourself..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
