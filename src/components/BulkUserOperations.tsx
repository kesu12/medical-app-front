import React, { useState } from 'react';
import { bulkUpdateUsers, bulkConfirmUsers, AdminUser, UserRole } from '../api/adminUsers';

type BulkUserOperationsProps = {
  selectedUsers: AdminUser[];
  onSuccess: () => void;
  onClose: () => void;
};

const BulkUserOperations: React.FC<BulkUserOperationsProps> = ({ 
  selectedUsers, 
  onSuccess, 
  onClose 
}) => {
  const [operation, setOperation] = useState<'confirm' | 'update' | null>(null);
  const [departmentId, setDepartmentId] = useState<string>('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBulkConfirm = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userIds = selectedUsers.map(u => u.userId);
      const confirmedCount = await bulkConfirmUsers(userIds);
      alert(`Successfully confirmed ${confirmedCount} users`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to confirm users');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userIds = selectedUsers.map(u => u.userId);
      const updateData: any = { userIds };
      
      if (departmentId) {
        updateData.departmentId = parseInt(departmentId);
      }
      if (role) {
        updateData.role = role;
      }
      if (operation === 'update') {
        updateData.isConfirmed = isConfirmed;
      }
      
      const updatedUsers = await bulkUpdateUsers(updateData);
      alert(`Successfully updated ${updatedUsers.length} users`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update users');
    } finally {
      setLoading(false);
    }
  };

  if (!operation) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%'
        }}>
          <h2>Bulk Operations</h2>
          <p>Selected users: {selectedUsers.length}</p>
          
          <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={() => setOperation('confirm')}
              style={{
                padding: '12px',
                backgroundColor: '#388e3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Bulk Confirm Users
            </button>
            
            <button
              onClick={() => setOperation('update')}
              style={{
                padding: '12px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Bulk Update Users
            </button>
            
            <button
              onClick={onClose}
              style={{
                padding: '12px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (operation === 'confirm') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%'
        }}>
          <h2>Confirm Users</h2>
          <p>Are you sure you want to confirm {selectedUsers.length} users?</p>
          
          {error && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#ffebee', 
              color: '#c62828',
              borderRadius: '4px',
              marginTop: '10px'
            }}>
              {error}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleBulkConfirm}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#388e3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Confirming...' : 'Confirm'}
            </button>
            
            <button
              onClick={() => setOperation(null)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h2>Update Users</h2>
        <p>Updating {selectedUsers.length} users</p>
        
        {error && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#ffebee', 
            color: '#c62828',
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Department ID (optional):
            </label>
            <input
              type="number"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Role (optional):
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              <option value="">-- No change --</option>
              <option value="ADMIN">ADMIN</option>
              <option value="DOCTOR">DOCTOR</option>
              <option value="NURSE">NURSE</option>
              <option value="PATIENT">PATIENT</option>
              <option value="DEFAULT">DEFAULT</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
              />
              <span style={{ fontWeight: 'bold' }}>Mark as Confirmed</span>
            </label>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={handleBulkUpdate}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
          
          <button
            onClick={() => setOperation(null)}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUserOperations;
