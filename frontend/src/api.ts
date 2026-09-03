const API_BASE = 'http://localhost:9000';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface ErrorResponse {
  message?: string;
}

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.clone().json()) as ErrorResponse;
    if (body?.message) return body.message;
  } catch {
    // response wasn't JSON (e.g. plain-text 401/403 from the security filter chain)
  }
  return fallback;
}

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res, 'Invalid username or password.'));
  }
  return res.text();
}

export async function register(username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res, 'Could not create that account.'));
  }
  return res.text();
}

export interface NdbcRealtimeData {
  columns: string[];
  units: string[];
  data: Record<string, (string | null)[]>;
}

export async function fetchStationConditions(
  token: string,
  stationId: string,
): Promise<NdbcRealtimeData> {
  const res = await fetch(`${API_BASE}/api/ndbc/${encodeURIComponent(stationId)}/parsed`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) {
    throw new ApiError(res.status, 'Session expired. Please log in again.');
  }
  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res, `Station ${stationId} is unavailable.`));
  }
  return res.json();
}
