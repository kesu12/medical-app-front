import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { changePassword } from '../api/auth';
import '../App.css';

function Settings() {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  
  // Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/');
      return;
    }
  }, [user, userLoading, navigate]);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordChanged(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setSubmittingPassword(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      setPasswordChanged(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordChanged(false), 5000);
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to change password');
    } finally {
      setSubmittingPassword(false);
    }
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  function getUserFullName(): string {
    if (!user) return '';
    const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : user.username;
  }

  const roleLabels: Record<string, string> = {
    'DOCTOR': 'Doctor',
    'NURSE': 'Nurse',
    'ADMIN': 'Administrator',
    'PATIENT': 'Patient',
    'DEFAULT': 'User'
  };

  if (userLoading) {
    return (
      <div className="page">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="page">
      <div className="settings">
        <h1 className="settings__title">Settings</h1>

        {/* Account Information */}
        <div className="settings__section">
          <h2 className="settings__section-title">Account Information</h2>
          <div className="settings__info-grid">
            <div className="settings__info-item">
              <span className="settings__info-label">Username</span>
              <span className="settings__info-value">{user.username}</span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">Full Name</span>
              <span className="settings__info-value">{getUserFullName()}</span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">Email</span>
              <span className="settings__info-value">{user.email}</span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">Phone Number</span>
              <span className="settings__info-value">{user.phoneNumber || 'Not set'}</span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">Role</span>
              <span className="settings__info-value">{roleLabels[user.role] || user.role}</span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">Account Status</span>
              <span className={`settings__info-value ${user.confirmed ? 'settings__info-value--confirmed' : 'settings__info-value--unconfirmed'}`}>
                {user.confirmed ? 'Confirmed' : 'Unconfirmed'}
              </span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">Member Since</span>
              <span className="settings__info-value">{formatDate(user.createdAt)}</span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">Last Updated</span>
              <span className="settings__info-value">{formatDate(user.updatedAt)}</span>
            </div>
          </div>
          <p className="settings__note">
            To update your profile information, please visit the <Link to="/profile" className="settings__link">Profile</Link> page.
          </p>
        </div>

        {/* Change Password */}
        <div className="settings__section">
          <h2 className="settings__section-title">Change Password</h2>
          <form className="settings__form" onSubmit={handlePasswordChange}>
            <label className="form__field">
              <span className="form__label">Current Password *</span>
              <input
                type="password"
                className="form__input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter your current password..."
              />
            </label>
            <label className="form__field">
              <span className="form__label">New Password *</span>
              <input
                type="password"
                className="form__input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter your new password (min. 6 characters)..."
              />
            </label>
            <label className="form__field">
              <span className="form__label">Confirm New Password *</span>
              <input
                type="password"
                className="form__input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirm your new password..."
              />
            </label>
            {passwordError && (
              <div className="form__error">{passwordError}</div>
            )}
            {passwordChanged && (
              <div className="settings__success">
                Password changed successfully!
              </div>
            )}
            <div className="form__actions">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={submittingPassword}
              >
                {submittingPassword ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Information */}
        <div className="settings__section">
          <h2 className="settings__section-title">Security</h2>
          <div className="settings__security-info">
            <p className="settings__security-text">
              For your security, please keep your password confidential and change it regularly.
            </p>
            <ul className="settings__security-list">
              <li>Use a strong password with at least 6 characters</li>
              <li>Don't share your password with anyone</li>
              <li>Change your password if you suspect it has been compromised</li>
              <li>Log out when using shared devices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
