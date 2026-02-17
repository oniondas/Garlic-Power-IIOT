# Garlic - Final Reference Architecture

## 🏗️ Overall System Architecture

### 🌐 High-Level View

```text
[Machine Sensors]
      ↓
[Sensor ESP Nodes]
      ↓ (Wi-Fi / ESP-NOW)
[Local LoRa Aggregator]
      ↓ (LoRa)
[Central Gateway]
      ↓ (Internet)
[Cloud Analytics]
      ↓
[User Dashboard & Alerts]
```

---

## 🔧 PART 1 — Device Architecture (Hardware)

We divide into **three physical devices**.

### 🟢 Device A — Machine Sensor Node (Per Machine)

**Purpose**: Capture electrical + mechanical behavior.

**Hardware**:
*   ESP32 (controller)
*   SCT-013 current clamp
*   MPU6050 accelerometer
*   USB power
*   Status LED

**What it measures**:
*   RMS current
*   Estimated power
*   Vibration RMS
*   Machine runtime

**Edge processing (lightweight)**:
Inside ESP32:
*   Signal filtering
*   Moving average
*   Basic state hint
*   Packet formatting

**Communication (Node → Aggregator)**:
*   Wi-Fi (recommended MVP) or ESP-NOW (advanced)

### 🔵 Device B — Local LoRa Aggregator (Per Workshop Zone)

⭐ **Cost-optimization innovation**

**Purpose**:
*   Collect data from many nodes
*   Buffer packets
*   Forward via LoRa

**Hardware**:
*   ESP32
*   SX1276/78 LoRa module
*   Wi-Fi receiver
*   Queue buffer
*   USB power

**Core functions**:
*   Multi-node reception
*   Packet validation
*   Time stamping
*   Batching
*   LoRa transmission
*   Retry handling

**Communication (Aggregator → Gateway)**:
*   LoRa (long range)

### 🟣 Device C — Central Gateway (One per facility)

**Purpose**: Bridge LoRa network to internet.

**Hardware**:
*   Option 1 (MVP): ESP32 + LoRa, Wi-Fi to cloud
*   Option 2 (Pro): Raspberry Pi + LoRa HAT

**Functions**:
*   Receive LoRa packets
*   Acknowledge
*   Forward to cloud (MQTT/HTTP)
*   Local buffering

---

## ☁️ PART 2 — Software Architecture

### 🧱 Layer 1 — Embedded Firmware

#### Sensor Node Firmware
*   **Tasks**: ADC sampling, vibration sampling, RMS calculation, moving average, state pre-hint, packet transmit.
*   **Loop timing**: Sensing (1–2 sec), Transmit (5–10 sec).

#### Aggregator Firmware
*   **Tasks**: Receive from many nodes, maintain node registry, packet queue, LoRa scheduling, ACK management, store-and-forward.

#### Gateway Firmware
*   **Tasks**: LoRa receive, packet decode, internet publish, device heartbeat, basic logging.

### ☁️ Layer 2 — Cloud Backend

**Core modules**:

1.  **Data Ingestion**: MQTT broker or REST API, device authentication, time-series storage.
2.  **State Classification Engine**:
    *   Uses: Power thresholds, variance, vibration fusion, temporal filtering.
    *   Outputs: `OFF / STANDBY / IDLE / ACTIVE / STARTUP / FAULT`
3.  **Analytics Engine**:
    *   Computes: Energy consumption, idle duration, machine ranking, peak detection, anomaly detection, bill prediction.
4.  **Recommendation Engine ⭐**:
    *   Generates insights: Idle shutdown alerts, oversize motor hint, abnormal behavior, energy saving tips.

### 📱 Layer 3 — User Application

*   **Dashboard features**: Live machine status, energy trends, MRI efficiency score, expected bill, machine ranking, alert history.
*   **Alert system**: WhatsApp, email, SMS (optional).

---

## 🔄 End-to-End Data Flow

1.  **Sensors** capture machine behavior.
2.  **Sensor node** preprocesses.
3.  **Node** sends to local aggregator.
4.  **Aggregator** batches and forwards via LoRa.
5.  **Gateway** uploads to cloud.
6.  **Cloud** classifies machine state.
7.  **Analytics** compute waste.
8.  **Recommendations** generated.
9.  **User** receives dashboard + alerts.

---

## 🏆 Why This Architecture Wins Judges

*   Plug-and-play deployment.
*   Cost-optimized LoRa usage.
*   Scalable multi-machine design.
*   Edge intelligence.
## 🔮 Future Roadmap & Innovations (The "Wow Factor")

### 1. Hybrid Wake-Up Architecture (Power & AI)
We balance 24/7 visibility with extreme power efficiency using a 2-stage monitoring logic:

*   **Level 1 (Always-On @ <10mA)**: Continuous RMS Current & Vibration amplitude check.
    *   *Method:* Low-frequency sampling (1Hz) or hardware interrupt.
    *   *Detects:* ON / OFF / IDLE / HARD FAULTS.
    *   *Transition:* If variables exceed threshold $\rightarrow$ Wake Level 2.
*   **Level 2 (Triggered AI Analysis)**: Activated only when Level 1 detects anomaly or on schedule (e.g., hourly).
    *   *Action:* High-speed sampling (4kHz) $\rightarrow$ FFT (Frequency Domain) $\rightarrow$ TinyML Model (Edge Impulse / TensorFlow Lite).
    *   *Detects:* Bearing wear, misalignment, looseness (Predictive Maintenance).
    *   *Return:* After analysis, go back to Level 1.

### 2. GenAI "Factory Chat"
Integrated LLM (Gemini/OpenAI) on the dashboard to allow natural language queries:
*   *"Which machine had the most idle time yesterday?"*
*   *"Draft a maintenance report for CNC-01."*

### 3. True 3-Phase Expansion
*   Current V1 hardware uses **Single-Phase Signature Analysis** (cost-optimized).
*   V2 PCB design includes 3x ADC channels for full 3-phase imbalance detection.
