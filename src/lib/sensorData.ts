export interface SensorReading {
  sensorId: number;
  temperature: number;
  timestamp: Date;
  label: string;
  position: 'top' | 'bottom';
  corner: string;
}

export interface SensorHistory {
  sensorId: number;
  readings: { time: string; temp: number }[];
}

export type TempStatus = 'cool' | 'warm' | 'hot';

export function getTempStatus(temp: number): TempStatus {
  if (temp >= 45) return 'hot';
  if (temp >= 35) return 'warm';
  return 'cool';
}

export function getTempColor(temp: number): string {
  if (temp >= 45) return 'hsl(0, 72%, 55%)';
  if (temp >= 38) return 'hsl(38, 92%, 55%)';
  if (temp >= 30) return 'hsl(142, 72%, 45%)';
  return 'hsl(200, 80%, 55%)';
}

export function getTempCardClass(temp: number): string {
  if (temp >= 45) return 'sensor-card-red';
  if (temp >= 35) return 'sensor-card-amber';
  return 'sensor-card-green';
}

const SENSOR_LABELS: { label: string; position: 'top' | 'bottom'; corner: string }[] = [
  { label: 'Top Front-Left', position: 'top', corner: 'FL' },
  { label: 'Top Front-Right', position: 'top', corner: 'FR' },
  { label: 'Top Rear-Left', position: 'top', corner: 'RL' },
  { label: 'Top Rear-Right', position: 'top', corner: 'RR' },
  { label: 'Bottom Front-Left', position: 'bottom', corner: 'FL' },
  { label: 'Bottom Front-Right', position: 'bottom', corner: 'FR' },
  { label: 'Bottom Rear-Left', position: 'bottom', corner: 'RL' },
  { label: 'Bottom Rear-Right', position: 'bottom', corner: 'RR' },
];

function generateTemp(base: number, variance: number): number {
  return Math.round((base + (Math.random() - 0.5) * variance) * 10) / 10;
}

export function generateMockReadings(): SensorReading[] {
  // Top sensors run hotter
  return SENSOR_LABELS.map((s, i) => ({
    sensorId: i + 1,
    temperature: generateTemp(s.position === 'top' ? 34 : 26, 6),
    timestamp: new Date(),
    ...s,
  }));
}

export function generateMockHistory(): SensorHistory[] {
  const now = new Date();
  return SENSOR_LABELS.map((s, sensorId) => {
    const base = s.position === 'top' ? 33 : 25;
    const readings = Array.from({ length: 96 }, (_, i) => {
      const time = new Date(now.getTime() - (95 - i) * 15 * 60 * 1000);
      const hour = time.getHours();
      const dayCycle = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 3;
      return {
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        temp: Math.round((base + dayCycle + (Math.random() - 0.5) * 2) * 10) / 10,
      };
    });
    return { sensorId: sensorId + 1, readings };
  });
}

export function getStats(readings: { temp: number }[]) {
  const temps = readings.map(r => r.temp);
  return {
    min: Math.min(...temps),
    max: Math.max(...temps),
    avg: Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10,
  };
}
