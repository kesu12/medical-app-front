import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { 
  getAllUsers, 
  getUsersByRole, 
  getUsersByCreatedDate,
  deleteUser,
  changeUserRole,
  confirmUser,
  changeDoctorDepartment,
  AdminUser,
  UserRole
} from '../api/adminUsers';
import { getAllDepartments, Department as DepartmentType } from '../api/departments';
import UserEditModal from '../components/UserEditModal';
import UserDeleteModal from '../components/UserDeleteModal';
import BulkUserOperations from '../components/BulkUserOperations';
import '../App.css';

function AdminUsers() {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | ''>('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  
  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [bulkOperationsOpen, setBulkOperationsOpen] = useState(false);
  
  // Selection
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      navigate('/');
      return;
    }
  }, [user, userLoading, isAdmin, navigate]);

  useEffect(() => {
    async function loadData() {
      if (!isAdmin) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [usersData, departmentsData] = await Promise.all([
          (async () => {
            if (filterStartDate && filterEndDate) {
              return await getUsersByCreatedDate(filterStartDate, filterEndDate);
            } else if (filterRole) {
              return await getUsersByRole(filterRole as UserRole);
            } else {
              return await getAllUsers();
            }
          })(),
          getAllDepartments()
        ]);
        
        setUsers(usersData);
        setDepartments(departmentsData);
      } catch (err: any) {
        setError(err?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, filterRole, filterStartDate, filterEndDate]);

  useEffect(() => {
    let filtered = [...users];

    // Filter by search query (name, username, email, id)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => {
        const fullName = `${u.firstName || ''} ${u.middleName || ''} ${u.lastName || ''}`.toLowerCase();
        const username = u.username.toLowerCase();
        const email = u.email.toLowerCase();
        const userId = u.userId.toString();
        
        return fullName.includes(query) || 
               username.includes(query) || 
               email.includes(query) ||
               userId.includes(query);
      });
    }

    // Filter by user ID
    if (filterUserId.trim()) {
      const id = parseInt(filterUserId);
      if (!isNaN(id)) {
        filtered = filtered.filter(u => u.userId === id);
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, filterUserId]);

  async function handleDelete(user: AdminUser) {
    try {
      await deleteUser(user.userId);
      await reloadUsers();
      setDeleteModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete user');
    }
  }

  async function handleChangeRole(userId: number, role: UserRole) {
    try {
      await changeUserRole(userId, role);
      await reloadUsers();
    } catch (err: any) {
      setError(err?.message || 'Failed to change user role');
    }
  }

  async function handleConfirm(userId: number) {
    try {
      await confirmUser(userId);
      await reloadUsers();
    } catch (err: any) {
      setError(err?.message || 'Failed to confirm user');
    }
  }

  async function reloadUsers() {
    setLoading(true);
    try {
      const [usersData, departmentsData] = await Promise.all([
        (async () => {
          if (filterStartDate && filterEndDate) {
            return await getUsersByCreatedDate(filterStartDate, filterEndDate);
          } else if (filterRole) {
            return await getUsersByRole(filterRole as UserRole);
          } else {
            return await getAllUsers();
          }
        })(),
        getAllDepartments()
      ]);
      setUsers(usersData);
      setDepartments(departmentsData);
    } catch (err: any) {
      setError(err?.message || 'Failed to reload data');
    } finally {
      setLoading(false);
    }
  }

  function getUserFullName(user: AdminUser): string {
    const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : user.username;
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  function toggleUserSelection(userId: number) {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  }

  function toggleSelectAll() {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.userId)));
    }
  }

  function getSelectedUsers(): AdminUser[] {
    return filteredUsers.filter(u => selectedUserIds.has(u.userId));
  }

  if (userLoading || loading) {
    return (
      <div className="page">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="page">
      <div className="admin-users">
        <h1 className="admin-users__title">Users (A)</h1>
        
        {error && (
          <div className="admin-users__error form__error">{error}</div>
        )}

        {/* Search and Filters */}
        <div className="admin-users__filters">
          <div className="admin-users__search">
            <input
              type="text"
              className="form__input"
              placeholder="Search by name, username, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="admin-users__filter-group">
            <label className="form__field">
              <span className="form__label">Role</span>
              <select
                className="form__input"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as UserRole | '')}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="NURSE">Nurse</option>
                <option value="PATIENT">Patient</option>
                <option value="DEFAULT">Default</option>
              </select>
            </label>
          </div>

          <div className="admin-users__filter-group">
            <label className="form__field">
              <span className="form__label">User ID</span>
              <input
                type="number"
                className="form__input"
                placeholder="Enter user ID..."
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
              />
            </label>
          </div>

          <div className="admin-users__filter-group">
            <label className="form__field">
              <span className="form__label">Start Date</span>
              <input
                type="date"
                className="form__input"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </label>
          </div>

          <div className="admin-users__filter-group">
            <label className="form__field">
              <span className="form__label">End Date</span>
              <input
                type="date"
                className="form__input"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Results count and bulk actions */}
        <div className="admin-users__results-count" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {filteredUsers.length === 0 ? (
              <p>No users found</p>
            ) : (
              <p>
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                {selectedUserIds.size > 0 && ` (${selectedUserIds.size} selected)`}
              </p>
            )}
          </div>
          {selectedUserIds.size > 0 && (
            <button
              className="btn btn--primary"
              onClick={() => setBulkOperationsOpen(true)}
            >
              Bulk Operations ({selectedUserIds.size})
            </button>
          )}
        </div>

        {/* Users Table */}
        <div className="admin-users__table-wrapper">
          <table className="admin-users__table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.userId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUserIds.has(u.userId)}
                      onChange={() => toggleUserSelection(u.userId)}
                    />
                  </td>
                  <td>{u.userId}</td>
                  <td>{getUserFullName(u)}</td>
                  <td>@{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="form__input admin-users__role-select"
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.userId, e.target.value as UserRole)}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="DOCTOR">Doctor</option>
                      <option value="NURSE">Nurse</option>
                      <option value="PATIENT">Patient</option>
                      <option value="DEFAULT">Default</option>
                    </select>
                  </td>
                  <td>
                    {u.role === 'DOCTOR' ? (
                      <select
                        className="form__input admin-users__department-select"
                        value={u.department?.id || u.department?.departmentId || ''}
                        onChange={async (e) => {
                          const deptId = e.target.value ? parseInt(e.target.value) : null;
                          if (deptId && u.department?.id !== deptId && u.department?.departmentId !== deptId) {
                            try {
                              await changeDoctorDepartment(u.userId, deptId);
                              await reloadUsers();
                            } catch (err: any) {
                              setError(err?.message || 'Failed to change department');
                            }
                          }
                        }}
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
                    ) : (
                      u.department?.name || 'N/A'
                    )}
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <div className="admin-users__actions">
                      <button
                        className="btn btn--update"
                        onClick={() => {
                          setSelectedUser(u);
                          setEditModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      {!u.confirmed && (
                        <button
                          className="btn btn--primary"
                          onClick={() => handleConfirm(u.userId)}
                        >
                          Confirm
                        </button>
                      )}
                      <button
                        className="btn btn--delete"
                        onClick={() => {
                          setSelectedUser(u);
                          setDeleteModalOpen(true);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <UserEditModal
          open={editModalOpen}
          user={selectedUser}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={reloadUsers}
        />

        <UserDeleteModal
          open={deleteModalOpen}
          user={selectedUser}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={selectedUser ? () => handleDelete(selectedUser) : undefined}
        />

        {bulkOperationsOpen && (
          <BulkUserOperations
            selectedUsers={getSelectedUsers()}
            onSuccess={() => {
              reloadUsers();
              setSelectedUserIds(new Set());
            }}
            onClose={() => setBulkOperationsOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default AdminUsers;

