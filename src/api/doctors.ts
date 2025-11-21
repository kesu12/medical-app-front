import { getAuthHeader } from './auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export type Department = {
  departmentId: number;
  name: string;
  description?: string;
};

export type Doctor = {
  userId: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  role: string;
  department?: Department;
  confirmed?: boolean;
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

export async function getAllDoctors(): Promise<Doctor[]> {
  const data = await request<Doctor[]>('/api/assignments/all-doctors', {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

export async function getDoctorsByDepartment(departmentId: number): Promise<Doctor[]> {
  const data = await request<Doctor[]>(`/api/assignments/doctors-by-department/${departmentId}`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Note: We extract departments from doctors list instead of calling admin endpoint
// since /api/admin/department/all requires ADMIN role
export function extractDepartmentsFromDoctors(doctors: Doctor[]): Department[] {
  const departmentMap = new Map<number, Department>();
  
  doctors.forEach(doctor => {
    if (doctor.department) {
      const deptId = doctor.department.departmentId;
      if (!departmentMap.has(deptId)) {
        departmentMap.set(deptId, doctor.department);
      }
    }
  });
  
  return Array.from(departmentMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );
}

