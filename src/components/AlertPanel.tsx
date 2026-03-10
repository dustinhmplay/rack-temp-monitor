import { SensorReading, getTempStatus } from '@/lib/sensorData';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface AlertPanelProps {
  sensors: SensorReading[];
}

export default function AlertPanel({ sensors }: AlertPanelProps) {
  const alerts = sensors.filter(s => getTempStatus(s.temperature) === 'hot');
  const warnings = sensors.filter(s => getTempStatus(s.temperature) === 'warm');

  return (
    <div className="bg-card rounded-md p-5 border border-border">
      <h3 className="text-sm font-medium text-foreground mb-3">System Alerts</h3>

      {alerts.length === 0 && warnings.length === 0 ? (
        <div className="flex items-center gap-2 text-temp-cool">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-mono">All sensors nominal</span>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map(s => (
            <div key={s.sensorId} className="flex items-center gap-2 bg-temp-hot/10 rounded px-3 py-2">
              <AlertTriangle className="w-4 h-4 text-temp-hot flex-shrink-0" />
              <span className="text-xs font-mono text-foreground">
                <span className="text-temp-hot font-semibold">CRITICAL</span> — S{s.sensorId} ({s.label}): {s.temperature.toFixed(1)}°C exceeds 45°C threshold
              </span>
            </div>
          ))}
          {warnings.map(s => (
            <div key={s.sensorId} className="flex items-center gap-2 bg-temp-warm/10 rounded px-3 py-2">
              <AlertTriangle className="w-4 h-4 text-temp-warm flex-shrink-0" />
              <span className="text-xs font-mono text-foreground">
                <span className="text-temp-warm font-semibold">WARNING</span> — S{s.sensorId} ({s.label}): {s.temperature.toFixed(1)}°C elevated
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
