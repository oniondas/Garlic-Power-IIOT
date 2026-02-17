import time
import struct
import requests
from pyLoRa.LoRa import LoRa
from pyLoRa.board_config import BoardConfig

# --- CONFIGURATION ---
GARLIC_CLOUD_URL = "http://localhost:3000/api/data"
LORA_SYNC_WORD = 0xF3
LORA_FREQ = 868.0

# Protocol matches struct_message in C++
# char[16], float, float, int, uint32
PACKET_FORMAT = "<16sffiI" 

class GarlicBaseStation:
    def __init__(self):
        # Configuration for RPi5 SPI + LoRa Module
        self.board = BoardConfig(LoRa.BAND868, LoRa.SF10)
        self.lora = LoRa(self.board)
        self.lora.set_sync_word(LORA_SYNC_WORD)
        print("[Garlic] Base Station Online. Listening for LoRa Mesh...")

    def run(self):
        while True:
            if self.lora.received_packet():
                payload = self.lora.read_payload()
                print(f"[LoRa] Received raw payload of size {len(payload)}")
                
                try:
                    # Unpack binary data
                    unpacked = struct.unpack(PACKET_FORMAT, payload)
                    device_id = unpacked[0].decode('utf-8').strip('\x00')
                    
                    data = {
                        "deviceId": device_id,
                        "rms": unpacked[1],
                        "vibration": unpacked[2],
                        "fault": unpacked[3],
                        "uptime": unpacked[4],
                        "type": "LORA_MESH_UPLINK"
                    }
                    
                    print(f"[Cloud] Forwarding data from {device_id}...")
                    self.upload_to_cloud(data)
                    
                except Exception as e:
                    print(f"[Error] Packet Parsing Failed: {e}")

            time.sleep(0.1)

    def upload_to_cloud(self, data):
        try:
            r = requests.post(GARLIC_CLOUD_URL, json=data, timeout=5)
            if r.status_code == 200:
                print(">> Sync Successful")
            else:
                print(f">> Cloud Error: {r.status_code}")
        except Exception as e:
            print(f">> Network Error: {e}")

if __name__ == "__main__":
    station = GarlicBaseStation()
    station.run()
