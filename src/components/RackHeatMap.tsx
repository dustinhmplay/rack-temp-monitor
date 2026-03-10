import { SensorReading, getTempColor } from '@/lib/sensorData';

interface RackHeatMapProps {
  sensors: SensorReading[];
}

export default function RackHeatMap({ sensors }: RackHeatMapProps) {
  const top = sensors.filter(s => s.position === 'top');
  const bottom = sensors.filter(s => s.position === 'bottom');

  const avgTop = top.length ? top.reduce((a, s) => a + s.temperature, 0) / top.length : 0;
  const avgBottom = bottom.length ? bottom.reduce((a, s) => a + s.temperature, 0) / bottom.length : 0;

  return (
    <div className="bg-card rounded-md p-5 border border-border">
      <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary pulse-dot" />
        Rack Heat Map
      </h3>

      <div className="flex gap-6">
        {/* Rack visualization */}
        <div className="flex-1">
          <div className="relative border border-border rounded-md overflow-hidden" style={{ aspectRatio: '3/4' }}>
            {/* Rack frame */}
            <div className="absolute inset-0 flex flex-col">
              {/* Top section */}
              <div className="flex-1 p-3 flex flex-col">
                <span className="text-[10px] font-mono text-muted-foreground mb-2 uppercase tracking-widest">Top</span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  {top.map(s => (
                    <div
                      key={s.sensorId}
                      className="heatmap-cell flex items-center justify-center"
                      style={{ backgroundColor: getTempColor(s.temperature) + '33' }}
                    >
                      <div className="text-center">
                        <span className="text-xs font-mono font-semibold text-foreground block">{s.temperature.toFixed(1)}°</span>
                        <span className="text-[9px] text-muted-foreground">{s.corner}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border mx-3" />

              {/* Bottom section */}
              <div className="flex-1 p-3 flex flex-col">
                <span className="text-[10px] font-mono text-muted-foreground mb-2 uppercase tracking-widest">Bottom</span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  {bottom.map(s => (
                    <div
                      key={s.sensorId}
                      className="heatmap-cell flex items-center justify-center"
                      style={{ backgroundColor: getTempColor(s.temperature) + '33' }}
                    >
                      <div className="text-center">
                        <span className="text-xs font-mono font-semibold text-foreground block">{s.temperature.toFixed(1)}°</span>
                        <span className="text-[9px] text-muted-foreground">{s.corner}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend + averages */}
        <div className="w-32 flex flex-col justify-between text-xs">
          <div>
            <p className="text-muted-foreground mb-2 font-mono uppercase text-[10px] tracking-wider">Averages</p>
            <div className="space-y-2">
              <div className="bg-secondary rounded p-2">
                <p className="text-muted-foreground text-[10px]">Top Avg</p>
                <p className="font-mono font-semibold text-foreground">{avgTop.toFixed(1)}°C</p>
              </div>
              <div className="bg-secondary rounded p-2">
                <p className="text-muted-foreground text-[10px]">Bottom Avg</p>
                <p className="font-mono font-semibold text-foreground">{avgBottom.toFixed(1)}°C</p>
              </div>
              <div className="bg-secondary rounded p-2">
                <p className="text-muted-foreground text-[10px]">Δ Delta</p>
                <p className="font-mono font-semibold text-foreground">{(avgTop - avgBottom).toFixed(1)}°C</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-muted-foreground mb-1 font-mono uppercase text-[10px] tracking-wider">Scale</p>
            <div className="h-24 w-4 rounded-sm overflow-hidden" style={{
              background: 'linear-gradient(to bottom, hsl(0,72%,55%), hsl(38,92%,55%), hsl(142,72%,45%), hsl(200,80%,55%))'
            }} />
            <div className="flex justify-between mt-1 text-[9px] text-muted-foreground font-mono">
              <span>50°</span>
              <span>20°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
