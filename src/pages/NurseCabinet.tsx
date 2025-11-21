import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { getNursePatients, NursePatient } from '../api/nurseCabinet';
import { fetchNurseNotifications } from '../api/notifications';
import { NotificationItem } from '../api/notifications';

const NurseCabinet: React.FC = () => {
  const { user } = useUser();
  const [patients, setPatients] = useState<NursePatient[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.userId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    if (!user?.userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [patientsData, notificationsData] = await Promise.all([
        getNursePatients(user.userId),
        fetchNurseNotifications(user.userId)
      ]);
      
      setPatients(patientsData);
      setNotifications(notificationsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>Error: {error}</p>
        <button onClick={loadData}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Nurse Cabinet</h1>
      
      <section style={{ marginBottom: '30px' }}>
        <h2>My Patients ({patients.length})</h2>
        {patients.length === 0 ? (
          <p>No patients assigned</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {patients.map((patient) => (
              <div
                key={patient.userId}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <h3>
                  {patient.firstName} {patient.lastName}
                  {patient.middleName && ` ${patient.middleName}`}
                </h3>
                <p><strong>Username:</strong> {patient.username}</p>
                <p><strong>Email:</strong> {patient.email}</p>
                {patient.phoneNumber && <p><strong>Phone:</strong> {patient.phoneNumber}</p>}
                {patient.department && (
                  <p><strong>Department:</strong> {patient.department.name}</p>
                )}
                {patient.assignedDoctor && (
                  <p>
                    <strong>Doctor:</strong> {patient.assignedDoctor.firstName} {patient.assignedDoctor.lastName}
                  </p>
                )}
                {patient.treatment && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Treatment:</strong>
                    <p style={{ 
                      backgroundColor: '#fff', 
                      padding: '10px', 
                      borderRadius: '4px',
                      marginTop: '5px'
                    }}>
                      {patient.treatment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Notifications ({notifications.length})</h2>
        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: notification.read ? '#f9f9f9' : '#e3f2fd'
                }}
              >
                <p style={{ margin: 0 }}>{notification.message}</p>
                <small style={{ color: '#666' }}>
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default NurseCabinet;
