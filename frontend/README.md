# COALGUARD AI — Underground Coal Mine Safety Command Center

A real-time AI-powered safety command dashboard built with React 18, TypeScript, Three.js, Tailwind CSS, Framer Motion, Zustand, and Recharts.

---

## 🚀 Quick Start for Developers

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Package Manager**: npm (v9+) or pnpm / yarn

---

## 📦 1. Installation

If you received this project folder, simply open a terminal inside the project directory and run:

```bash
npm install
```

---

### 📋 Full List of Libraries & Dependencies

If you ever need to install all packages manually from scratch, run:

```bash
npm install react react-dom @types/react @types/react-dom three @types/three @react-three/fiber @react-three/drei framer-motion lucide-react recharts zustand clsx tailwind-merge canvas-confetti @types/canvas-confetti tailwindcss @tailwindcss/vite postcss autoprefixer
```

#### Development Tooling:
```bash
npm install -D vite @vitejs/plugin-react typescript
```

---

### 📚 Dependency Categorization & Purpose

| Category | Packages | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | `react`, `react-dom`, `typescript`, `vite` | Application framework and bundler |
| **3D Graphics Engine** | `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` | 3D underground mine shaft, moving cart, sensor beacons, and 3D PPE models |
| **Styling & Shaders** | `tailwindcss`, `@tailwindcss/vite`, `postcss`, `autoprefixer` | Dark industrial cyber UI, neon glow effects, and glassmorphism |
| **Animation & Motion** | `framer-motion` | Floating card physics, 3D flip effects, and status alert transitions |
| **Data Visualization** | `recharts` | Real-time multi-variable telemetry charts and multivariate threat radar |
| **State Management** | `zustand` | High-frequency telemetry buffers, worker inference queue, and alert dispatching |
| **Icons & VFX** | `lucide-react`, `canvas-confetti` | HUD icons and nominal operation particle bursts |
| **Class Utilities** | `clsx`, `tailwind-merge` | Dynamic conditional class merging |

---

## 🔌 2. Backend Integration Guide

All typed WebSocket and REST schemas are specified in [`src/services/apiContract.ts`](./src/services/apiContract.ts).

### Connecting Your Live Backend:
Create a `.env` file in the root folder:

```env
# Point to your backend WebSocket stream
VITE_WS_URL=ws://localhost:8080/api/v1/mine-safety/stream

# Point to your backend REST API
VITE_API_URL=http://localhost:8080/api/v1
```

*(Note: If `VITE_WS_URL` is left empty, the dashboard automatically runs in realistic standalone simulation mode with zero console errors).*

---

## 💻 3. Running the Dashboard

Start local development server:

```bash
npm run dev
```

The command center will be live at:
👉 **`http://localhost:5173/`**

### Production Build:
```bash
npm run build
```
