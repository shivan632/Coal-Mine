# COALGUARD AI — Project Report & Technical Documentation

**Project Title:** AI-Powered Underground Coal Mine Safety Command Center  
**Platform:** Web Application (React 18, TypeScript, Three.js, Tailwind CSS)  
**Target Domain:** Mining Industrial Safety, Edge AI Computer Vision & Environmental Telemetry  

---

## 1. Executive Summary

**COALGUARD AI** is an advanced, real-time industrial safety intelligence command center designed for underground coal mining operations. It combines edge-simulated **AI computer vision** for automated Personal Protective Equipment (PPE) compliance inspection with an **interactive 3D Digital Twin** of underground mine shafts and a high-frequency **environmental telemetry monitoring engine**.

The system provides mine authorities, safety engineers, and surface control rooms with immediate situational awareness, automated hazard triage, and instant decision-support workflows to eliminate preventable injuries and atmospheric disaster events.

---

## 2. Problem Statement & Industrial Need

Coal mining is one of the highest-risk heavy industries globally, characterized by:
1. **Severe Underground Atmospheric Hazards:** Undetected buildups of explosive Methane ($\text{CH}_4$), toxic Carbon Monoxide ($\text{CO}$), low Oxygen ($\text{O}_2$), or extreme thermal/humidity stress can rapidly lead to fatal explosions or worker asphyxiation.
2. **Human Error in Manual Gear Inspection:** Physical inspection of safety equipment at entry shafts is time-consuming, prone to fatigue, and inconsistent in detecting subtle missing gear items.
3. **Fragmented Telemetry Data:** Traditional operations often lack a unified, visual command center that correlates worker location, PPE compliance, and multi-zone atmospheric readings in real time.

---

