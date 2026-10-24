import { 
  User, 
  LocationItem, 
  LocationDetail, 
  SymptomReport, 
  AlertItem, 
  DashboardSummary 
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('aeris_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Server error: ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.detail) {
        errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
}

// 1. Auth & Identity Verification API
export async function loginUser(identifier: string, password: string): Promise<{ access_token: string; refresh_token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  return handleResponse(res);
}

export async function registerCivilian(payload: any): Promise<{ access_token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/register/civilian`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function registerOfficial(payload: any): Promise<{ access_token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/register/official`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function validateGovId(id_type: string, id_number: string): Promise<{ is_valid_format: boolean; is_verified: boolean; masked_value: string; message: string }> {
  const res = await fetch(`${API_BASE}/auth/validate-id?id_type=${encodeURIComponent(id_type)}&id_number=${encodeURIComponent(id_number)}`, {
    method: 'POST',
  });
  return handleResponse(res);
}

export async function verifyPhoneOtp(phone_number: string, otp: string): Promise<{ status: string; verified: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number, otp }),
  });
  return handleResponse(res);
}

// 2. Locations & Details API
export async function fetchLocations(params?: { state?: string; district?: string; risk_level?: string; status_filter?: string }): Promise<LocationItem[]> {
  const q = new URLSearchParams();
  if (params?.state) q.set('state', params.state);
  if (params?.district) q.set('district', params.district);
  if (params?.risk_level) q.set('risk_level', params.risk_level);
  if (params?.status_filter) q.set('status_filter', params.status_filter);

  const res = await fetch(`${API_BASE}/locations?${q.toString()}`);
  return handleResponse(res);
}

export async function fetchLocationDetail(id: number): Promise<LocationDetail> {
  const res = await fetch(`${API_BASE}/locations/${id}`);
  return handleResponse(res);
}

export async function createLocation(payload: any): Promise<LocationItem> {
  const res = await fetch(`${API_BASE}/locations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

// 3. Symptom Reports & Field Submissions
export async function fetchReports(params?: { location_id?: number; district?: string; severity?: string; status_filter?: string }): Promise<SymptomReport[]> {
  const q = new URLSearchParams();
  if (params?.location_id) q.set('location_id', String(params.location_id));
  if (params?.district) q.set('district', params.district);
  if (params?.severity) q.set('severity', params.severity);
  if (params?.status_filter) q.set('status_filter', params.status_filter);

  const res = await fetch(`${API_BASE}/reports?${q.toString()}`);
  return handleResponse(res);
}

export async function submitReport(payload: any): Promise<SymptomReport> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function verifyReport(reportId: number, status: 'verified' | 'rejected', notes?: string): Promise<SymptomReport> {
  const res = await fetch(`${API_BASE}/reports/${reportId}/verify`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, verification_notes: notes }),
  });
  return handleResponse(res);
}

// 4. Alerts API
export async function fetchAlerts(params?: { status_filter?: string; district?: string; severity?: string }): Promise<AlertItem[]> {
  const q = new URLSearchParams();
  if (params?.status_filter) q.set('status_filter', params.status_filter);
  if (params?.district) q.set('district', params.district);
  if (params?.severity) q.set('severity', params.severity);

  const res = await fetch(`${API_BASE}/alerts?${q.toString()}`);
  return handleResponse(res);
}

export async function performAlertAction(alertId: number, action: string, note?: string, assignee_id?: number): Promise<AlertItem> {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/action`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action, note, assignee_id }),
  });
  return handleResponse(res);
}

export async function updateAlertStatus(alertId: number, status: string, notes?: string): Promise<AlertItem> {
  const res = await fetch(`${API_BASE}/alerts/${alertId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, notes }),
  });
  return handleResponse(res);
}

// 5. Analytics & Outbreak Sandbox
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/analytics/summary`);
  return handleResponse(res);
}

export async function triggerRiskCompute(): Promise<any> {
  const res = await fetch(`${API_BASE}/risk/compute`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function simulateOutbreak(location_id: number, surge_cases: number = 20, wqi_drop: number = 34.0, rainfall_surge: number = 460.0): Promise<any> {
  const res = await fetch(`${API_BASE}/analytics/simulate-outbreak`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ location_id, surge_cases, wqi_drop, rainfall_surge }),
  });
  return handleResponse(res);
}

// 6. User Management & Audit
export async function fetchUsers(role?: string, verification_status?: string): Promise<User[]> {
  const q = new URLSearchParams();
  if (role) q.set('role', role);
  if (verification_status) q.set('verification_status', verification_status);

  const res = await fetch(`${API_BASE}/users?${q.toString()}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function updateUserVerification(userId: number, status: 'APPROVED' | 'REJECTED', notes?: string): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${userId}/verification`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, notes }),
  });
  return handleResponse(res);
}

export async function fetchAuditLogs(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/users/audit-logs`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// 7. WebSocket Event Subscriber
export function connectRealtimeStream(onEvent: (event: { type: string; data: any }) => void): () => void {
  let ws: WebSocket | null = null;
  let retryTimer: any = null;

  function connect() {
    try {
      ws = new WebSocket(WS_BASE);
      ws.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          onEvent(payload);
        } catch {}
      };
      ws.onclose = () => {
        retryTimer = setTimeout(connect, 3000);
      };
      ws.onerror = () => {
        ws?.close();
      };
    } catch {
      retryTimer = setTimeout(connect, 5000);
    }
  }

  connect();

  return () => {
    if (retryTimer) clearTimeout(retryTimer);
    if (ws) ws.close();
  };
}
