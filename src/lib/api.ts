import { SensorReading, SensorHistory } from './sensorData';

const API_BASE = 'http://localhost:3001';

export interface ApiSensorResponse {
  sensors: SensorReading[];
  connected: boolean;
  lastUpdate: string | null;
}

export interface ApiHistoryResponse {
  history: SensorHistory[];
}

export interface ApiStatus {
  serial: boolean;
  port: string;
  baudRate: number;
  sensorCount: number;
  lastData: string | null;
}

export async function fetchSensors(): Promise<ApiSensorResponse> {
  const res = await fetch(`${API_BASE}/api/sensors`);
  if (!res.ok) throw new Error('Failed to fetch sensors');
  const data = await res.json();
  // Parse timestamp strings back to Date objects
  data.sensors = data.sensors.map((s: any) => ({
    ...s,
    timestamp: new Date(s.timestamp),
  }));
  return data;
}

export async function fetchHistory(): Promise<ApiHistoryResponse> {
  const res = await fetch(`${API_BASE}/api/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function fetchStatus(): Promise<ApiStatus> {
  const res = await fetch(`${API_BASE}/api/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function isBackendAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/status`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}
