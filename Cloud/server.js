const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the Dashboard directory
app.use(express.static(path.join(__dirname, '../Dashboard')));

// --- STATE MANAGEMENT ---
// Store the latest state for EVERY device
const deviceMap = new Map();

// API Endpoint to receive data from devices (or simulator)
app.post('/api/data', (req, res) => {
    const packet = req.body;

    // Validate
    if (!packet.deviceId) {
        return res.status(400).send({ error: "Missing deviceId" });
    }

    // console.log(`[Received] ${packet.type} from ${packet.deviceId}`);

    // Update State Store
    const deviceState = {
        deviceId: packet.deviceId,
        timestamp: packet.timestamp,
        rms: packet.data ? packet.data.rmsCurrent : 0,
        vib: packet.data ? packet.data.vibrationPeak : 0,
        status: packet.data ? packet.data.status : "UNKNOWN",
        lastSeen: Date.now()
    };

    deviceMap.set(packet.deviceId, deviceState);

    // Broadcast UPDATE to all connected WebSocket clients
    broadcast(JSON.stringify({
        type: 'UPDATE',
        payload: deviceState
    }));

    res.status(200).send({ status: 'received' });
});

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('Dashboard connected via WebSocket');

    // Send FULL STATE immediately
    const allDevices = Array.from(deviceMap.values());
    ws.send(JSON.stringify({
        type: 'FULL_STATE',
        payload: allDevices
    }));
});

function broadcast(msg) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

// Start Server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Dashboard available at http://localhost:${PORT}`);
});
