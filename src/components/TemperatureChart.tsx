import { SensorHistory, getStats } from '@/lib/sensorData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
  'hsl(142, 72%, 45%)',
  'hsl(160, 60%, 45%)',
  'hsl(38, 92%, 55%)',
  'hsl(25, 85%, 55%)',
  'hsl(200, 80%, 55%)',
  'hsl(220, 70%, 60%)',
  'hsl(280, 60%, 55%)',
  'hsl(320, 60%, 55%)',
];

interface TemperatureChartProps {
  history: SensorHistory[];
  title: string;
  sensorFilter?: number[];
}

export default function TemperatureChart({ history, title, sensorFilter }: TemperatureChartProps) {
  const filtered = sensorFilter ? history.filter(h => sensorFilter.includes(h.sensorId)) : history;

  // Merge data by time
  const merged = filtered[0]?.readings.map((_, i) => {
    const point: Record<string, string | number> = { time: filtered[0].readings[i].time };
    filtered.forEach(h => {
      point[`S${h.sensorId}`] = h.readings[i]?.temp ?? 0;
    });
    return point;
  }) ?? [];

  // Show every 12th label (3 hours)
  const tickInterval = 11;

  return (
    <div className="bg-card rounded-md p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <div className="flex gap-3">
          {filtered.map((h, i) => {
            const stats = getStats(h.readings);
            return (
              <div key={h.sensorId} className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[sensorFilter ? sensorFilter.indexOf(h.sensorId) : i] }} />
                S{h.sensorId}
                <span className="text-foreground ml-1">{stats.min}–{stats.max}°</span>
              </div>
            );
          })}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={merged}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }}
            interval={tickInterval}
            axisLine={{ stroke: 'hsl(220, 14%, 18%)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(220, 10%, 50%)' }}
            domain={['auto', 'auto']}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(220, 18%, 10%)',
              border: '1px solid hsl(220, 14%, 18%)',
              borderRadius: '6px',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono',
            }}
            labelStyle={{ color: 'hsl(180, 10%, 88%)' }}
          />
          {filtered.map((h, i) => (
            <Line
              key={h.sensorId}
              type="monotone"
              dataKey={`S${h.sensorId}`}
              stroke={COLORS[sensorFilter ? sensorFilter.indexOf(h.sensorId) : i]}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
