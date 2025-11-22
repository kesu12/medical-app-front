import React from 'react';
import Modal from './Modal';
import '../App.css';
import { AdminUser } from '../api/adminUsers';
import { useLanguage } from '../contexts/LanguageContext';

type UserDeleteModalProps = {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onConfirm?: () => void;
};

function UserDeleteModal({ open, user, onClose, onConfirm }: UserDeleteModalProps) {
  const { t } = useLanguage();
  
  function getUserFullName(user: AdminUser): string {
    const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : user.username;
  }

  return (
    <Modal open={open} title={t('userDelete.deleteUser')} onClose={onClose}>
      <form className="form" onSubmit={(e) => {
        e.preventDefault();
        if (onConfirm) {
          onConfirm();
        }
      }}>
        {user && (
          <p>
            {t('userDelete.confirmDelete')} <strong>{getUserFullName(user)}</strong> ({user.username})? 
            {t('departmentModal.cannotUndo')}
          </p>
        )}
        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t('modal.cancel')}
          </button>
          <button type="submit" className="btn btn--danger">
            {t('common.delete')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default UserDeleteModal;

