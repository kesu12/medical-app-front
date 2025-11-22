import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import '../App.css';
import { Department, createDepartment, updateDepartment, deleteDepartment } from '../api/departments';
import { useLanguage } from '../contexts/LanguageContext';

type DepartmentModalProps = {
  open: boolean;
  mode: 'create' | 'update' | 'delete';
  department?: Department;
  onClose: () => void;
  onSuccess: () => void;
};

function DepartmentModal({ open, mode, department, onClose, onSuccess }: DepartmentModalProps) {
  const { t } = useLanguage();
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
    ? t('departmentModal.createDepartment')
    : mode === 'update' 
    ? t('departmentModal.updateDepartment')
    : t('departmentModal.deleteDepartment');

  return (
    <Modal open={open} title={title} onClose={onClose}>
      {mode === 'delete' ? (
        <form className="form" onSubmit={handleSubmit}>
          <p>{t('departmentModal.deleteConfirm')} "{department?.name}"? {t('departmentModal.cannotUndo')}</p>
          {error && <div className="form__error">{error}</div>}
          <div className="form__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
              {t('modal.cancel')}
            </button>
            <button type="submit" className="btn btn--danger" disabled={submitting}>
              {submitting ? t('departmentModal.deleting') : t('common.delete')}
            </button>
          </div>
        </form>
      ) : (
        <form className="form" onSubmit={handleSubmit}>
          <label className="form__field">
            <span className="form__label">{t('departmentModal.nameRequired')}</span>
            <input
              type="text"
              className="form__input"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder={t('departmentModal.enterName')}
            />
          </label>
          <label className="form__field">
            <span className="form__label">{t('departments.description')}</span>
            <textarea
              className="form__input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('departmentModal.enterDescription')}
              rows={4}
            />
          </label>
          {error && <div className="form__error">{error}</div>}
          <div className="form__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
              {t('modal.cancel')}
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? t('profile.saving') : mode === 'create' ? t('common.create') : t('common.update')}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default DepartmentModal;