## 3. Core System Modules & Functional Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                  COALGUARD AI COMMAND CENTER ARCHITECTURE                  │
├────────────────────────────────┬───────────────────────────────────────────┤
│ 1. AI Vision & PPE Inspection  │ • Live Video & Neural Inference Canvas    │
│    Terminal                    │ • Automated Bounding Box Tracking         │
│                                │ • 3D Procedural PPE Models & Toggle Deck  │
│                                │ • "ALL CORRECT" vs "SOMETHING IS MISSING" │
├────────────────────────────────┼───────────────────────────────────────────┤
│ 2. 3D Underground Digital Twin │ • Procedural Shaft (-1500m) & Tunnels     │
│    (Three.js / WebGL)          │ • Animated Mining Carts & Railway Tracks  │
│                                │ • Instanced Pulsing 3D Sensor Beacons     │
│                                │ • Flowing Bézier Curve Data Streams       │
│                                │ • Cinematic Smooth Orbit & Zone Cameras   │
├────────────────────────────────┼───────────────────────────────────────────┤
│ 3. Real-Time Telemetry &       │ • 3D Flip Cards (CH4, CO, Temp, Hum, etc.)│
│    Sensor Intelligence         │ • Diagnostic Specs (24h Min/Max, Calib)   │
│                                │ • Composite Mine Safety Index (MSI) Gauge │
│                                │ • Risk Multivariate Threat Radar          │
├────────────────────────────────┼───────────────────────────────────────────┤
│ 4. Analytics, Alerts &         │ • Real-time Incident Triage & SFX Alarms  │
│    Simulation Controller       │ • Multi-Axis Historical Recharts Graphs   │
│                                │ • One-Click Failure Mode Stress Simulator │
│                                │ • CSV Compliance Audit Log Exporter       │
└────────────────────────────────┴───────────────────────────────────────────┘
```

---

## 4. Key Functional Highlights

### 4.1 Automated AI PPE Inspection
- **Live Video / Simulated Edge Feed:** High-resolution camera feeds with vertical neon scanning sweep line.
- **5-Point Certified Gear Verification:** Detects Hard Hat & Lamp (EN 397), High-Vis Safety Jacket (ISO 20471), Gas Respirator Mask (FFP3), Steel-Toe Boots (ISO 20345), and Kevlar Gloves (EN 388).
- **Instant Visual Verdict:**
  - `ALL CORRECT ✓ — AUTHORIZED TO ENTER`: Green indicator clearing turnstile entry.
  - `SOMETHING IS MISSING!`: Crimson warning banner itemizing exact missing items and triggering automatic entry lockout.

### 4.2 3D Underground Mine Digital Twin
- Interactive Three.js WebGL visualization spanning depths from **0m (Surface)** to **-1500m (Deep Shaft)**.
- **Instanced Beacons:** Real-time color-coded nodes reflecting nominal (green), warning (amber), and critical (red) status.
- **Flying Data Streams:** Spline curves with glowing animated energy particles transmitting real-time sensor packets from deep tunnels to surface nodes.
- **Camera Navigation:** Seamless cinematic transitions between Free Orbit, Vertical Shaft Focus, and Gas Zone B-12 inspection modes.

### 4.3 Multi-Sensor 3D Flip Diagnostic Matrix
- Continuously streams and monitors 6 environmental parameters:
  1. **Methane ($\text{CH}_4$):** Safe $< 1.0\%$ | Warning $1.0 - 2.0\%$ | Critical $> 2.0\%$
  2. **Carbon Monoxide ($\text{CO}$):** Safe $< 25\text{ ppm}$ | Warning $25 - 50\text{ ppm}$ | Critical $> 50\text{ ppm}$
  3. **Ambient Temperature:** Safe $20 - 28^\circ\text{C}$ | Warning $28 - 35^\circ\text{C}$ | Critical $> 35^\circ\text{C}$
  4. **Relative Humidity:** Safe $40 - 70\%$ | Warning $70 - 85\%$ | Critical $> 85\%$
  5. **Barometric Pressure:** Safe $980 - 1025\text{ hPa}$
  6. **Oxygen Level ($\text{O}_2$):** Safe $19.5 - 23.5\%$ | Critical $< 19.5\%$
- **3D Flip Interaction:** Clicking any tile flips it 180° in 3D space to reveal hardware model, 24h peak/base telemetry, 20Hz sampling rate, and calibration status.

### 4.4 Mine Safety Index (MSI) & Risk Multivariate Radar
- Composite scoring algorithm evaluating atmospheric purity, worker compliance rate, and thermal stability into a single **0–100% Mine Safety Index**.
- Radar chart projecting 6 threat axes for predictive hazard forecasting.

### 4.5 One-Click Scenario Simulation Deck
Provides safety auditors and evaluators with instant simulation triggers:
- `🟢 Nominal Mine Operations`
- `🟡 Gas Surge at Zone B-12 (CH4 2.85%)`
- `🔴 Worker PPE Defect Alert`
- `🔥 Thermal & Humidity Surge (38.6°C)`
- `🚨 Full Mine Evacuation Drill`

---

## 5. Technology Stack & Specifications

| Layer | Technology | Key Libraries |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript | `react`, `react-dom`, `typescript` |
| **Bundler & Build Tool** | Vite 8 | `@vitejs/plugin-react`, `vite` |
| **3D Rendering** | Three.js & WebGL | `three`, `@react-three/fiber`, `@react-three/drei` |
| **Styling & HUD Design** | Tailwind CSS v4 | `@tailwindcss/vite`, `postcss`, `autoprefixer` |
| **Motion & Physics** | Framer Motion | `framer-motion` |
| **State Synchronization**| Zustand | `zustand` (Centralized 20Hz Ring Buffers) |
| **Data Visualization** | Recharts | `recharts` (Area charts, Radar charts) |
| **Icons & VFX** | Lucide React & Confetti | `lucide-react`, `canvas-confetti` |
| **Audio Engine** | Web Audio API | Procedural synthesizers (Zero asset downloads) |

---

## 6. Backend Integration Contracts

The frontend architecture is completely decoupled from backend persistence via standardized data contracts defined in [`src/services/apiContract.ts`](./src/services/apiContract.ts):
- **WebSocket Feed:** Streams real-time `TELEMETRY_PACKET`, `WORKER_PPE_INFERENCE`, and `INCIDENT_ALERT` envelopes.
- **REST Archive:** Historical multi-variable telemetry querying with CSV audit export.
- **Zero-Failure Fallback:** Automatically runs full-fidelity client simulations when live backends are offline.

---

## 7. Conclusion & Impact

COALGUARD AI bridges the gap between modern artificial intelligence, 3D digital twins, and industrial safety compliance. By replacing manual gate checks and fragmented sensor readouts with an integrated, high-fidelity visual command center, the project sets a new benchmark for smart mining safety operations.
