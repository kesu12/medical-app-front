import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import AvatarEditModal from './AvatarEditModal';
import '../App.css';
import { AdminUser, UserRole, updateUserAdmin } from '../api/adminUsers';
import { getAllDepartments, Department } from '../api/departments';
import { useLanguage } from '../contexts/LanguageContext';

type UserEditModalProps = {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSuccess: () => void;
};

function UserEditModal({ open, user, onClose, onSuccess }: UserEditModalProps) {
  const { t } = useLanguage();
  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Role and department
  const [role, setRole] = useState<UserRole>('DEFAULT');
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarEditOpen, setAvatarEditOpen] = useState(false);

  useEffect(() => {
    async function loadDepartments() {
      try {
        const data = await getAllDepartments();
        setDepartments(data);
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    }
    
    if (open) {
      loadDepartments();
    }
  }, [open]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setMiddleName(user.middleName || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
      setAvatarUrl(user.avatarUrl || '');
      setRole(user.role);
      setDepartmentId(user.department?.id || user.department?.departmentId);
    }
    setError(null);
  }, [user, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSubmitting(true);

    try {
      // Always send current confirmed status to preserve it when only changing department
      const currentConfirmed = user.confirmed || false;
      await updateUserAdmin(user.userId, {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        middleName: middleName.trim() || undefined,
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        role,
        departmentId,
        isConfirmed: currentConfirmed // Preserve current status
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} title={t('userEdit.editUser')} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form__row form__row--two-columns">
          <label className="form__field">
            <span className="form__label">{t('auth.firstName')}</span>
            <input
              type="text"
              className="form__input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t('userEdit.enterFirstName')}
            />
          </label>

          <label className="form__field">
            <span className="form__label">{t('auth.lastName')}</span>
            <input
              type="text"
              className="form__input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t('userEdit.enterLastName')}
            />
          </label>
        </div>

        <label className="form__field">
          <span className="form__label">{t('auth.middleName')}</span>
          <input
            type="text"
            className="form__input"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder={t('userEdit.enterMiddleName')}
          />
        </label>

        <label className="form__field">
          <span className="form__label">{t('common.email')} *</span>
          <input
            type="email"
            className="form__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t('userEdit.enterEmail')}
          />
        </label>

        <label className="form__field">
          <span className="form__label">{t('userEdit.phoneNumber')}</span>
          <input
            type="tel"
            className="form__input"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder={t('userEdit.enterPhone')}
          />
        </label>

        <div className="form__field">
          <span className="form__label">{t('profile.avatar')}</span>
          <div className="user-edit__avatar-section">
            <div className="user-edit__avatar-wrapper">
              <img
                src={avatarUrl || '/avatar.png'}
                alt="Avatar"
                className="user-edit__avatar"
              />
              <button
                type="button"
                className="user-edit__avatar-btn"
                onClick={() => setAvatarEditOpen(true)}
              >
                {t('profile.changeAvatar')}
              </button>
            </div>
          </div>
        </div>

        <label className="form__field">
          <span className="form__label">{t('userEdit.roleRequired')}</span>
          <select
            className="form__input"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            required
          >
            <option value="ADMIN">Admin</option>
            <option value="DOCTOR">Doctor</option>
            <option value="NURSE">Nurse</option>
            <option value="PATIENT">Patient</option>
            <option value="DEFAULT">Default</option>
          </select>
        </label>

        <label className="form__field">
          <span className="form__label">{t('cabinet.department')}</span>
          <select
            className="form__input"
            value={departmentId || ''}
            onChange={(e) => setDepartmentId(e.target.value ? parseInt(e.target.value) : undefined)}
          >
            <option value="">{t('userEdit.noDepartment')}</option>
            {departments.map(dept => {
              const deptId = dept.id || dept.departmentId;
              return (
                <option key={deptId} value={deptId}>
                  {dept.name}
                </option>
              );
            })}
          </select>
        </label>

        {/* Confirmed status is hidden - it's for email confirmation (future feature) */}

        {error && <div className="form__error">{error}</div>}
        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
            {t('modal.cancel')}
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? t('profile.saving') : t('modal.save')}
          </button>
        </div>
      </form>
      
      <AvatarEditModal
        open={avatarEditOpen}
        onClose={() => setAvatarEditOpen(false)}
        onSave={(newAvatarUrl) => {
          setAvatarUrl(newAvatarUrl);
          setAvatarEditOpen(false);
        }}
        currentAvatarUrl={avatarUrl}
      />
    </Modal>
  );
}

export default UserEditModal;
