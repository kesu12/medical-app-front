import { getAuthHeader } from './auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export type NotificationItem = {
  id: number;
  recipientId: number;
  message: string;
  type: string;
  patientId?: number;
  patientName?: string;
  departmentId?: number;
  departmentName?: string;
  createdAt: string;
  read: boolean;
};

type RequestOptions = RequestInit & { headers?: Record<string, string> };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...options.headers,
    ...getAuthHeader(),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to load notifications');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}

export async function fetchNotifications(userId: number): Promise<NotificationItem[]> {
  return request<NotificationItem[]>(`/api/notifications/user/${userId}`, {
    method: 'GET',
  });
}

export async function fetchUnreadCount(userId: number): Promise<number> {
  return request<number>(`/api/notifications/user/${userId}/unread-count`, {
    method: 'GET',
  });
}

export async function markNotificationRead(notificationId: number, userId: number): Promise<void> {
  await request<void>(`/api/notifications/${notificationId}/read?userId=${userId}`, {
    method: 'POST',
  });
}

export async function markAllNotificationsRead(userId: number): Promise<void> {
  await request<void>(`/api/notifications/user/${userId}/read-all`, {
    method: 'POST',
  });
}

export async function fetchDoctorNotifications(doctorId: number): Promise<NotificationItem[]> {
  return request<NotificationItem[]>(`/api/notifications/doctor/${doctorId}`, {
    method: 'GET',
  });
}

export async function fetchNurseNotifications(nurseId: number): Promise<NotificationItem[]> {
  return request<NotificationItem[]>(`/api/notifications/nurse/${nurseId}`, {
    method: 'GET',
  });
}

