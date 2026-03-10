import { useState, useEffect, useCallback } from 'react';
import { generateMockReadings, generateMockHistory, SensorReading, SensorHistory } from '@/lib/sensorData';
import DashboardHeader from '@/components/DashboardHeader';
import SensorCard from '@/components/SensorCard';
import RackHeatMap from '@/components/RackHeatMap';
import TemperatureChart from '@/components/TemperatureChart';
import AlertPanel from '@/components/AlertPanel';
import StatsBar from '@/components/StatsBar';

const Index = () => {
  const [sensors, setSensors] = useState<SensorReading[]>(generateMockReadings());
  const [history, setHistory] = useState<SensorHistory[]>(generateMockHistory());
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const refresh = useCallback(() => {
    setSensors(generateMockReadings());
    setLastUpdate(new Date());
  }, []);

  // Auto-refresh every 5 seconds (simulating serial polling)
  useEffect(() => {
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Regenerate history every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(generateMockHistory());
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="scan-line" />
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />

        {/* Stats bar */}
        <StatsBar sensors={sensors} />

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-4 mt-4">
          {/* Sensor cards */}
          <div className="col-span-8">
            <div className="grid grid-cols-4 gap-3 mb-4">
              {sensors.map(s => (
                <SensorCard key={s.sensorId} sensor={s} />
              ))}
            </div>
            <AlertPanel sensors={sensors} />
          </div>

          {/* Heat map */}
          <div className="col-span-4">
            <RackHeatMap sensors={sensors} />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <TemperatureChart
            history={history}
            title="Top Sensors — 24h History"
            sensorFilter={[1, 2, 3, 4]}
          />
          <TemperatureChart
            history={history}
            title="Bottom Sensors — 24h History"
            sensorFilter={[5, 6, 7, 8]}
          />
        </div>

        <div className="mt-4">
          <TemperatureChart
            history={history}
            title="All Sensors — Temperature Trends"
          />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-[10px] font-mono text-muted-foreground">
          Last update: {lastUpdate.toLocaleTimeString('en-US', { hour12: false })} • Refresh interval: 5s • Demo mode (mock data)
        </div>
      </div>
    </div>
  );
};

export default Index;
