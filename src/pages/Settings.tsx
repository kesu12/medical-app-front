import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { changePassword } from '../api/auth';
import '../App.css';

function Settings() {
  const { user, loading: userLoading } = useUser();
  const { language, setLanguage, t } = useLanguage();
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
      setPasswordError(t('settings.passwordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t('settings.passwordTooShort'));
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

  const getRoleLabel = (role: string): string => {
    const roleMap: Record<string, string> = {
      'DOCTOR': t('settings.roleDoctor'),
      'NURSE': t('settings.roleNurse'),
      'ADMIN': t('settings.roleAdmin'),
      'PATIENT': t('settings.rolePatient'),
      'DEFAULT': t('settings.roleDefault')
    };
    return roleMap[role] || role;
  };

  if (userLoading) {
    return (
      <div className="page">
        <div>{t('common.loading')}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="page">
      <div className="settings">
        <h1 className="settings__title">{t('settings.title')}</h1>

        {/* Language Selection */}
        <div className="settings__section">
          <h2 className="settings__section-title">{t('settings.language')}</h2>
          <div className="settings__form">
            <label className="form__field">
              <span className="form__label">{t('settings.selectLanguage')}</span>
              <select
                className="form__input"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'ru')}
              >
                <option value="en">{t('settings.english')}</option>
                <option value="ru">{t('settings.russian')}</option>
              </select>
            </label>
          </div>
        </div>

        {/* Account Information */}
        <div className="settings__section">
          <h2 className="settings__section-title">{t('settings.accountInfo')}</h2>
          <div className="settings__info-grid">
            <div className="settings__info-item">
              <span className="settings__info-label">{t('settings.username')}</span>
              <span className="settings__info-value">{user.username}</span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">{t('settings.fullName')}</span>
              <span className="settings__info-value">{getUserFullName()}</span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">{t('common.email')}</span>
              <span className="settings__info-value">{user.email}</span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">{t('settings.phoneNumber')}</span>
              <span className="settings__info-value">{user.phoneNumber || t('settings.notSet')}</span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">{t('common.role')}</span>
              <span className="settings__info-value">{getRoleLabel(user.role)}</span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">{t('settings.accountStatus')}</span>
              <span className={`settings__info-value ${user.confirmed ? 'settings__info-value--confirmed' : 'settings__info-value--unconfirmed'}`}>
                {user.confirmed ? t('settings.confirmed') : t('settings.unconfirmed')}
              </span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">{t('settings.memberSince')}</span>
              <span className="settings__info-value">{formatDate(user.createdAt)}</span>
            </div>
            <div className="settings__info-item">
              <span className="settings__info-label">{t('settings.lastUpdated')}</span>
              <span className="settings__info-value">{formatDate(user.updatedAt)}</span>
            </div>
          </div>
          <p className="settings__note">
            {t('settings.updateProfileNote')} <Link to="/profile" className="settings__link">{t('settings.profilePage')}</Link> {t('settings.page')}
          </p>
        </div>

        {/* Change Password */}
        <div className="settings__section">
          <h2 className="settings__section-title">{t('settings.changePassword')}</h2>
          <form className="settings__form" onSubmit={handlePasswordChange}>
            <label className="form__field">
              <span className="form__label">{t('settings.currentPasswordRequired')}</span>
              <input
                type="password"
                className="form__input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder={t('settings.enterCurrentPassword')}
              />
            </label>
            <label className="form__field">
              <span className="form__label">{t('settings.newPasswordRequired')}</span>
              <input
                type="password"
                className="form__input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder={t('settings.enterNewPassword')}
              />
            </label>
            <label className="form__field">
              <span className="form__label">{t('settings.confirmNewPasswordRequired')}</span>
              <input
                type="password"
                className="form__input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder={t('settings.confirmNewPassword')}
              />
            </label>
            {passwordError && (
              <div className="form__error">{passwordError}</div>
            )}
            {passwordChanged && (
              <div className="settings__success">
                {t('settings.passwordChangedSuccess')}
              </div>
            )}
            <div className="form__actions">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={submittingPassword}
              >
                {submittingPassword ? t('settings.changingPassword') : t('settings.changePassword')}
              </button>
            </div>
          </form>
        </div>

        {/* Security Information */}
        <div className="settings__section">
          <h2 className="settings__section-title">{t('settings.security')}</h2>
          <div className="settings__security-info">
            <p className="settings__security-text">
              {t('settings.securityInfo')}
            </p>
            <ul className="settings__security-list">
              <li>{t('settings.securityTip1')}</li>
              <li>{t('settings.securityTip2')}</li>
              <li>{t('settings.securityTip3')}</li>
              <li>{t('settings.securityTip4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
