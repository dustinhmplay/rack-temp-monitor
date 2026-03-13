import { Server, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardHeaderProps {
  isLive?: boolean;
  serialConnected?: boolean;
}

export default function DashboardHeader({ isLive = false, serialConnected = false }: DashboardHeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
          <Server className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Rack Thermal Monitor</h1>
          <p className="text-xs text-muted-foreground font-mono">8-Sensor DS18B20 Array • Arduino Uno</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-1.5 text-xs font-mono ${
          isLive ? 'text-primary' : 'text-muted-foreground'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            isLive ? 'bg-primary pulse-dot' : 'bg-muted-foreground'
          }`} />
          {isLive ? (
            <Wifi className="w-3.5 h-3.5" />
          ) : (
            <WifiOff className="w-3.5 h-3.5" />
          )}
          <span>{isLive ? (serialConnected ? 'LIVE' : 'API OK') : 'DEMO'}</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono text-foreground">{time.toLocaleTimeString('en-US', { hour12: false })}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
        </div>
      </div>
    </header>
  );
}
