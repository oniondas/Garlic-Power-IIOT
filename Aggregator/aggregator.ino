#include <Arduino.h>
#include <esp_now.h>
#include <WiFi.h>
#include <LoRa.h>

// --- CONFIGURATION ---
#define LORA_SS    5
#define LORA_RST   14
#define LORA_DIO0  2
#define LORA_BAND  868E6

// Mesh Structure (Matches Device A)
typedef struct struct_message {
    char deviceId[16];
    float rms;
    float vibration;
    int faultCode;
    uint32_t uptime;
} struct_message;

struct_message incomingData;

// LoRa Packet Structure (Slightly different if needed, or re-broadcast)
// We will send the raw binary struct via LoRa to RPi5

void onDataRecv(const uint8_t * mac, const uint8_t *incoming, int len) {
    memcpy(&incomingData, incoming, sizeof(incomingData));
    
    Serial.print("--- [ESP-NOW RECV] ---");
    Serial.print("\nDevice: "); Serial.println(incomingData.deviceId);
    Serial.print("RMS: "); Serial.println(incomingData.rms);

    // Forward to LoRa
    Serial.println("--- [LoRa FORWARD] ---");
    LoRa.beginPacket();
    LoRa.write((uint8_t*)&incomingData, sizeof(incomingData));
    LoRa.endPacket();
    Serial.println("Forwarded to LoRa Base Station.\n");
}

void setup() {
    Serial.begin(115200);
    
    // 1. Init LoRa
    LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
    if (!LoRa.begin(LORA_BAND)) {
        Serial.println("LoRa Init Failed!");
        while(1);
    }
    LoRa.setSyncWord(0xF3);
    Serial.println("LoRa Link Ready.");

    // 2. Init ESP-NOW
    WiFi.mode(WIFI_STA);
    if (esp_now_init() != ESP_OK) {
        Serial.println("ESP-NOW Init Failed!");
        return;
    }
    esp_now_register_recv_cb(onDataRecv);
    Serial.println("ESP-NOW Mesh Receiver Active.");
}

void loop() {
    // Aggregator is wait-for-interrupt driven via esp_now_register_recv_cb
    delay(1000);
}
