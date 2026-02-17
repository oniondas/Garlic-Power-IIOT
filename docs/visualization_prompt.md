# 3D Visualization Prompt - Warehouse Digital Twin

**Context:**
This prompt is designed to generate a high-fidelity 3D visualization of the industrial warehouse for the "User UI to Simulation" view. The goal is to create a clean, modern "Digital Twin" aesthetic where the environment is abstract but the data sources (machines/sensors) are distinct.

## Prompt Description

**Subject:**
A wide-angle, high-isometric view of a modern industrial factory floor or warehouse interior.

**Environment Style (The "White/Opacity" Look):**
*   **Material:** All structural elements (walls, floors, roof trusses, pillars, walkways) should be rendered in a **matte white** or **light grey** material.
*   **Opacity:** The walls and heavy machinery casings should have **50-70% opacity** (semi-transparent) or a "frosted glass" / "architectural clay model" texture. This allows seeing through obstructions.
*   **Aesthetic:** Clean, clinical, blueprint-like, minimal details on the building structure. No grime, no dark shadows. Generative Art / Sci-Fi Lab feel.

**Highlighted Elements (The "Color" Data):**
*   **Machines:** The core machinery (CNC mills, Lathes, Conveyor motors) should be visible as solid white or slightly darker grey outlines within the transparent casings.
*   **Sensors (The Focus):** Attached to specific motor points on the machines are **Small IoT Sensor Boxes**.
    *   **Color coding:** These sensors must be **vibrant, neon colors** that pop against the white background.
    *   **Green Neon:** Representing "Normal / Healthy" state.
    *   **Red/Orange Neon:** Representing "Alert / Fault" state.
    *   **UI Overlays:** Floating holographic text or minimal connection lines (cyan/blue) rising from the sensors to a digital ceiling grid.

**Lighting & Atmosphere:**
*   **Lighting:** Soft, global illumination (Ambient Occlusion). No harsh directional shadows. The light seems to emit from the sensors themselves or a clean overhead soft-box.
*   **Background:** Pure white or very light grey fog to fade out the distance.

---

## Suggested GenAI / 3D Engine Inputs

**For Midjourney / DALL-E 3:**
> "Isometric view of an industrial factory floor, architectural clay render style, pure white matte materials, semi-transparent frosted glass machinery casings, walls are ghosted opacity. Feature small IoT sensor boxes attached to motors glowing in vibrant neon green and alert red. Clean studio lighting, soft ambient occlusion, white background, 8k resolution, high tech digital twin aesthetic."

**For Three.js / WebGL Implementation:**
*   **Scene:** `scene.background = new THREE.Color(0xffffff);`
*   **Materials:** 
    *   Building: `MeshPhysicalMaterial` with `transmission: 0.6`, `roughness: 0.2`, `color: 0xffffff`.
    *   Sensors: `MeshBasicMaterial` with `color: 0x00ff00` (Green) or `0xff0000` (Red), attached to a `PointLight`.
*   **Post-Processing:** Add `UnrealBloomPass` to make the colored sensors glow against the white environment.
