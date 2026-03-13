/**
 * Rack Thermal Monitor — Backend Server
 * 
 * Reads DS18B20 sensor data from Arduino via serial port
 * and serves it as a REST API on port 3001.
 * 
 * SETUP:
 *   1. cd backend
 *   2. npm install
 *   3. Edit CONFIG below (COM port, baud rate)
 *   4. node server.js
 * 
 * Arduino should send JSON lines like:
 *   {"sensors":[{"id":1,"temp":32.5},{"id":2,"temp":28.1},...]}
 */

const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// ──────────────────────────────────────────────
// CONFIG — Edit these for your setup
// ──────────────────────────────────────────────
const CONFIG = {
  SERIAL_PORT: 'COM3',        // Change to your Arduino port (e.g. COM5 on Windows, /dev/ttyUSB0 on Linux)
  BAUD_RATE: 9600,
  API_PORT: 3001,
  HISTORY_MAX_POINTS: 96,     // 96 x 15min = 24 hours
  HISTORY_INTERVAL_MS: 15 * 60 * 1000, // 15 minutes
};

// Sensor metadata (must match your wiring)
const SENSOR_META = [
  { id: 1, label: 'Top Front Left',     position: 'top',    corner: 'FL' },
  { id: 2, label: 'Top Back Left',      position: 'top',    corner: 'BL' },
  { id: 3, label: 'Top Back Right',     position: 'top',    corner: 'BR' },
  { id: 4, label: 'Top Front Right',    position: 'top',    corner: 'FR' },
  { id: 5, label: 'Bottom Front Left',  position: 'bottom', corner: 'FL' },
  { id: 6, label: 'Bottom Back Left',   position: 'bottom', corner: 'BL' },
  { id: 7, label: 'Bottom Back Right',  position: 'bottom', corner: 'BR' },
  { id: 8, label: 'Bottom Front Right', position: 'bottom', corner: 'FR' },
];

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
let latestReadings = [];
let history = SENSOR_META.map(s => ({ sensorId: s.id, readings: [] }));
let connected = false;
let lastSerialData = null;

// ──────────────────────────────────────────────
// Serial Port
// ──────────────────────────────────────────────
let port;
let parser;

function connectSerial() {
  try {
    port = new SerialPort({
      path: CONFIG.SERIAL_PORT,
      baudRate: CONFIG.BAUD_RATE,
    });

    parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    port.on('open', () => {
      console.log(`✓ Serial connected on ${CONFIG.SERIAL_PORT} @ ${CONFIG.BAUD_RATE} baud`);
      connected = true;
    });

    parser.on('data', (line) => {
      try {
        const data = JSON.parse(line.trim());
        if (data.sensors && Array.isArray(data.sensors)) {
          const now = new Date();
          latestReadings = data.sensors.map(raw => {
            const meta = SENSOR_META.find(m => m.id === raw.id) || { label: `Sensor ${raw.id}`, position: 'top', corner: '??' };
            return {
              sensorId: raw.id,
              temperature: parseFloat(raw.temp),
              timestamp: now.toISOString(),
              label: meta.label,
              position: meta.position,
              corner: meta.corner,
            };
          });
          lastSerialData = now;
        }
      } catch (e) {
        // Ignore malformed lines
      }
    });

    port.on('error', (err) => {
      console.error('Serial error:', err.message);
      connected = false;
    });

    port.on('close', () => {
      console.log('Serial port closed. Reconnecting in 5s...');
      connected = false;
      setTimeout(connectSerial, 5000);
    });
  } catch (err) {
    console.error(`Failed to open ${CONFIG.SERIAL_PORT}:`, err.message);
    console.log('Retrying in 5s...');
    setTimeout(connectSerial, 5000);
  }
}

// ──────────────────────────────────────────────
// History recording
// ──────────────────────────────────────────────
setInterval(() => {
  if (latestReadings.length === 0) return;
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  latestReadings.forEach(reading => {
    const hist = history.find(h => h.sensorId === reading.sensorId);
    if (hist) {
      hist.readings.push({ time: timeStr, temp: reading.temperature });
      if (hist.readings.length > CONFIG.HISTORY_MAX_POINTS) {
        hist.readings.shift();
      }
    }
  });
}, CONFIG.HISTORY_INTERVAL_MS);

// ──────────────────────────────────────────────
// Express API
// ──────────────────────────────────────────────
const app = express();
app.use(cors());

// Current readings
app.get('/api/sensors', (req, res) => {
  res.json({
    sensors: latestReadings,
    connected,
    lastUpdate: lastSerialData?.toISOString() || null,
  });
});

// History for charts
app.get('/api/history', (req, res) => {
  res.json({ history });
});

// Health check
app.get('/api/status', (req, res) => {
  res.json({
    serial: connected,
    port: CONFIG.SERIAL_PORT,
    baudRate: CONFIG.BAUD_RATE,
    sensorCount: latestReadings.length,
    lastData: lastSerialData?.toISOString() || null,
  });
});

// List available serial ports
app.get('/api/ports', async (req, res) => {
  try {
    const ports = await SerialPort.list();
    res.json(ports);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(CONFIG.API_PORT, () => {
  console.log(`✓ API server running on http://localhost:${CONFIG.API_PORT}`);
  console.log(`  GET /api/sensors  — current readings`);
  console.log(`  GET /api/history  — 24h history`);
  console.log(`  GET /api/status   — connection status`);
  console.log(`  GET /api/ports    — list serial ports`);
  console.log('');
  connectSerial();
});
