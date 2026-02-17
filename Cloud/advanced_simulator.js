const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const PORT = 3001; // Simulator Control Port
const TARGET_API = 'http://localhost:3000/api/data';

app.use(express.json());
app.use(cors()); // Allow Dashboard to call us

// Virtual Device State
let devices = [];

// Initialize 30 Default Devices
const TYPES = ['CNC', 'Lathe', 'Press', 'Furnace'];
for (let i = 1; i <= 30; i++) {
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    const id = `${type}_${String(i).padStart(2, '0')}`;

    // Randomize initial state 
    // Most in AUTO_CYCLE for liveliness
    // A few with DRIFT or SPIKE for demo
    let mode = 'AUTO_CYCLE';
    if (Math.random() > 0.9) mode = 'DRIFT';

    devices.push({
        id: id,
        rms: 0,
        vib: 0,
        status: "IDLE",
        mode: mode,
        internalState: 'IDLE',
        driftStep: 0,
        nextStateChange: 0,
        feeding: { rms: 0, vib: 0 }
    });
}

// Helper: Post data to Main Backend
function sendTelemetry(device, capturedData) {
    const payload = JSON.stringify({
        type: (capturedData.rms > 1.0 || capturedData.vib > 0.3) ? 'ALERT' : 'HEARTBEAT',
        deviceId: device.id,
        timestamp: Math.floor(Date.now() / 1000),
        data: {
            rmsCurrent: capturedData.rms,
            vibrationPeak: capturedData.vib,
            status: capturedData.status,
            anomalyScore: (device.mode === 'NORMAL' || device.mode === 'AUTO_CYCLE') ? 0.01 : 0.85,
            classification: (device.mode === 'NORMAL' || device.mode === 'AUTO_CYCLE') ? 'NONE' : 'SIMULATED_FAULT',
            // Detailed Sim Data
            feedingRms: device.feeding.rms,
            errorRms: (capturedData.rms - device.feeding.rms).toFixed(4)
        }
    });

    const req = http.request(TARGET_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length
        }
    }, (res) => {
        // console.log(`[${device.id}] Sent ${payload.length} bytes. Status: ${res.statusCode}`);
    });

    req.on('error', (e) => console.error(`[${device.id}] Failed to send: ${e.message}`));
    req.write(payload);
    req.end();
}

// Simulation Loop (1Hz)
setInterval(() => {
    const now = Date.now();
    devices.forEach(dev => {
        // --- 1. CHAOS ENGINE (State Machine) ---
        // If in AUTO_CYCLE, we manage state transitions automatically
        if (dev.mode === 'AUTO_CYCLE') {
            if (!dev.nextStateChange || now > dev.nextStateChange) {
                // Time to switch state!
                const rand = Math.random();
                if (rand < 0.6) {
                    // 60% Chance: Normal Work Cycle
                    dev.internalState = 'WORKING';
                    dev.nextStateChange = now + (10000 + Math.random() * 20000); // 10-30s
                } else if (rand < 0.8) {
                    // 20% Chance: Idle / Cooldown
                    dev.internalState = 'IDLE';
                    dev.nextStateChange = now + (5000 + Math.random() * 10000); // 5-15s
                } else if (rand < 0.9) {
                    // 10% Chance: Drift Warning
                    dev.internalState = 'DRIFT_SIM';
                    dev.driftStep = 0;
                    dev.nextStateChange = now + (15000 + Math.random() * 10000); // 15-25s
                } else {
                    // 10% Chance: Spike / Fault
                    dev.internalState = 'SPIKE_SIM';
                    dev.nextStateChange = now + (2000 + Math.random() * 3000); // 2-5s burst
                }
            }
        } else {
            // Manual Override Modes map directly
            if (dev.mode === 'NORMAL') dev.internalState = 'IDLE'; // Default low power
            else if (dev.mode === 'DRIFT') dev.internalState = 'DRIFT_SIM';
            else if (dev.mode === 'SPIKE') dev.internalState = 'SPIKE_SIM';
        }

        // --- 2. Generate Physics based on Internal State ---
        let feedingRms = 0;
        let feedingVib = 0;
        let status = "IDLE";

        switch (dev.internalState) {
            case 'WORKING':
                feedingRms = 3.5 + (Math.random() * 0.5); // 3.5-4.0A
                feedingVib = 0.05 + (Math.random() * 0.01);
                status = "ACTIVE";
                break;
            case 'IDLE':
                feedingRms = 0.2 + (Math.random() * 0.05); // 0.2A
                feedingVib = 0.002;
                status = "IDLE";
                break;
            case 'DRIFT_SIM':
                dev.driftStep += 0.05;
                // Ramps up from 0.5 to >2.0
                feedingRms = 2.0 + Math.sin(dev.driftStep) * 1.5;
                feedingVib = 0.1 + (dev.driftStep * 0.05);
                status = (feedingRms > 3.0) ? "ALERT" : "ACTIVE";
                break;
            case 'SPIKE_SIM':
                feedingRms = 8.0 + (Math.random() * 4.0); // Huge current
                feedingVib = 1.5 + (Math.random() * 0.5); // Heavy shaking
                status = "ALERT";
                break;
            default: // Fallback
                feedingRms = 0.0;
                feedingVib = 0.0;
                status = "OFFLINE";
        }

        // Store Ideal
        dev.feeding = { rms: feedingRms, vib: feedingVib };

        // --- 3. Telemetry & Noise ---
        // Simulate sensor noise + quantization error
        const noiseRms = (Math.random() * 0.05) - 0.025;

        let capturedRms = feedingRms + noiseRms;
        let capturedVib = feedingVib + (Math.random() * 0.005);

        // Clamp values
        capturedRms = Math.max(0, capturedRms);
        capturedVib = Math.max(0, capturedVib);

        sendTelemetry(dev, { rms: capturedRms, vib: capturedVib, status });

        // Update dev state for UI reading
        dev.rms = capturedRms;
        dev.vib = capturedVib;
        dev.status = status;
        dev.feedingRms = feedingRms;

        // Track stats for "Waste" calculation
        if (dev.status === 'IDLE') {
            dev.idleTicks = (dev.idleTicks || 0) + 1;
        }
    });
}, 1000);

// --- API Endpoints for UI ---

app.get('/devices', (req, res) => {
    res.json(devices);
});

app.post('/device/add', (req, res) => {
    const newId = req.body.id || `SIM_DEV_${devices.length + 1}`;
    devices.push({
        id: newId,
        rms: 0, vib: 0, status: "IDLE", mode: "AUTO_CYCLE",
        internalState: 'IDLE', driftStep: 0, nextStateChange: 0, feeding: { rms: 0, vib: 0 }
    });
    res.json({ message: "Device added", device: newId });
});

app.post('/device/remove', (req, res) => {
    const id = req.body.id;
    devices = devices.filter(d => d.id !== id);
    res.json({ message: "Device removed", id });
});

app.post('/device/update', (req, res) => {
    const { id, rms, vib, mode } = req.body;
    const dev = devices.find(d => d.id === id);
    if (dev) {
        if (mode !== undefined) {
            dev.mode = mode;
            // Immediate reset
            dev.nextStateChange = 0;
            dev.driftStep = 0;
        }
        res.json({ message: "Updated", device: dev });
    } else {
        res.status(404).json({ message: "Not found" });
    }
});

// Start Simulator
app.listen(PORT, () => {
    console.log(`Advanced Simulator API running on http://localhost:${PORT}`);
});
