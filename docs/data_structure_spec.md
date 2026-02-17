# Data Structure & Edge Case Specification

This document defines the JSON schemas for device communication and the logic for handling common edge cases in the "Hybrid Wake-Up" architecture.

## 1. JSON Data Schemas

### A. Heartbeat Packet (Level 1)
**Frequency**: Every 1-5 minutes (Configurable).
**Purpose**: Periodic health check, low-resolution data.

```json
{
  "type": "HEARTBEAT",
  "deviceId": "ESP32_NODE_001",
  "timestamp": 1715000000,
  "data": {
    "rmsCurrent": 0.45,      // Amps
    "vibrationPeak": 0.02,   // g
    "status": "IDLE",        // Enum: IDLE, ACTIVE, OFF
    "batteryLevel": 98       // % (if applicable)
  }
}
```

### B. Alert Packet (Level 2 Trigger)
**Frequency**: Asynchronous (Event-driven).
**Purpose**: Detailed analysis upon anomaly detection.

```json
{
  "type": "ALERT",
  "deviceId": "ESP32_NODE_001",
  "timestamp": 1715000120,
  "data": {
    "rmsCurrent": 2.5,       // High current trigger
    "vibrationPeak": 0.85,   // High vibration trigger
    "anomalyScore": 0.92,    // 0.0 - 1.0 (from TinyML)
    "classification": "BEARING_FAULT", 
    "fftFeatures": [         // Top 5 dominant frequencies (Optional, for bandwidth saving)
      { "freq": 120, "mag": 0.8 },
      { "freq": 240, "mag": 0.3 }
    ]
  }
}
```

## 2. Edge Case Handling

### A. Network Loss / Intermittent Connectivity
**Scenario**: Wi-Fi/LoRa link is down when an alert occurs.
**Strategy**: "Store & Forward" with Priority Queue.
1.  **Buffer**: Store up to N packets in SPIFFS/LittleFS.
2.  **Priority**: `ALERT` packets > `HEARTBEAT` packets.
    -   If buffer full, drop oldest `HEARTBEAT` first.
    -   Never drop `ALERT` packets until critical storage limit.
3.  **Retry**: Exponential backoff (1s, 2s, 4s...) until reconnection.

### B. Ghost Machine (Current but No Vibration)
**Scenario**: Sensor reads current trigger (>0.5A) but vibration is near zero.
**Diagnosis**: Sensor calibration drift, electrical noise, or disconnected motor load?
**Logic**:
-   If `RMS > Threshold` AND `Vib < NoiseFloor`:
    -   Flag as `FAULT_GHOST`.
    -   Do NOT trigger full Level 2 analysis (save power).
    -   Send one-time "Check Sensor" alert.

### C. Zombie Machine (Vibration but No Current)
**Scenario**: Vibration detected (>0.2g) but Current is 0.
**Diagnosis**: External environmental vibration (nearby heavy machinery).
**Logic**:
-   If `Vib > Threshold` AND `RMS < NoiseFloor`:
    -   Ignore triggers.
    -   Log locally as "Environmental Noise".
    -   Do NOT wake Level 2.
