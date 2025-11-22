import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getAllDepartments, Department } from '../api/departments';
import DepartmentModal from '../components/DepartmentModal';
import '../App.css';

function Departments() {
  const { user, loading: userLoading } = useUser();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'update' | 'delete'>('create');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>();

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/');
      return;
    }
  }, [user, userLoading, navigate]);

  useEffect(() => {
    async function loadDepartments() {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getAllDepartments();
        setDepartments(data);
      } catch (err: any) {
        // If user is not admin, they might not have access to this endpoint
        // In that case, we could extract departments from doctors or show empty list
        if (err?.message?.includes('403') || err?.message?.includes('Forbidden')) {
          setError(t('departments.noPermission'));
        } else {
          setError(err?.message || 'Failed to load departments');
        }
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadDepartments();
    }
  }, [user, t]);

  function handleCreate() {
    setSelectedDepartment(undefined);
    setModalMode('create');
    setModalOpen(true);
  }

  function handleUpdate(department: Department) {
    setSelectedDepartment(department);
    setModalMode('update');
    setModalOpen(true);
  }

  function handleDelete(department: Department) {
    setSelectedDepartment(department);
    setModalMode('delete');
    setModalOpen(true);
  }

  async function handleModalSuccess() {
    // Reload departments after create/update/delete
    setLoading(true);
    setError(null);
    try {
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to reload departments');
    } finally {
      setLoading(false);
    }
  }

  if (userLoading || loading) {
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
      <div className="departments">
        <div className="departments__header">
          <h1 className="departments__title">{t('departments.title')}</h1>
          {isAdmin && (
            <button className="btn btn--primary" onClick={handleCreate}>
              {t('departments.createDepartment')}
            </button>
          )}
        </div>
        
        {error && (
          <div className="departments__error form__error">{error}</div>
        )}

        {departments.length === 0 && !error ? (
          <div className="departments__empty">
            <p>{t('departments.noDepartments')}</p>
          </div>
        ) : (
          <div className="departments__grid">
            {departments.map(dept => {
              const deptId = dept.id || dept.departmentId;
              return (
                <div key={deptId} className="departments__card">
                  <div className="departments__card-content">
                    <h3 className="departments__card-name">{dept.name}</h3>
                    {dept.description && (
                      <p className="departments__card-description">{dept.description}</p>
                    )}
                    {dept.users && Array.isArray(dept.users) && (
                      <p className="departments__card-count">
                        {dept.users.length} {dept.users.length === 1 ? t('departments.member') : t('departments.members')}
                      </p>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="departments__card-actions">
                      <button
                        className="btn btn--update"
                        onClick={() => handleUpdate(dept)}
                      >
                        {t('common.update')}
                      </button>
                      <button
                        className="btn btn--delete"
                        onClick={() => handleDelete(dept)}
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <DepartmentModal
          open={modalOpen}
          mode={modalMode}
          department={selectedDepartment}
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
}

export default Departments;

