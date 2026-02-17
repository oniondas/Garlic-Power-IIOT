#ifndef ESP_NOW_MODULE_H
#define ESP_NOW_MODULE_H

#include <Arduino.h>
#include <esp_now.h>
#include <WiFi.h>

/**
 * @brief Garlic ESP-NOW Data Structure
 * Must match between Device A and Aggregator
 */
typedef struct struct_message {
    char deviceId[16];
    float rms;
    float vibration;
    int faultCode;
    uint32_t uptime;
} struct_message;

// Function Prototypes
void setupEspNow();
void sendDataEspNow(float rms, float vib, int fault);

#endif
