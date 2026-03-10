import { SensorReading } from '@/lib/sensorData';
import { Activity, ArrowDown, ArrowUp, Gauge } from 'lucide-react';

interface StatsBarProps {
  sensors: SensorReading[];
}

export default function StatsBar({ sensors }: StatsBarProps) {
  const temps = sensors.map(s => s.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const avg = Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10;
  const spread = Math.round((max - min) * 10) / 10;

  const stats = [
    { label: 'Min Temp', value: `${min.toFixed(1)}°C`, icon: ArrowDown, accent: 'text-temp-cold' },
    { label: 'Max Temp', value: `${max.toFixed(1)}°C`, icon: ArrowUp, accent: 'text-temp-hot' },
    { label: 'Average', value: `${avg}°C`, icon: Gauge, accent: 'text-primary' },
    { label: 'Spread', value: `${spread}°C`, icon: Activity, accent: 'text-accent' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-card rounded-md p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <s.icon className={`w-3.5 h-3.5 ${s.accent}`} />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{s.label}</span>
          </div>
          <span className="text-xl font-mono font-semibold text-foreground">{s.value}</span>
        </div>
      ))}
    </div>
  );
}
