#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>

// Sensor Pin Definitions (Placeholder - Adjust as per hardware)
#define PIN_CURRENT_SENSOR 34
#define PIN_VIBRATION_SENSOR 35

// Thresholds for Level 1 Wake-up
// Adjust these based on calibration
#define THRESHOLD_CURRENT_RMS 0.5 // Amps
#define THRESHOLD_VIBRATION_AMP 0.2 // g

// Sampling Parameters
#define SAMPLES_RMS 100
#define SAMPLES_FFT 512
#define SAMPLING_FREQ_FFT 4000 // Hz

// Structure to hold sensor data
struct SensorData {
    float rmsCurrent;
    float vibrationAmplitude;
    bool anomalyDetected;
};

// Function Prototypes
void setupSensors();
float readRMSCurrent();
float readVibrationAmplitude();
void performHighSpeedSamplingAndFFT(); // Level 2
int runTinyMLInference(); // Stub for Level 2

#endif // SENSORS_H
