import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../../api/userApi';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { Save, Lock, Trash2, ArrowLeft } from 'lucide-react';
import './EditProfilePage.css';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateCurrentUser, logout } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await userApi.getCurrentProfile();
        setProfileData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          bio: res.data.bio || ''
        });
      } catch (err) {
        showToast('Failed to load profile data.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await userApi.updateProfile(profileData);
      updateCurrentUser(res.data);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setUpdatingPassword(true);
    try {
      await userApi.changePassword(passwordData);
      showToast('Password changed successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      showToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await userApi.deleteAccount(user.id);
      showToast('Account deleted successfully.', 'success');
      logout();
      navigate('/login');
    } catch (err) {
      showToast(err.message || 'Cannot delete account. Check booking/payment dependencies.', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading account details..." />;

  return (
    <div className="edit-profile-container page-wrapper container">
      <div className="page-header" style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
        <div>
          <button className="btn-outline btn-sm back-btn" onClick={() => navigate('/profile')}>
            <ArrowLeft size={16} />
            <span>Back to Profile</span>
          </button>
          <h1 className="page-title gradient-text" style={{ fontSize: '2.5rem', marginTop: '0.75rem' }}>Edit Account & Settings</h1>
          <p className="page-subtitle" style={{ margin: '0' }}>Update your personal details, change security credentials, or manage account settings</p>
        </div>
      </div>

      <div className="edit-sections-grid">
        {/* Section 1: Update Profile Details */}
        <div className="form-card edit-card">
          <h3 className="section-card-title">Personal Details</h3>
          <p className="section-card-desc">Update your display name, phone, and bio.</p>

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profile Bio</label>
              <textarea
                rows={3}
                className="form-textarea"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={updatingProfile}>
              <Save size={16} />
              <span>{updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Section 2: Change Password */}
        <div className="form-card edit-card">
          <h3 className="section-card-title">Security & Password</h3>
          <p className="section-card-desc">Update your login password securely.</p>

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                placeholder="Minimum 6 characters"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-secondary" disabled={updatingPassword}>
              <Lock size={16} />
              <span>{updatingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>

        {/* Section 3: Delete Account (CRUD: Delete) */}
        <div className="form-card edit-card danger-zone-card">
          <h3 className="danger-zone-title">Danger Zone: Delete Account</h3>
          <p className="danger-zone-desc">
            Deleting your account removes your credentials from <code>users.txt</code>.
            Accounts with active bookings or completed payment records cannot be deleted to preserve financial audit integrity.
          </p>

          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowDeleteModal(true)}
            disabled={user?.role === 'ADMIN'}
          >
            <Trash2 size={16} />
            <span>{user?.role === 'ADMIN' ? 'Admin Protected' : 'Delete My Account'}</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete User Account?"
        message="Are you sure you want to permanently delete your account? This action checks for linked bookings or payments before proceeding."
        confirmText={deleting ? 'Deleting...' : 'Yes, Delete Account'}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        isDanger={true}
      />
    </div>
  );
}
