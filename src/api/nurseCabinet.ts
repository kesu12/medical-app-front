import { getAuthHeader } from './auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export type NursePatient = {
  userId: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  role: string;
  department?: {
    id?: number;
    departmentId?: number;
    name: string;
  };
  assignedDoctor?: {
    userId: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  assignedNurse?: {
    userId: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  treatment?: string;
  confirmed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PatientAssignmentDto = {
  patientId?: number;
  nurseId?: number;
  departmentId?: number;
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

// Get assigned patients for nurse
export async function getNursePatients(nurseId: number): Promise<NursePatient[]> {
  const data = await request<NursePatient[]>(`/api/nurse-cabinet/${nurseId}/patients`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get nurse notifications
export async function getNurseNotifications(nurseId: number): Promise<string[]> {
  const data = await request<string[]>(`/api/nurse-cabinet/${nurseId}/notifications`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Assign department to patient (nurse action)
export async function assignDepartmentToPatientByNurse(patientId: number, departmentId: number): Promise<NursePatient> {
  const data = await request<NursePatient>('/api/nurse-cabinet/assign-department-to-patient', {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ patientId, departmentId })
  });
  return data;
}

// Assign nurse to patient (nurse action)
export async function assignNurseToPatientByNurse(patientId: number, nurseId: number): Promise<NursePatient> {
  const data = await request<NursePatient>('/api/nurse-cabinet/assign-nurse-to-patient', {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ patientId, nurseId })
  });
  return data;
}
