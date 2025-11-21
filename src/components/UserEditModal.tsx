import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import '../App.css';
import { AdminUser, UserRole, updateUserAdmin } from '../api/adminUsers';
import { getAllDepartments, Department } from '../api/departments';

type UserEditModalProps = {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSuccess: () => void;
};

function UserEditModal({ open, user, onClose, onSuccess }: UserEditModalProps) {
  const [role, setRole] = useState<UserRole>('DEFAULT');
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setRole(user.role);
      setDepartmentId(user.department?.id || user.department?.departmentId);
      setIsConfirmed(user.confirmed || false);
    }
    setError(null);
  }, [user, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSubmitting(true);

    try {
      await updateUserAdmin(user.userId, {
        role,
        departmentId,
        isConfirmed
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
    <Modal open={open} title="Edit User" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <label className="form__field">
          <span className="form__label">Role *</span>
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
          <span className="form__label">Department</span>
          <select
            className="form__input"
            value={departmentId || ''}
            onChange={(e) => setDepartmentId(e.target.value ? parseInt(e.target.value) : undefined)}
          >
            <option value="">No Department</option>
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

        <label className="form__field">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
            />
            <span className="form__label">Confirmed</span>
          </div>
        </label>

        {error && <div className="form__error">{error}</div>}
        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default UserEditModal;

