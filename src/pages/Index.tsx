import { useState, useEffect, useCallback } from 'react';
import { generateMockReadings, generateMockHistory, SensorReading, SensorHistory } from '@/lib/sensorData';
import { fetchSensors, fetchHistory, isBackendAvailable } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import SensorCard from '@/components/SensorCard';
import RackHeatMap from '@/components/RackHeatMap';
import TemperatureChart from '@/components/TemperatureChart';
import AlertPanel from '@/components/AlertPanel';
import StatsBar from '@/components/StatsBar';

// Generate zero readings for disconnected state
const generateDisconnectedReadings = (): SensorReading[] => {
  const labels = [
    { label: 'Top Front Left', position: 'top' as const, corner: 'FL' },
    { label: 'Top Back Left', position: 'top' as const, corner: 'BL' },
    { label: 'Top Back Right', position: 'top' as const, corner: 'BR' },
    { label: 'Top Front Right', position: 'top' as const, corner: 'FR' },
    { label: 'Bottom Front Left', position: 'bottom' as const, corner: 'FL' },
    { label: 'Bottom Back Left', position: 'bottom' as const, corner: 'BL' },
    { label: 'Bottom Back Right', position: 'bottom' as const, corner: 'BR' },
    { label: 'Bottom Front Right', position: 'bottom' as const, corner: 'FR' },
  ];
  return labels.map((s, i) => ({
    sensorId: i + 1,
    temperature: 0,
    timestamp: new Date(),
    ...s,
  }));
};

const Index = () => {
  const [sensors, setSensors] = useState<SensorReading[]>(generateDisconnectedReadings());
  const [history, setHistory] = useState<SensorHistory[]>(generateMockHistory());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLive, setIsLive] = useState(false);
  const [serialConnected, setSerialConnected] = useState(false);

  // Check backend availability on mount
  useEffect(() => {
    isBackendAvailable().then(setIsLive);
  }, []);

  const refresh = useCallback(async () => {
    if (isLive) {
      try {
        const data = await fetchSensors();
        if (data.sensors.length > 0) {
          setSensors(data.sensors);
          setSerialConnected(data.connected);
        } else {
          // Backend is up but no sensor data — device unplugged
          setSensors(generateDisconnectedReadings());
          setSerialConnected(false);
        }
        setLastUpdate(new Date());
      } catch {
        // Backend went away — show zeroed readings
        setIsLive(false);
        setSensors(generateDisconnectedReadings());
        setSerialConnected(false);
        setLastUpdate(new Date());
      }
    } else {
      // No backend available — show zeroed readings (not mock)
      setSensors(generateDisconnectedReadings());
      setLastUpdate(new Date());
    }
  }, [isLive]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Fetch history from backend or regenerate mock
  useEffect(() => {
    const loadHistory = async () => {
      if (isLive) {
        try {
          const data = await fetchHistory();
          if (data.history.some(h => h.readings.length > 0)) {
            setHistory(data.history);
          }
        } catch {
          // Keep existing history on failure
        }
      }
      // No backend — keep whatever history we have
    };
    loadHistory();
    const interval = setInterval(loadHistory, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Periodically re-check backend availability
  useEffect(() => {
    const interval = setInterval(async () => {
      const available = await isBackendAvailable();
      setIsLive(available);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="scan-line" />
      <div className="max-w-7xl mx-auto">
        <DashboardHeader isLive={isLive} serialConnected={serialConnected} />

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
          Last update: {lastUpdate.toLocaleTimeString('en-US', { hour12: false })} • Refresh interval: 5s • {isLive ? (serialConnected ? 'Live data (Arduino)' : 'API connected (no serial)') : 'Disconnected — waiting for backend'}
        </div>
      </div>
    </div>
  );
};

export default Index;
