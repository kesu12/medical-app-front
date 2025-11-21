import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getAllDoctors, getDoctorsByDepartment, extractDepartmentsFromDoctors, Doctor, Department } from '../api/doctors';
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
    async function loadData() {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const doctorsData = await getAllDoctors();
        const departmentsData = extractDepartmentsFromDoctors(doctorsData);
        
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
        setDepartments(departmentsData);
      } catch (err: any) {
        setError(err?.message || 'Failed to load doctors');
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    let filtered = [...doctors];

    // Filter by department
    if (selectedDepartment !== null) {
      filtered = filtered.filter(doctor => 
        doctor.department?.departmentId === selectedDepartment
      );
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
      // Update departments list from new doctors data
      const departmentsData = extractDepartmentsFromDoctors(doctorsData);
      setDepartments(departmentsData);
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
                  handleDepartmentChange(value === '' ? null : parseInt(value));
                }}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.name}
                  </option>
                ))}
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
