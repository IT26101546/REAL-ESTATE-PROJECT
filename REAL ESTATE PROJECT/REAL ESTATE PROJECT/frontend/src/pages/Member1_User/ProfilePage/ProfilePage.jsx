import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../../../api/userApi';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { User, Mail, Phone, Calendar, Shield, Edit, Info } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user: authUser, updateCurrentUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await userApi.getCurrentProfile();
        setProfile(res.data);
        updateCurrentUser(res.data);
      } catch (err) {
        showToast(err.message || 'Failed to fetch user profile.', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) return <LoadingSpinner message="Loading profile details..." />;

  return (
    <div className="profile-container page-wrapper container">
      <div className="profile-header-flex">
        <div>
          <h1 className="page-title gradient-text">My Account Profile</h1>
          <p className="page-subtitle">Manage your personal information and platform credentials</p>
        </div>
        <Link to="/edit-profile" className="btn-primary">
          <Edit size={16} />
          <span>Edit Profile</span>
        </Link>
      </div>

      <div className="profile-card">
        <div className="profile-top-banner">
          <div className="profile-avatar-circle">
            <User size={48} />
          </div>
          <div className="profile-main-meta">
            <h2>{profile?.name}</h2>
            <div className="profile-badges-row">
              <span className={`role-badge role-${profile?.role?.toLowerCase()}`}>
                {profile?.role}
              </span>
              <span className="badge badge-available">
                {profile?.active ? 'Active Account' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-info-grid">
          <div className="info-block">
            <div className="info-label">
              <Mail size={16} />
              <span>Email Address</span>
            </div>
            <div className="info-value">{profile?.email}</div>
          </div>

          <div className="info-block">
            <div className="info-label">
              <Phone size={16} />
              <span>Contact Number</span>
            </div>
            <div className="info-value">{profile?.phone || 'Not provided'}</div>
          </div>

          <div className="info-block">
            <div className="info-label">
              <Shield size={16} />
              <span>User ID</span>
            </div>
            <div className="info-value"><code>{profile?.id}</code></div>
          </div>

          <div className="info-block">
            <div className="info-label">
              <Calendar size={16} />
              <span>Member Since</span>
            </div>
            <div className="info-value">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>

        <div className="profile-bio-section">
          <h4 className="bio-title">About / Bio</h4>
          <p className="bio-text">
            {profile?.bio || 'No biographical information added yet. Click "Edit Profile" to update.'}
          </p>
        </div>
      </div>
    </div>
  );
}
