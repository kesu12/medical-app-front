import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import '../App.css';
import { Department, createDepartment, updateDepartment, deleteDepartment } from '../api/departments';

type DepartmentModalProps = {
  open: boolean;
  mode: 'create' | 'update' | 'delete';
  department?: Department;
  onClose: () => void;
  onSuccess: () => void;
};

function DepartmentModal({ open, mode, department, onClose, onSuccess }: DepartmentModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'update' && department) {
      setName(department.name || '');
      setDescription(department.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setError(null);
  }, [mode, department, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'create') {
        await createDepartment({ name, description: description || undefined });
      } else if (mode === 'update' && department) {
        const id = department.id || department.departmentId;
        if (!id) throw new Error('Department ID is required');
        await updateDepartment(id, { name, description: description || undefined });
      } else if (mode === 'delete' && department) {
        const id = department.id || department.departmentId;
        if (!id) throw new Error('Department ID is required');
        await deleteDepartment(id);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const title = mode === 'create' 
    ? 'Create Department' 
    : mode === 'update' 
    ? 'Update Department' 
    : 'Delete Department';

  return (
    <Modal open={open} title={title} onClose={onClose}>
      {mode === 'delete' ? (
        <form className="form" onSubmit={handleSubmit}>
          <p>Are you sure you want to delete the department "{department?.name}"? This action cannot be undone.</p>
          {error && <div className="form__error">{error}</div>}
          <div className="form__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--danger" disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </form>
      ) : (
        <form className="form" onSubmit={handleSubmit}>
          <label className="form__field">
            <span className="form__label">Name *</span>
            <input
              type="text"
              className="form__input"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Enter department name..."
            />
          </label>
          <label className="form__field">
            <span className="form__label">Description</span>
            <textarea
              className="form__input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter department description..."
              rows={4}
            />
          </label>
          {error && <div className="form__error">{error}</div>}
          <div className="form__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default DepartmentModal;

