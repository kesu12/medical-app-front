import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { updateProfile } from '../api/auth';
import AvatarEditModal from '../components/AvatarEditModal';
import '../App.css';

function Profile() {
  const { user, loading, refreshUser, logout } = useUser();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Общая информация
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [generalChanged, setGeneralChanged] = useState(false);

  // Контактная информация
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactChanged, setContactChanged] = useState(false);

  const [submittingGeneral, setSubmittingGeneral] = useState(false);
  const [submittingContact, setSubmittingContact] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarEditOpen, setAvatarEditOpen] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setMiddleName(user.middleName || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
      setGeneralChanged(false);
      setContactChanged(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const generalHasChanged = 
        firstName !== (user.firstName || '') ||
        lastName !== (user.lastName || '') ||
        middleName !== (user.middleName || '');
      setGeneralChanged(generalHasChanged);
    }
  }, [firstName, lastName, middleName, user]);

  useEffect(() => {
    if (user) {
      const contactHasChanged = 
        email !== (user.email || '') ||
        phoneNumber !== (user.phoneNumber || '');
      setContactChanged(contactHasChanged);
    }
  }, [email, phoneNumber, user]);

  async function handleGeneralSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!generalChanged || !user) return;

    setSubmittingGeneral(true);
    setError(null);
    try {
      await updateProfile({
        firstName: firstName,
        lastName: lastName,
        middleName: middleName
      });
      await refreshUser();
      setGeneralChanged(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setSubmittingGeneral(false);
    }
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactChanged || !user) return;

    setSubmittingContact(true);
    setError(null);
    try {
      await updateProfile({
        email: email,
        phoneNumber: phoneNumber
      });
      await refreshUser();
      setContactChanged(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setSubmittingContact(false);
    }
  }

  async function handleAvatarSave(avatarUrl: string) {
    if (!user) return;

    setError(null);
    try {
      await updateProfile({
        avatarUrl: avatarUrl
      });
      await refreshUser();
    } catch (err: any) {
      setError(err?.message || 'Failed to update avatar');
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  if (loading) {
    return (
      <div className="page">
        <div>{t('common.loading')}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <div>Please log in to view your profile.</div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    'DOCTOR': 'Doctor',
    'NURSE': 'Nurse',
    'ADMIN': 'Administrator',
    'PATIENT': 'Patient',
    'DEFAULT': 'User'
  };

  return (
    <div className="page">
      <div className="profile">
        <h1 className="profile__title">{t('profile.title')}</h1>
        <div className="profile__content">
          <div className="profile__avatar-section">
            <div
              className="profile__avatar-wrapper"
              onMouseEnter={() => setAvatarHovered(true)}
              onMouseLeave={() => setAvatarHovered(false)}
            >
              <img
                src={user.avatarUrl || '/avatar.png'}
                alt="Avatar"
                className="profile__avatar"
              />
              {avatarHovered && (
                <button
                  className="profile__avatar-edit-btn"
                  onClick={() => setAvatarEditOpen(true)}
                  aria-label="Edit avatar"
                >
                  +
                </button>
              )}
            </div>
            <div className="profile__role">{roleLabels[user.role] || user.role}</div>
          </div>
          <AvatarEditModal
            open={avatarEditOpen}
            onClose={() => setAvatarEditOpen(false)}
            onSave={handleAvatarSave}
            currentAvatarUrl={user.avatarUrl}
          />
          <div className="profile__info">
            {error && <div className="form__error">{error}</div>}
            
            {/* Общая информация */}
            <div className="profile__section">
              <h2 className="profile__section-title">{t('profile.generalInfo')}</h2>
              <form onSubmit={handleGeneralSubmit} className="profile__form">
                <div className="profile__form-row">
                  <label className="profile__form-field">
                    <span className="profile__form-label">{t('auth.firstName')}</span>
                    <input
                      type="text"
                      className="profile__form-input"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder={t('auth.firstName')}
                    />
                  </label>
                  <label className="profile__form-field">
                    <span className="profile__form-label">{t('auth.middleName')}</span>
                    <input
                      type="text"
                      className="profile__form-input"
                      value={middleName}
                      onChange={e => setMiddleName(e.target.value)}
                      placeholder={t('auth.middleName')}
                    />
                  </label>
                </div>
                <label className="profile__form-field">
                  <span className="profile__form-label">{t('auth.lastName')}</span>
                  <input
                    type="text"
                    className="profile__form-input"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder={t('auth.lastName')}
                  />
                </label>
                <button
                  type="submit"
                  className="btn btn--primary profile__submit-btn"
                  disabled={!generalChanged || submittingGeneral || submittingContact}
                >
                  {submittingGeneral ? t('profile.saving') : t('profile.saveChanges')}
                </button>
              </form>
            </div>

            {/* Контактная информация */}
            <div className="profile__section">
              <h2 className="profile__section-title">{t('profile.contactInfo')}</h2>
              <form onSubmit={handleContactSubmit} className="profile__form">
                <label className="profile__form-field">
                  <span className="profile__form-label">{t('common.email')}</span>
                  <input
                    type="email"
                    className="profile__form-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('common.email')}
                  />
                </label>
                <label className="profile__form-field">
                  <span className="profile__form-label">{t('common.phone')}</span>
                  <input
                    type="tel"
                    className="profile__form-input"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder={t('common.phone')}
                  />
                </label>
                <button
                  type="submit"
                  className="btn btn--primary profile__submit-btn"
                  disabled={!contactChanged || submittingContact || submittingGeneral}
                >
                  {submittingContact ? t('profile.saving') : t('profile.saveChanges')}
                </button>
              </form>
            </div>

            {/* Кнопка Log Out */}
            <div className="profile__logout-section">
              <button
                className="btn btn--ghost profile__logout-btn"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
