import { getAuthHeader } from './auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export type UserInfo = {
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
  confirmed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UserPasswordUpdate = {
  password: string;
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

// Get user by ID
export async function getUserById(userId: number): Promise<UserInfo> {
  const data = await request<UserInfo>(`/api/user/${userId}`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Update user password
export async function updateUserPassword(userId: number, password: string): Promise<UserInfo> {
  const data = await request<UserInfo>(`/api/user/${userId}/password`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify({ password })
  });
  return data;
}
