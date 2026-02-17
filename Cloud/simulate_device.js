const http = require('http');

const DEVICE_ID = "SIM_DEVICE_001";
const SERVER_HOST = 'localhost';
const SERVER_PORT = 3000;
const SERVER_PATH = '/api/data';

// Simulation Parameters
let isRunning = true;
let currentRMS = 0.4;
let vibration = 0.02;

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function sendPacket(type, data) {
    const payload = JSON.stringify({
        type: type,
        deviceId: DEVICE_ID,
        timestamp: Math.floor(Date.now() / 1000),
        data: data
    });

    const options = {
        hostname: SERVER_HOST,
        port: SERVER_PORT,
        path: SERVER_PATH,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length
        }
    };

    const req = http.request(options, (res) => {
        // console.log(`[Sent] ${type} | Status: ${res.statusCode}`);
    });

    req.on('error', (error) => {
        console.error(`[Error] Connection Failed: ${error.message}`);
    });

    req.write(payload);
    req.end();
}

// Emulate Device Loop
setInterval(() => {
    // 90% chance of being Normal, 10% chance of random spike
    const isAnomaly = Math.random() > 0.9;

    if (isAnomaly) {
        // Spike values
        currentRMS = getRandom(2.0, 5.0);
        vibration = getRandom(0.5, 1.5);

        console.log(`>> SIMULATING FAULT: RMS=${currentRMS.toFixed(2)}A, Vib=${vibration.toFixed(2)}g`);

        // Send ALERT Packet (Level 2)
        sendPacket('ALERT', {
            rmsCurrent: currentRMS,
            vibrationPeak: vibration,
            status: 'ALERT',
            classification: 'BEARING_WEAR',
            anomalyScore: getRandom(0.8, 0.99)
        });

    } else {
        // Normal values
        currentRMS = getRandom(0.3, 0.6);
        vibration = getRandom(0.01, 0.05);

        console.log(`[Heartbeat] RMS=${currentRMS.toFixed(2)}A, Vib=${vibration.toFixed(2)}g`);

        // Send HEARTBEAT Packet (Level 1)
        sendPacket('HEARTBEAT', {
            rmsCurrent: currentRMS,
            vibrationPeak: vibration,
            status: 'IDLE'
        });
    }

}, 2000); // Check every 2 seconds for demo speed
