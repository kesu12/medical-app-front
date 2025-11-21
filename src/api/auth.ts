export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: unknown;
};

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

async function request<T>(path: string, options: RequestInit): Promise<T> {
  let res: Response;
  try {
    // Ensure Content-Type is always set to application/json when body is present
    const customHeaders = options.headers as Record<string, string> || {};
    const headers: Record<string, string> = {
      ...customHeaders
    };
    
    // Always set Content-Type to application/json if body exists
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
    // Try to parse JSON error first
    try {
      const data = await res.json();
      const message = data?.message || data?.error || JSON.stringify(data);
      throw new Error(message || `Request failed: ${res.status}`);
    } catch (_) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Request failed: ${res.status}`);
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const responseText = await res.text();
  if (!responseText) {
    return undefined as T;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText as unknown as T;
  }
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const body = { username, password };
  const data = await request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  saveTokens(data);
  return data;
}

export type RegisterInput = {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
};

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input)
  });
  saveTokens(data);
  return data;
}

export function saveTokens(res: AuthResponse) {
  localStorage.setItem('accessToken', res.accessToken);
  localStorage.setItem('refreshToken', res.refreshToken);
  localStorage.setItem('tokenType', res.tokenType || 'Bearer');
  if (res.expiresIn != null) localStorage.setItem('expiresIn', String(res.expiresIn));
}

export function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('accessToken');
  const type = localStorage.getItem('tokenType') || 'Bearer';
  if (token) {
    return { Authorization: `${type} ${token}` };
  }
  return {} as Record<string, string>;
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('expiresIn');
}

export function isLoggedIn() {
  return !!localStorage.getItem('accessToken');
}

export type UserRole = 'DOCTOR' | 'NURSE' | 'ADMIN' | 'PATIENT' | 'DEFAULT';

export type User = {
  userId: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  role: UserRole;
  department?: {
    id?: number;
    departmentId?: number;
    name: string;
  };
  confirmed?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ProfileUpdateInput = {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
};

export async function getCurrentUser(): Promise<User> {
  const data = await request<User>('/api/auth/me', {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      await request('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ refreshToken })
      });
    } catch (e) {
      // Ignore errors on logout
    }
  }
  clearTokens();
}

export async function updateProfile(input: ProfileUpdateInput): Promise<User> {
  const data = await request<User>('/api/auth/profile', {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(input)
  });
  return data;
}

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await request<void>('/api/auth/change-password', {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(input)
  });
}

