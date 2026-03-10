import { SensorReading, getTempCardClass, getTempStatus } from '@/lib/sensorData';
import { Thermometer } from 'lucide-react';

interface SensorCardProps {
  sensor: SensorReading;
}

const statusLabel: Record<string, string> = {
  cool: 'Normal',
  warm: 'Warning',
  hot: 'CRITICAL',
};

export default function SensorCard({ sensor }: SensorCardProps) {
  const status = getTempStatus(sensor.temperature);
  const cardClass = getTempCardClass(sensor.temperature);

  return (
    <div className={`bg-card rounded-md p-4 ${cardClass} transition-all duration-300`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-mono">S{sensor.sensorId}</span>
        <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
          status === 'cool' ? 'bg-temp-cool/10 text-temp-cool' :
          status === 'warm' ? 'bg-temp-warm/10 text-temp-warm' :
          'bg-temp-hot/10 text-temp-hot'
        }`}>
          {statusLabel[status]}
        </span>
      </div>
      <div className="flex items-end gap-2 mb-1">
        <Thermometer className={`w-4 h-4 ${
          status === 'cool' ? 'text-temp-cool' :
          status === 'warm' ? 'text-temp-warm' :
          'text-temp-hot'
        }`} />
        <span className="text-2xl font-mono font-semibold text-foreground leading-none">
          {sensor.temperature.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground mb-0.5">°C</span>
      </div>
      <p className="text-xs text-muted-foreground truncate">{sensor.label}</p>
    </div>
  );
}
