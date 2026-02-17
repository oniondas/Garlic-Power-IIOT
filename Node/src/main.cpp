#include <Arduino.h>
#include "sensors.h"
#include "esp_now_module.h"

// Define States
enum MachineState {
    STATE_IDLE_LEVEL1,
    STATE_ACTIVE_ANALYSIS_LEVEL2,
    STATE_TRANSMIT
};

MachineState currentState = STATE_IDLE_LEVEL1;
unsigned long lastCheckTime = 0;
const unsigned long CHECK_INTERVAL = 1000; // 1 second for Level 1 check

float lastRMS = 0;
float lastVib = 0;
int lastFault = 0;

void setup() {
    Serial.begin(115200);
    setupSensors();
    setupEspNow();
    
    Serial.println("Garlic Device A (ESP-NOW) Initialized.");
}

void loop() {
    unsigned long currentTime = millis();

    switch (currentState) {
        case STATE_IDLE_LEVEL1:
            if (currentTime - lastCheckTime >= CHECK_INTERVAL) {
                lastCheckTime = currentTime;
                lastRMS = readRMSCurrent();
                lastVib = readVibrationAmplitude();

                if (lastRMS > THRESHOLD_CURRENT_RMS || lastVib > THRESHOLD_VIBRATION_AMP) {
                    Serial.println(">> ANOMALY DETECTED! Level 2 Start.");
                    currentState = STATE_ACTIVE_ANALYSIS_LEVEL2;
                }
            }
            break;

        case STATE_ACTIVE_ANALYSIS_LEVEL2:
            performHighSpeedSamplingAndFFT();
            lastFault = runTinyMLInference();

            if (lastFault != 0) {
                currentState = STATE_TRANSMIT;
            } else {
                currentState = STATE_IDLE_LEVEL1;
            }
            break;

        case STATE_TRANSMIT:
            Serial.println(">> Transmitting via ESP-NOW...");
            sendDataEspNow(lastRMS, lastVib, lastFault);
            currentState = STATE_IDLE_LEVEL1;
            break;
    }
}
