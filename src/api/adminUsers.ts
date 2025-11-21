import { getAuthHeader } from './auth';
import { Department } from './departments';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export type UserRole = 'DOCTOR' | 'NURSE' | 'ADMIN' | 'PATIENT' | 'DEFAULT';

export type AdminUser = {
  userId: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  role: UserRole;
  department?: Department;
  confirmed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UserAdminUpdateInput = {
  departmentId?: number;
  isConfirmed: boolean;
  role: UserRole;
  notes?: string;
};

export type ConfirmUserInput = {
  departmentId: number;
};

async function request<T>(path: string, options: RequestInit): Promise<T> {
  let res: Response;
  try {
    const customHeaders = options.headers as Record<string, string> || {};
    const headers: Record<string, string> = {
      ...customHeaders
    };
    
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }
    
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: headers
    });
  } catch (e: any) {
    throw new Error(`Network error. ${e?.message || 'Failed to fetch'}`);
  }
  
  if (!res.ok) {
    try {
      const data = await res.json();
      const message = data?.message || data?.error || JSON.stringify(data);
      throw new Error(message || `Request failed: ${res.status}`);
    } catch (_) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Request failed: ${res.status}`);
    }
  }
  
  return res.json();
}

// Get all users
export async function getAllUsers(): Promise<AdminUser[]> {
  const data = await request<AdminUser[]>('/api/admin/users', {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get user by ID
export async function getUserById(userId: number): Promise<AdminUser> {
  const data = await request<AdminUser>(`/api/admin/users/${userId}`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get users by role
export async function getUsersByRole(role: UserRole): Promise<AdminUser[]> {
  const data = await request<AdminUser[]>(`/api/admin/users/by-role/${role}`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get users by created date
export async function getUsersByCreatedDate(startDate?: string, endDate?: string): Promise<AdminUser[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const queryString = params.toString();
  const url = `/api/admin/users/by-created-date${queryString ? '?' + queryString : ''}`;
  
  const data = await request<AdminUser[]>(url, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get unconfirmed users
export async function getUnconfirmedUsers(): Promise<AdminUser[]> {
  const data = await request<AdminUser[]>('/api/admin/users/unconfirmed', {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get confirmed users
export async function getConfirmedUsers(): Promise<AdminUser[]> {
  const data = await request<AdminUser[]>('/api/admin/users/confirmed', {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Update user (admin)
export async function updateUserAdmin(userId: number, input: UserAdminUpdateInput): Promise<AdminUser> {
  const data = await request<AdminUser>(`/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(input)
  });
  return data;
}

// Change user role
export async function changeUserRole(userId: number, role: UserRole): Promise<AdminUser> {
  const data = await request<AdminUser>(`/api/admin/users/${userId}/role/${role}`, {
    method: 'PATCH',
    headers: getAuthHeader()
  });
  return data;
}

// Confirm user
export async function confirmUser(userId: number): Promise<AdminUser> {
  const data = await request<AdminUser>(`/api/admin/users/${userId}/confirm`, {
    method: 'PATCH',
    headers: getAuthHeader()
  });
  return data;
}

// Confirm user with department
export async function confirmUserWithDepartment(userId: number, departmentId: number): Promise<AdminUser> {
  const data = await request<AdminUser>(`/api/admin/users/${userId}/confirm-with-department`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify({ departmentId })
  });
  return data;
}

// Activate user
export async function activateUser(userId: number): Promise<AdminUser> {
  const data = await request<AdminUser>(`/api/admin/users/${userId}/activate`, {
    method: 'PATCH',
    headers: getAuthHeader()
  });
  return data;
}

// Deactivate user
export async function deactivateUser(userId: number): Promise<AdminUser> {
  const data = await request<AdminUser>(`/api/admin/users/${userId}/deactivate`, {
    method: 'PATCH',
    headers: getAuthHeader()
  });
  return data;
}

// Delete user
export async function deleteUser(userId: number): Promise<void> {
  await request<void>(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
}

// Assign department to doctor
export async function assignDepartmentToDoctor(doctorId: number, departmentId: number): Promise<AdminUser> {
  const data = await request<AdminUser>(`/api/admin/users/${doctorId}/assign-department`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify({ departmentId })
  });
  return data;
}

// Change doctor department
export async function changeDoctorDepartment(doctorId: number, departmentId: number): Promise<AdminUser> {
  const data = await request<AdminUser>(`/api/admin/users/${doctorId}/change-department`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify({ departmentId })
  });
  return data;
}

