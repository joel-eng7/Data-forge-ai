# GESTURA AI — Technology Stack Reference

This document outlines the core technologies, libraries, algorithms, and design choices powering GESTURA AI.

---

## 1. Frontend Client Architecture

| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | React.js | `^18.3.1` | Declarative UI, state management, component tree |
| **Language** | TypeScript | `^5.6.3` | Type safety for landmark vectors and kinematics |
| **Build Tool** | Vite | `^5.4.10` | High-speed ESM hot-module reloading and production bundling |
| **Styling** | Tailwind CSS | `^3.4.14` | Soft pastel pink, rose, and glassmorphism styling |
| **3D Graphics** | Three.js | `^0.187.0` | Procedural articulated 3D hand skeleton & particles |
| **Vision Model** | `@mediapipe/tasks-vision` | `^1.2.2` | WebAssembly & WebGL in-browser 21-landmark tracking |
| **Routing** | React Router DOM | `^7.18.5` | Client-side routing between Home, Dashboard, Gestures, Settings, About |
| **Icons** | Lucide React | `^0.453.0` | Minimal modern icon set |

---

## 2. Artificial Intelligence & Computer Vision

| Subsystem | Tool | Purpose |
| :--- | :--- | :--- |
| **Landmark Detection** | Google MediaPipe Tasks Vision | Real-time extraction of 21 3D hand keypoints |
| **Image Processing** | OpenCV (`opencv-python`) | Frame transformation, color spaces (BGR to RGB), landmark bone rendering |
| **Vector Math** | NumPy | Euclidean distance matrices, vector dot products, scale normalization |
| **Kinematic Classifier** | Custom Euclidean Classifier | Angle computation, relative joint heights, finger extension status |
| **Smoothing** | Exponential Moving Average (EMA) | Anti-jitter smoothing and deadzone thresholding |

---

## 3. Python Backend & Desktop Automation

| Subsystem | Tool | Purpose |
| :--- | :--- | :--- |
| **Web Server** | FastAPI | Asynchronous REST and WebSocket endpoints |
| **ASGI Server** | Uvicorn | High-performance ASGI runner with async event loop |
| **WebSocket** | `websockets` | Bi-directional streaming of telemetry and commands at 60 Hz |
| **Desktop Automation** | PyAutoGUI | Cross-platform cursor positioning, left/right clicks, and scrolling |
| **Safety Tripwire** | PyAutoGUI Failsafe | Instant disarm when pointer reaches any screen corner |
| **Audio Control** | AppleScript (`osascript`) | Native macOS hardware output volume control |
| **Linux Audio** | ALSA / PulseAudio (`amixer`) | Hardware audio volume control on Linux |
| **Input Interception** | `pynput` | Keyboard and mouse event listening and monitoring |

---

## 4. UI/UX Design System: Pink & White 3D Theme

- **Primary Hues**: Soft pastel pink (`#FFF5F7`), blush pink (`#FCE7F3`), rose pink (`#FB7185`), deep rose (`#F43F5E`).
- **Background**: Crisp white (`#FFFFFF`) with subtle gradient fades into very light pink (`#FFF0F4`).
- **Accents**: Lavender (`#F5F3FF`), silver (`#E2E8F0`), rose gold highlights.
- **Glassmorphism**: High-blur frosted glass (`backdrop-filter: blur(16px)`), subtle translucent borders (`rgba(253, 164, 175, 0.35)`), and soft pink drop shadows (`box-shadow: 0 10px 32px 0 rgba(244, 114, 182, 0.08)`).
- **Typography**: Outfit (headings) + Plus Jakarta Sans (body) + JetBrains Mono (metrics and telemetry).
