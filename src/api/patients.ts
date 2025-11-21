import { getAuthHeader } from './auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export type Patient = {
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
  doctorId?: number;
  departmentId?: number;
};

export type TreatmentUpdateDto = {
  treatment: string;
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

// Get all active patients
export async function getActivePatients(): Promise<Patient[]> {
  const data = await request<Patient[]>('/api/assignments/active-patients', {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get patients without doctor
export async function getPatientsWithoutDoctor(): Promise<Patient[]> {
  const data = await request<Patient[]>('/api/assignments/patients-without-doctor', {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get patients by doctor
export async function getPatientsByDoctor(doctorId: number): Promise<Patient[]> {
  const data = await request<Patient[]>(`/api/assignments/patients-by-doctor/${doctorId}`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get patients by department
export async function getPatientsByDepartment(departmentId: number): Promise<Patient[]> {
  const data = await request<Patient[]>(`/api/assignments/patients-by-department/${departmentId}`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get patient info
export async function getPatientInfo(patientId: number): Promise<Patient> {
  const data = await request<Patient>(`/api/patient-cabinet/${patientId}/info`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Assign doctor to patient
export async function assignDoctorToPatient(patientId: number, doctorId: number): Promise<Patient> {
  const data = await request<Patient>(`/api/assignments/patients/${patientId}/doctor`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ doctorId })
  });
  return data;
}

// Assign nurse to patient
export async function assignNurseToPatient(patientId: number, nurseId: number): Promise<Patient> {
  const data = await request<Patient>(`/api/assignments/patients/${patientId}/nurse`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ nurseId })
  });
  return data;
}

// Assign department to patient
export async function assignDepartmentToPatient(patientId: number, departmentId: number): Promise<Patient> {
  const data = await request<Patient>(`/api/assignments/patients/${patientId}/department`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ departmentId })
  });
  return data;
}

// Update patient treatment
export async function updatePatientTreatment(doctorId: number, patientId: number, treatment: string): Promise<Patient> {
  const data = await request<Patient>(`/api/doctor-cabinet/${doctorId}/patients/${patientId}/treatment`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify({ treatment })
  });
  return data;
}

// Get patient treatment
export async function getPatientTreatment(doctorId: number, patientId: number): Promise<string> {
  const data = await request<string>(`/api/doctor-cabinet/${doctorId}/patients/${patientId}/treatment`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get all nurses
export async function getAllNurses(): Promise<Patient[]> {
  const data = await request<Patient[]>('/api/assignments/all-nurses', {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get patients by nurse
export async function getPatientsByNurse(nurseId: number): Promise<Patient[]> {
  const data = await request<Patient[]>(`/api/assignments/patients-by-nurse/${nurseId}`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get nurses by department
export async function getNursesByDepartment(departmentId: number): Promise<Patient[]> {
  const data = await request<Patient[]>(`/api/assignments/nurses-by-department/${departmentId}`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get all users
export async function getAllUsers(): Promise<Patient[]> {
  const data = await request<Patient[]>('/api/assignments/all-users', {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Assign nurse to patient (patient cabinet)
export async function assignNurseByPatient(patientId: number, nurseId: number): Promise<Patient> {
  const data = await request<Patient>('/api/patient-cabinet/assign-nurse', {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ patientId, nurseId })
  });
  return data;
}

// Get available nurses for patient
export async function getAvailableNurses(): Promise<Patient[]> {
  const data = await request<Patient[]>('/api/patient-cabinet/available-nurses', {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get available doctors for patient
export async function getAvailableDoctors(): Promise<Patient[]> {
  const data = await request<Patient[]>('/api/patient-cabinet/available-doctors', {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

