import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getAllDoctors, getDoctorsByDepartment, Doctor } from '../api/doctors';
import { getAllDepartments, Department } from '../api/departments';
import '../App.css';

function Doctors() {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/');
      return;
    }
  }, [user, userLoading, navigate]);

  useEffect(() => {
    async function loadDepartments() {
      if (!user) return;
      
      try {
        const departmentsData = await getAllDepartments();
        setDepartments(departmentsData);
      } catch (err: any) {
        console.error('Failed to load departments:', err);
        // Don't set error here, just log it
      }
    }
    
    if (user) {
      loadDepartments();
    }
  }, [user]);

  useEffect(() => {
    async function loadDoctors() {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const doctorsData = await getAllDoctors();
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
      } catch (err: any) {
        setError(err?.message || 'Failed to load doctors');
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadDoctors();
    }
  }, [user]);

  useEffect(() => {
    let filtered = [...doctors];

    // Filter by department
    if (selectedDepartment !== null) {
      filtered = filtered.filter(doctor => {
        const deptId = doctor.department?.departmentId || doctor.department?.id;
        return deptId === selectedDepartment;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doctor => {
        const fullName = `${doctor.firstName || ''} ${doctor.middleName || ''} ${doctor.lastName || ''}`.toLowerCase();
        const username = doctor.username.toLowerCase();
        const email = doctor.email.toLowerCase();
        const department = doctor.department?.name.toLowerCase() || '';
        
        return fullName.includes(query) || 
               username.includes(query) || 
               email.includes(query) ||
               department.includes(query);
      });
    }

    setFilteredDoctors(filtered);
  }, [doctors, searchQuery, selectedDepartment]);

  async function handleDepartmentChange(departmentId: number | null) {
    // Validate departmentId - ensure it's not NaN or invalid
    if (departmentId !== null && (isNaN(departmentId) || departmentId <= 0)) {
      departmentId = null;
    }
    
    setSelectedDepartment(departmentId);
    setLoading(true);
    
    try {
      let doctorsData: Doctor[];
      if (departmentId === null) {
        doctorsData = await getAllDoctors();
      } else {
        doctorsData = await getDoctorsByDepartment(departmentId);
      }
      setDoctors(doctorsData);
      // Don't update departments - keep the full list loaded separately
    } catch (err: any) {
      setError(err?.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }

  function getDoctorFullName(doctor: Doctor): string {
    const parts = [doctor.firstName, doctor.middleName, doctor.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : doctor.username;
  }

  if (userLoading || loading) {
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
      <div className="doctors">
        <h1 className="doctors__title">Doctors</h1>
        
        {error && (
          <div className="doctors__error form__error">{error}</div>
        )}

        {/* Search and Filters */}
        <div className="doctors__filters">
          <div className="doctors__search">
            <input
              type="text"
              className="form__input"
              placeholder="Search by name, username, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="doctors__department-filter">
            <label className="form__field">
              <span className="form__label">Department</span>
              <select
                className="form__input"
                value={selectedDepartment || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleDepartmentChange(null);
                  } else {
                    const deptId = parseInt(value, 10);
                    if (!isNaN(deptId) && deptId > 0) {
                      handleDepartmentChange(deptId);
                    } else {
                      handleDepartmentChange(null);
                    }
                  }
                }}
              >
                <option value="">All Departments</option>
                {departments
                  .filter(dept => {
                    const deptId = dept.departmentId ?? dept.id;
                    return deptId != null && !isNaN(Number(deptId));
                  })
                  .map(dept => {
                    const deptId = dept.departmentId ?? dept.id;
                    return (
                      <option key={deptId} value={deptId}>
                        {dept.name}
                      </option>
                    );
                  })}
              </select>
            </label>
          </div>
        </div>

        {/* Results count */}
        <div className="doctors__results-count">
          {filteredDoctors.length === 0 ? (
            <p>No doctors found</p>
          ) : (
            <p>
              {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Doctors Grid */}
        <div className="doctors__grid">
          {filteredDoctors.map(doctor => (
            <div key={doctor.userId} className="doctors__card">
              <div className="doctors__card-avatar">
                <img
                  src={doctor.avatarUrl || '/avatar.png'}
                  alt={getDoctorFullName(doctor)}
                  className="doctors__avatar"
                />
              </div>
              <div className="doctors__card-content">
                <h3 className="doctors__card-name">{getDoctorFullName(doctor)}</h3>
                <p className="doctors__card-username">@{doctor.username}</p>
                {doctor.department && (
                  <p className="doctors__card-department">
                    <span className="doctors__card-label">Department:</span> {doctor.department.name}
                  </p>
                )}
                {doctor.email && (
                  <p className="doctors__card-email">
                    <span className="doctors__card-label">Email:</span> {doctor.email}
                  </p>
                )}
                {doctor.phoneNumber && (
                  <p className="doctors__card-phone">
                    <span className="doctors__card-label">Phone:</span> {doctor.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Doctors;
