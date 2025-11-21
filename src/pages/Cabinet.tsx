import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import {
  getActivePatients,
  getPatientsWithoutDoctor,
  getPatientsByDoctor,
  getPatientsByDepartment,
  getPatientInfo,
  assignDoctorToPatient,
  assignNurseToPatient,
  assignDepartmentToPatient,
  updatePatientTreatment,
  getPatientTreatment,
  getAllNurses,
  Patient
} from '../api/patients';
import { getLatestIndicators } from '../api/medicalIndicators';
import { getAllDepartments, Department } from '../api/departments';
import '../App.css';

// WebSocket types
type MedicalIndicators = {
  heartrate: number;
  temperature: number;
  spo2: number;
  timestamp?: string;
  patientId?: number;
};

// WebSocket client types
type StompClient = {
  connected: boolean;
  subscribe: (destination: string, callback: (message: { body: string }) => void) => { unsubscribe: () => void };
  publish: (params: { destination: string; body: string }) => void;
  activate: () => void;
  deactivate: () => void;
};

type StompSubscription = {
  unsubscribe: () => void;
};

function Cabinet() {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  
  // WebSocket
  const stompClientRef = useRef<StompClient | null>(null);
  const subscriptionsRef = useRef<Map<number, StompSubscription>>(new Map());
  const [indicators, setIndicators] = useState<Map<number, MedicalIndicators>>(new Map());
  const [monitoringPatients, setMonitoringPatients] = useState<Set<number>>(new Set());
  
  // Data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [nurses, setNurses] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters (for NURSE)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  
  // Modals
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [selectedPatientForTreatment, setSelectedPatientForTreatment] = useState<Patient | null>(null);
  const [treatmentText, setTreatmentText] = useState('');
  const [showAssignNurseModal, setShowAssignNurseModal] = useState(false);
  const [selectedPatientForNurse, setSelectedPatientForNurse] = useState<Patient | null>(null);
  const [showAssignDepartmentModal, setShowAssignDepartmentModal] = useState(false);
  const [selectedPatientForDepartment, setSelectedPatientForDepartment] = useState<Patient | null>(null);

  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/');
      return;
    }
    
    if (user && (user.role === 'DEFAULT' || user.role === 'ADMIN')) {
      navigate('/');
      return;
    }
  }, [user, userLoading, navigate]);

  // Initialize WebSocket
  useEffect(() => {
    if (!user || (user.role !== 'PATIENT' && user.role !== 'DOCTOR')) {
      return;
    }

    // Dynamically import WebSocket libraries
    const initWebSocket = async () => {
      try {
        // @ts-ignore - Dynamic import
        const SockJS = (await import('sockjs-client')).default;
        // @ts-ignore - Dynamic import
        const { Client } = await import('@stomp/stompjs');
        
        const socket = new SockJS(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/ws`);
        const client = new Client({
          webSocketFactory: () => socket as any,
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('WebSocket connected');
          },
          onStompError: (frame: any) => {
            console.error('STOMP error:', frame);
          },
          onWebSocketError: (event: any) => {
            console.error('WebSocket error:', event);
          }
        });
        
        client.activate();
        stompClientRef.current = client as any;
      } catch (err) {
        console.error('Failed to initialize WebSocket:', err);
      }
    };

    initWebSocket();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [user]);

  // Load data based on role
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      if (!user) return; // Double check
      
      setLoading(true);
      setError(null);
      
      try {
        if (user.role === 'PATIENT') {
          const patientInfo = await getPatientInfo(user.userId);
          setPatients([patientInfo]);
        } else if (user.role === 'DOCTOR') {
          const [withoutDoctor, myPatients, depts] = await Promise.all([
            getPatientsWithoutDoctor(),
            getPatientsByDoctor(user.userId),
            getAllDepartments()
          ]);
          
          // Get patients from doctor's department without doctor
          let departmentPatients: Patient[] = [];
          if (user.department) {
            const deptId = user.department.id || user.department.departmentId;
            if (deptId) {
              const deptPatients = await getPatientsByDepartment(deptId);
              departmentPatients = deptPatients.filter(p => !p.assignedDoctor);
            }
          }
          
          // Combine and remove duplicates
          const allPatientsMap = new Map<number, Patient>();
          [...withoutDoctor, ...myPatients, ...departmentPatients].forEach(p => {
            allPatientsMap.set(p.userId, p);
          });
          setPatients(Array.from(allPatientsMap.values()));
          setDepartments(depts);
        } else if (user.role === 'NURSE') {
          const [allPatients, depts, allNurses] = await Promise.all([
            getActivePatients(),
            getAllDepartments(),
            getAllNurses()
          ]);
          setPatients(allPatients);
          setDepartments(depts);
          setNurses(allNurses);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  // Filter patients for NURSE
  useEffect(() => {
    if (user?.role !== 'NURSE') {
      setFilteredPatients(patients);
      return;
    }

    let filtered = [...patients];

    if (selectedDepartment !== null) {
      filtered = filtered.filter(patient => {
        const deptId = patient.department?.id || patient.department?.departmentId;
        return deptId === selectedDepartment;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(patient => {
        const fullName = `${patient.firstName || ''} ${patient.middleName || ''} ${patient.lastName || ''}`.toLowerCase();
        const username = patient.username.toLowerCase();
        const email = patient.email.toLowerCase();
        return fullName.includes(query) || username.includes(query) || email.includes(query);
      });
    }

    setFilteredPatients(filtered);
  }, [patients, searchQuery, selectedDepartment, user]);

  // Start monitoring indicators for a patient
  const startMonitoring = (patientId: number) => {
    const client = stompClientRef.current;
    if (!client || !client.connected) {
      alert('WebSocket not connected. Please wait a moment and try again.');
      return;
    }
    
    // Unsubscribe if already subscribed
    const existingSub = subscriptionsRef.current.get(patientId);
    if (existingSub) {
      existingSub.unsubscribe();
    }
    
    // Subscribe to patient indicators
    const subscription = client.subscribe(`/topic/medical-indicators/${patientId}`, (message: { body: string }) => {
      const data = JSON.parse(message.body);
      setIndicators(prev => new Map(prev).set(patientId, data));
    });
    
    subscriptionsRef.current.set(patientId, subscription);

    // Start monitoring
    client.publish({
      destination: '/app/start-monitoring',
      body: JSON.stringify(patientId)
    });
    
    setMonitoringPatients(prev => new Set(prev).add(patientId));
  };

  // Stop monitoring
  const stopMonitoring = (patientId: number) => {
    const client = stompClientRef.current;
    if (client && client.connected) {
      client.publish({
        destination: '/app/stop-monitoring',
        body: JSON.stringify(patientId)
      });
    }
    
    // Unsubscribe
    const subscription = subscriptionsRef.current.get(patientId);
    if (subscription) {
      subscription.unsubscribe();
      subscriptionsRef.current.delete(patientId);
    }
    
    setMonitoringPatients(prev => {
      const next = new Set(prev);
      next.delete(patientId);
      return next;
    });
    setIndicators(prev => {
      const next = new Map(prev);
      next.delete(patientId);
      return next;
    });
  };

  // Get indicators for patient (PATIENT role)
  const handleGetIndicators = () => {
    if (!user) return;
    
    const client = stompClientRef.current;
    if (!client || !client.connected) {
      alert('WebSocket not connected. Please wait a moment and try again.');
      return;
    }

    startMonitoring(user.userId);
  };

  // Get last indicators for patient (DOCTOR role)
  const handleGetLastIndicators = async (patientId: number) => {
    try {
      const latestData = await getLatestIndicators(patientId);
      setIndicators(prev => new Map(prev).set(patientId, latestData));
    } catch (err: any) {
      alert(err?.message || 'Failed to load latest indicators');
    }
  };

  // Assign doctor to patient
  const handleAssignDoctor = async (patientId: number) => {
    if (!user) return;
    const currentUser = user; // Capture for closure
    
    try {
      await assignDoctorToPatient(patientId, currentUser.userId);
      // Reload data
      const [withoutDoctor, myPatients] = await Promise.all([
        getPatientsWithoutDoctor(),
        getPatientsByDoctor(currentUser.userId)
      ]);
      setPatients([...withoutDoctor, ...myPatients]);
    } catch (err: any) {
      alert(err?.message || 'Failed to assign doctor');
    }
  };

  // Open treatment modal
  const handleOpenTreatmentModal = async (patient: Patient) => {
    if (!user) return;
    const currentUser = user; // Capture for closure
    
    try {
      const treatment = await getPatientTreatment(currentUser.userId, patient.userId);
      setTreatmentText(treatment || '');
      setSelectedPatientForTreatment(patient);
      setShowTreatmentModal(true);
    } catch (err: any) {
      setTreatmentText('');
      setSelectedPatientForTreatment(patient);
      setShowTreatmentModal(true);
    }
  };

  // Save treatment
  const handleSaveTreatment = async () => {
    if (!user || !selectedPatientForTreatment) return;
    const currentUser = user; // Capture for closure
    
    try {
      await updatePatientTreatment(currentUser.userId, selectedPatientForTreatment.userId, treatmentText);
      setShowTreatmentModal(false);
      setSelectedPatientForTreatment(null);
      setTreatmentText('');
      
      // Reload patients
      const myPatients = await getPatientsByDoctor(currentUser.userId);
      setPatients(prev => {
        const withoutDoctor = prev.filter(p => !p.assignedDoctor);
        return [...withoutDoctor, ...myPatients];
      });
    } catch (err: any) {
      alert(err?.message || 'Failed to save treatment');
    }
  };

  // Assign nurse
  const handleAssignNurse = async (nurseId: number) => {
    if (!selectedPatientForNurse) return;
    
    try {
      await assignNurseToPatient(selectedPatientForNurse.userId, nurseId);
      setShowAssignNurseModal(false);
      setSelectedPatientForNurse(null);
      
      // Reload patients
      const allPatients = await getActivePatients();
      setPatients(allPatients);
    } catch (err: any) {
      alert(err?.message || 'Failed to assign nurse');
    }
  };

  // Assign department
  const handleAssignDepartment = async (departmentId: number) => {
    if (!selectedPatientForDepartment) return;
    
    try {
      await assignDepartmentToPatient(selectedPatientForDepartment.userId, departmentId);
      setShowAssignDepartmentModal(false);
      setSelectedPatientForDepartment(null);
      
      // Reload patients
      const allPatients = await getActivePatients();
      setPatients(allPatients);
    } catch (err: any) {
      alert(err?.message || 'Failed to assign department');
    }
  };

  function getPatientFullName(patient: Patient): string {
    const parts = [patient.firstName, patient.middleName, patient.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : patient.username;
  }

  function getDoctorFullName(doctor?: Patient['assignedDoctor']): string {
    if (!doctor) return 'Not assigned';
    const parts = [doctor.firstName, doctor.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : doctor.username;
  }

  if (userLoading || loading) {
    return (
      <div className="page">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user || user.role === 'DEFAULT' || user.role === 'ADMIN') {
    return null;
  }

  if (!user) {
    return null;
  }

  const displayPatients = user.role === 'NURSE' ? filteredPatients : patients;
  const patientInfo = user.role === 'PATIENT' ? patients[0] : null;
  
  // For DOCTOR: separate patients into categories
  const myPatients = user.role === 'DOCTOR' 
    ? patients.filter(p => p.assignedDoctor?.userId === user.userId) 
    : [];
  
  const unassignedPatients = user.role === 'DOCTOR' 
    ? patients.filter(p => {
        // Exclude my patients and patients from my department
        const isMyPatient = p.assignedDoctor?.userId === user.userId;
        if (isMyPatient) return false;
        
        // Check if patient is from my department
        if (user.department) {
          const deptId = user.department.id || user.department.departmentId;
          const patientDeptId = p.department?.id || p.department?.departmentId;
          if (patientDeptId === deptId) return false; // This will be shown in department section
        }
        
        return !p.assignedDoctor;
      })
    : [];
  
  const departmentUnassignedPatients = user.role === 'DOCTOR' && user.department 
    ? patients.filter(p => {
        const deptId = user.department!.id || user.department!.departmentId;
        const patientDeptId = p.department?.id || p.department?.departmentId;
        return patientDeptId === deptId && !p.assignedDoctor;
      })
    : [];

  return (
    <div className="page">
      <div className="cabinet">
        <h1 className="cabinet__title">Cabinet</h1>
        
        {error && (
          <div className="cabinet__error form__error">{error}</div>
        )}

        {/* PATIENT View */}
        {user.role === 'PATIENT' && patientInfo && (
          <>
            <div className="cabinet__section">
              <h2 className="cabinet__section-title">My Information</h2>
              
              <div className="cabinet__info-card">
                <div className="cabinet__info-item">
                  <span className="cabinet__info-label">Assigned Doctor:</span>
                  <span className="cabinet__info-value">
                    {getDoctorFullName(patientInfo.assignedDoctor)}
                  </span>
                </div>
              </div>
            </div>

            {/* Treatment Plan Section */}
            {patientInfo.treatment && (
              <div className="cabinet__section">
                <h2 className="cabinet__section-title">План лечения</h2>
                <div className="cabinet__treatment-card">
                  <div className="cabinet__treatment-content">
                    {patientInfo.treatment}
                  </div>
                </div>
              </div>
            )}

            <div className="cabinet__section">
              <h3 className="cabinet__section-subtitle">Medical Indicators</h3>
              
              {!monitoringPatients.has(user.userId) ? (
                <button
                  className="btn btn--primary"
                  onClick={handleGetIndicators}
                >
                  Get Indicators
                </button>
              ) : (
                <>
                  <button
                    className="btn btn--secondary"
                    onClick={() => stopMonitoring(user.userId)}
                  >
                    Stop Monitoring
                  </button>
                  
                  {indicators.has(user.userId) && (
                    <div className="cabinet__indicators">
                      <div className="cabinet__indicator">
                        <span className="cabinet__indicator-label">Heart Rate:</span>
                        <span className="cabinet__indicator-value">
                          {indicators.get(user.userId)?.heartrate} bpm
                        </span>
                      </div>
                      <div className="cabinet__indicator">
                        <span className="cabinet__indicator-label">Temperature:</span>
                        <span className="cabinet__indicator-value">
                          {indicators.get(user.userId)?.temperature}°C
                        </span>
                      </div>
                      <div className="cabinet__indicator">
                        <span className="cabinet__indicator-label">SpO2:</span>
                        <span className="cabinet__indicator-value">
                          {indicators.get(user.userId)?.spo2}%
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* DOCTOR View */}
        {user.role === 'DOCTOR' && (
          <>
            {/* My Patients */}
            {myPatients.length > 0 ? (
              <div className="cabinet__section">
                <h2 className="cabinet__section-title">My Patients</h2>
                <div className="cabinet__patients-grid">
                  {myPatients.map(patient => (
                    <div key={patient.userId} className="cabinet__patient-card">
                      <h3 className="cabinet__patient-name">{getPatientFullName(patient)}</h3>
                      <p className="cabinet__patient-username">@{patient.username}</p>
                      
                      {/* Treatment Plan */}
                      {patient.treatment && (
                        <div className="cabinet__patient-treatment">
                          <strong className="cabinet__patient-treatment-label">План лечения:</strong>
                          <p className="cabinet__patient-treatment-text">{patient.treatment}</p>
                        </div>
                      )}
                      
                      {indicators.has(patient.userId) ? (
                        <>
                          <div className="cabinet__indicators">
                            <div className="cabinet__indicator">
                              <span>HR: {indicators.get(patient.userId)?.heartrate} bpm</span>
                            </div>
                            <div className="cabinet__indicator">
                              <span>Temp: {indicators.get(patient.userId)?.temperature}°C</span>
                            </div>
                            <div className="cabinet__indicator">
                              <span>SpO2: {indicators.get(patient.userId)?.spo2}%</span>
                            </div>
                          </div>
                          <button
                            className="btn btn--secondary btn--small"
                            onClick={() => {
                              setIndicators(prev => {
                                const next = new Map(prev);
                                next.delete(patient.userId);
                                return next;
                              });
                            }}
                          >
                            Clear Indicators
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn--primary btn--small"
                          onClick={() => handleGetLastIndicators(patient.userId)}
                        >
                          Get Last Indicators
                        </button>
                      )}
                      
                      <button
                        className="btn btn--secondary btn--small"
                        onClick={() => handleOpenTreatmentModal(patient)}
                      >
                        Set Treatment
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="cabinet__section">
                <div className="cabinet__empty-state">
                  <p>На данный момент у Вас нет активных пациентов</p>
                </div>
              </div>
            )}

            {/* Unassigned Patients from My Department */}
            {departmentUnassignedPatients.length > 0 && (
              <div className="cabinet__section">
                <h2 className="cabinet__section-title">Unassigned Patients from My Department</h2>
                <div className="cabinet__patients-grid">
                  {departmentUnassignedPatients.map(patient => (
                    <div key={patient.userId} className="cabinet__patient-card">
                      <h3 className="cabinet__patient-name">{getPatientFullName(patient)}</h3>
                      <p className="cabinet__patient-username">@{patient.username}</p>
                      <button
                        className="btn btn--success btn--small"
                        onClick={() => handleAssignDoctor(patient.userId)}
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Unassigned Patients */}
            {unassignedPatients.length > 0 && (
              <div className="cabinet__section">
                <h2 className="cabinet__section-title">All Unassigned Patients</h2>
                <div className="cabinet__patients-grid">
                  {unassignedPatients.map(patient => (
                    <div key={patient.userId} className="cabinet__patient-card">
                      <h3 className="cabinet__patient-name">{getPatientFullName(patient)}</h3>
                      <p className="cabinet__patient-username">@{patient.username}</p>
                      {patient.department && (
                        <p className="cabinet__patient-department">
                          Department: {patient.department.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* NURSE View */}
        {user.role === 'NURSE' && (
          <>
            <div className="cabinet__filters">
              <div className="cabinet__search">
                <input
                  type="text"
                  className="form__input"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="cabinet__department-filter">
                <label className="form__field">
                  <span className="form__label">Department</span>
                  <select
                    className="form__input"
                    value={selectedDepartment || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedDepartment(value === '' ? null : parseInt(value, 10));
                    }}
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => {
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

            <div className="cabinet__section">
              <h2 className="cabinet__section-title">All Patients ({displayPatients.length})</h2>
              <div className="cabinet__patients-grid">
                {displayPatients.map(patient => (
                  <div key={patient.userId} className="cabinet__patient-card">
                    <h3 className="cabinet__patient-name">{getPatientFullName(patient)}</h3>
                    <p className="cabinet__patient-username">@{patient.username}</p>
                    {patient.department && (
                      <p className="cabinet__patient-department">
                        Department: {patient.department.name}
                      </p>
                    )}
                    
                    <div className="cabinet__patient-actions">
                      <button
                        className="btn btn--secondary btn--small"
                        onClick={() => {
                          setSelectedPatientForDepartment(patient);
                          setShowAssignDepartmentModal(true);
                        }}
                      >
                        Assign Department
                      </button>
                      <button
                        className="btn btn--secondary btn--small"
                        onClick={() => {
                          setSelectedPatientForNurse(patient);
                          setShowAssignNurseModal(true);
                        }}
                      >
                        Assign Nurse
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Treatment Modal */}
        {showTreatmentModal && selectedPatientForTreatment && (
          <div className="modal-overlay" onClick={() => setShowTreatmentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Set Treatment for {getPatientFullName(selectedPatientForTreatment)}</h2>
              <div className="form__field">
                <textarea
                  className="form__input"
                  rows={10}
                  value={treatmentText}
                  onChange={(e) => setTreatmentText(e.target.value)}
                  placeholder="Enter treatment instructions..."
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn--primary" onClick={handleSaveTreatment}>
                  Save
                </button>
                <button className="btn btn--secondary" onClick={() => setShowTreatmentModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Nurse Modal */}
        {showAssignNurseModal && selectedPatientForNurse && (
          <div className="modal-overlay" onClick={() => setShowAssignNurseModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Assign Nurse to {getPatientFullName(selectedPatientForNurse)}</h2>
              <select
                className="form__input"
                onChange={(e) => {
                  const nurseId = parseInt(e.target.value, 10);
                  if (nurseId) {
                    handleAssignNurse(nurseId);
                  }
                }}
              >
                <option value="">Select Nurse</option>
                {nurses.map(nurse => (
                  <option key={nurse.userId} value={nurse.userId}>
                    {getPatientFullName(nurse)}
                  </option>
                ))}
              </select>
              <div className="modal-actions">
                <button className="btn btn--secondary" onClick={() => setShowAssignNurseModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Department Modal */}
        {showAssignDepartmentModal && selectedPatientForDepartment && (
          <div className="modal-overlay" onClick={() => setShowAssignDepartmentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Assign Department to {getPatientFullName(selectedPatientForDepartment)}</h2>
              <select
                className="form__input"
                onChange={(e) => {
                  const deptId = parseInt(e.target.value, 10);
                  if (deptId) {
                    handleAssignDepartment(deptId);
                  }
                }}
              >
                <option value="">Select Department</option>
                {departments.map(dept => {
                  const deptId = dept.departmentId ?? dept.id;
                  return (
                    <option key={deptId} value={deptId}>
                      {dept.name}
                    </option>
                  );
                })}
              </select>
              <div className="modal-actions">
                <button className="btn btn--secondary" onClick={() => setShowAssignDepartmentModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cabinet;

