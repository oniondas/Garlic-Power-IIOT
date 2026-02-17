#include "lora_module.h"

bool setupLoRa() {
    Serial.println("[LoRa] Initializing...");
    
    LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);
    
    if (!LoRa.begin(LORA_BAND)) {
        Serial.println("[LoRa] Initialization Failed!");
        return false;
    }
    
    // Set parameters for reliability in industrial environments
    LoRa.setSpreadingFactor(10);
    LoRa.setSignalBandwidth(125E3);
    LoRa.setCodingRate4(8);
    LoRa.setSyncWord(0xF3); // Garlic specific sync word
    
    Serial.println("[LoRa] Ready.");
    return true;
}

bool sendGarlicPacket(const GarlicPacket& packet) {
    Serial.printf("[LoRa] Sending packet from %s...\n", packet.deviceId);
    
    if (!LoRa.beginPacket()) {
        return false;
    }
    
    // Send raw binary data for efficiency
    LoRa.write((uint8_t*)&packet, sizeof(packet));
    
    if (LoRa.endPacket()) {
        Serial.println("[LoRa] Packet Sent.");
        return true;
    } else {
        Serial.println("[LoRa] Packet Failed!");
        return false;
    }
}
