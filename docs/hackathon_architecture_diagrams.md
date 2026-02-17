# Garlic - Architecture Diagrams (Industrial Grade)

## ✅ System Architecture - High-Level View

```mermaid
graph TD
    subgraph Machine[Machine Layer]
        S[Machine Sensors]
    end
    subgraph Edge[Edge Layer]
        N[Sensor ESP Nodes]
        A[Local LoRa Aggregator]
        SD1[(SD/Flash Buffer)]
        SD2[(Queue Buffer)]
    end
    subgraph Gateway[Gateway Layer]
        G[Central Gateway]
        LB[(Local Buffer)]
    end
    subgraph Cloud[Cloud Layer]
        C[Cloud Analytics]
        D[User Dashboard & Alerts]
    end

    S --> N
    N -- Wi-Fi / ESP-NOW --> A
    N -.->|Offline| SD1
    SD1 -.->|Retry| N
    
    A -- LoRa --> G
    A -.->|Link Down| SD2
    SD2 -.->|Retry| A

    G -- Internet --> C
    G -.->|No Net| LB
    LB -.->|Retry| G

    C --> D
```

## ✅ Device A — Machine Sensor Node (Hardware Block)

```mermaid
graph TD
    subgraph Node[Device A: Machine Sensor Node]
        ESP[ESP32 Controller]
        SCT[SCT-013 Current Clamp]
        MPU[MPU6050 Accelerometer]
        PWR[USB Power / Batt Backup]
        LED[Status LED]
        FLASH[LittleFS Buffer]
    end

    SCT -->|Analog| ESP
    MPU -->|I2C| ESP
    PWR --> ESP
    ESP --> LED
    ESP <-->|Read/Write| FLASH
```

## ✅ End-to-End Data Flow Pipeline (Resilient)

```mermaid
sequenceDiagram
    participant S as Sensors
    participant N as Sensor Node
    participant A as Aggregator / Gateway
    participant C as Cloud
    participant D as Dashboard

    S->>N: Capture Behavior
    N->>N: Preprocess (RMS, Filtering)
    
    alt Network Available
        N->>A: Send Data (Immediate)
        A-->>N: ACK Received
    else Network Down
        N->>N: Store in Flash Buffer
        Note over N: "Store & Forward"
    end

    loop Every 5 Minutes
        N->>A: Retry Buffered Data
    end

    A->>C: Upload to Cloud
    C->>C: Deduplicate & Timestamp
    C->>C: Classify & Analyze
    C->>D: Update Dashboard
```

## ✅ State Classification Flow (Advanced)

```mermaid
graph TD
    Input[Sensor Data: Current & Vibration] --> Pre[Pre-Processing]
    Pre --> Startup{Startup Mask?}
    
    Startup -- Yes (First 5s) --> Mask[IGNORE Current Spike]
    Startup -- No --> Logic{Core Logic}
    
    Logic -->|curr=0, vib=0| OFF[OFF / STANDBY]
    Logic -->|curr>0, vib=0| GHOST[FAULT: Ghost Machine]
    Logic -->|curr=0, vib>0| ZOMBIE[FAULT: Zombie Machine]
    
    Logic -->|curr>Threshold| ActiveCheck{Stable?}
    ActiveCheck -- Yes --> ACTIVE[ACTIVE]
    ActiveCheck -- No (Noise) --> IDLE[IDLE]

    Mask --> ACTIVE
```
