import { getAuthHeader } from './auth';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export type MedicalIndicators = {
  heartrate: number;
  temperature: number;
  spo2: number;
  timestamp?: string;
  patientId?: number;
  category?: string;
  criticalStatus?: string;
};

export type MedicalIndicatorsSubmitResponse = {
  status: string;
  message: string;
  timestamp: string;
  patientId: number;
  category: string;
  criticalStatus: string;
  alert: boolean;
  alertLevel: string;
};

export type MedicalIndicatorsAnalysis = {
  heartrateStatus: string;
  temperatureStatus: string;
  spo2Status: string;
  overallStatus: string;
  category: string;
  isCritical: boolean;
  requiresAttention: boolean;
  recommendations: string;
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

// Submit medical indicators
export async function submitMedicalIndicators(indicators: MedicalIndicators): Promise<MedicalIndicatorsSubmitResponse> {
  const data = await request<MedicalIndicatorsSubmitResponse>('/api/medical-indicators/submit', {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(indicators)
  });
  return data;
}

// Generate random indicators for testing
export async function generateRandomIndicators(includeCritical: boolean = false): Promise<MedicalIndicators> {
  const data = await request<MedicalIndicators>(`/api/medical-indicators/generate-random?includeCritical=${includeCritical}`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Get latest indicators for patient
export async function getLatestIndicators(patientId: number): Promise<MedicalIndicators> {
  const data = await request<MedicalIndicators>(`/api/medical-indicators/patient/${patientId}/latest`, {
    method: 'GET',
    headers: getAuthHeader()
  });
  return data;
}

// Analyze medical indicators
export async function analyzeMedicalIndicators(indicators: MedicalIndicators): Promise<MedicalIndicatorsAnalysis> {
  const data = await request<MedicalIndicatorsAnalysis>('/api/medical-indicators/analyze', {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(indicators)
  });
  return data;
}
