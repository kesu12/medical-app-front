import { getAuthHeader } from './auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export type Department = {
  id?: number;
  departmentId?: number;
  name: string;
  description?: string;
  users?: unknown[];
  createdAt?: string;
  updatedAt?: string;
};

export type DepartmentDetails = {
  patients: unknown[];
  nurses: unknown[];
  doctors: unknown[];
  notifications: unknown[];
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
  
  // Handle empty response (204 No Content or empty body)
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }
  
  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  
  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}

// Get all departments (accessible to all authenticated users)
export async function getAllDepartments(): Promise<Department[]> {
  const data = await request<Department[]>('/api/department-cabinet/all', {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get department by ID
export async function getDepartment(id: number): Promise<Department> {
  const data = await request<Department>(`/api/admin/department/${id}`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Create department (requires ADMIN role)
export async function createDepartment(department: { name: string; description?: string }): Promise<Department> {
  const data = await request<Department>('/api/admin/department/add', {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(department)
  });
  return data;
}

// Update department (requires ADMIN role)
export async function updateDepartment(id: number, department: { name?: string; description?: string }): Promise<Department> {
  const data = await request<Department>(`/api/admin/department/${id}`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify(department)
  });
  return data;
}

// Delete department (requires ADMIN role)
export async function deleteDepartment(id: number): Promise<void> {
  await request<void>(`/api/admin/department/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
}

// Get department details (patients, nurses, doctors, notifications)
export async function getDepartmentPatients(departmentId: number): Promise<unknown[]> {
  const data = await request<unknown[]>(`/api/department-cabinet/${departmentId}/patients`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

export async function getDepartmentNurses(departmentId: number): Promise<unknown[]> {
  const data = await request<unknown[]>(`/api/department-cabinet/${departmentId}/nurses`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

export async function getDepartmentDoctors(departmentId: number): Promise<unknown[]> {
  const data = await request<unknown[]>(`/api/department-cabinet/${departmentId}/doctors`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

export async function getDepartmentNotifications(departmentId: number): Promise<unknown[]> {
  const data = await request<unknown[]>(`/api/department-cabinet/${departmentId}/notifications`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

