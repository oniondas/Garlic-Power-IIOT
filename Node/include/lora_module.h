#ifndef LORA_MODULE_H
#define LORA_MODULE_H

#include <Arduino.h>
#include <LoRa.h>

// Standard LoRa Pin Definitions for ESP32
#define LORA_SS    5
#define LORA_RST   14
#define LORA_DIO0  2

// Frequency - Adjust as per region (e.g., 433E6, 868E6, 915E6)
#define LORA_BAND  868E6

/**
 * @brief Packet structure for transmission
 */
struct GarlicPacket {
    char deviceId[16];
    uint32_t timestamp;
    float rms;
    float vibration;
    int faultCode;
};

// Function Prototypes
bool setupLoRa();
bool sendGarlicPacket(const GarlicPacket& packet);

#endif // LORA_MODULE_H
