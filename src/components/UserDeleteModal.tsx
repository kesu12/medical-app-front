import React from 'react';
import Modal from './Modal';
import '../App.css';
import { AdminUser } from '../api/adminUsers';

type UserDeleteModalProps = {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onConfirm?: () => void;
};

function UserDeleteModal({ open, user, onClose, onConfirm }: UserDeleteModalProps) {
  function getUserFullName(user: AdminUser): string {
    const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : user.username;
  }

  return (
    <Modal open={open} title="Delete User" onClose={onClose}>
      <form className="form" onSubmit={(e) => {
        e.preventDefault();
        if (onConfirm) {
          onConfirm();
        }
      }}>
        {user && (
          <p>
            Are you sure you want to delete the user <strong>{getUserFullName(user)}</strong> ({user.username})? 
            This action cannot be undone.
          </p>
        )}
        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--danger">
            Delete
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default UserDeleteModal;

