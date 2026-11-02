<div align="center">

<img src="assets/hero.svg" alt="TableSight — AI Restaurant Intelligence, animated monitoring banner" width="100%"/>

# TableSight — AI Restaurant Monitoring System

**A privacy-aware restaurant intelligence console with a real WebGL digital twin: animated diners, cleaning staff, set tables, camera-driven occupancy states, and human-operated table controls.**

[![CI](https://github.com/hossain0707/AI-Restaurant-Monitoring-System/actions/workflows/ci.yml/badge.svg)](https://github.com/hossain0707/AI-Restaurant-Monitoring-System/actions/workflows/ci.yml)
![Python](https://img.shields.io/badge/Python-FastAPI-1b6b62)
![Computer Vision](https://img.shields.io/badge/AI-COCO--SSD-286f88)
![Privacy](https://img.shields.io/badge/Privacy-Local--first-4aa98c)
![License](https://img.shields.io/badge/License-Proprietary-cd7e68)

**[Open the live 3D TableSight preview](https://tablesight-ai-restaurant.vercel.app/)** · [Architecture](ARCHITECTURE.md) · [Security](SECURITY.md) · [Roadmap](ROADMAP.md)

</div>

> **Deployment note:** The static client preview is published at **https://tablesight-ai-restaurant.vercel.app/**. It is a public demonstration, simulated by default; real camera access is opt-in. This Vercel project was deployed directly from the GitHub-committed source files because the GitHub→Vercel integration has not been granted access to this new repository. **Subsequent GitHub pushes will not automatically deploy there** until that integration is connected. To additionally publish via GitHub Pages, enable **Settings → Pages → Deploy from a branch → main → /docs**.

## Overview

TableSight translates camera observations into actionable table-status changes. The digital floor plan shows tables in an animated 3D perspective with accessible manual controls. A user can explore a realistic **simulation without hardware**, authorize a **laptop or external USB webcam**, or connect a **local IP/RTSP camera via a bridge**.

The current implementation is an **engineering prototype**, not a validated production deployment. It does not claim perfect occupancy detection, crowd tracking, identity recognition, service-time predictions, or regulatory certification.

### Cinematic view based on the approved reference (November 2026)

The **Original cinematic view** keeps the exact composition of the user's provided illustration rather than replacing it with simplified geometry. There are floating clickable table labels, animated sensor pulses and subtle feather-masked motion in customer/staff regions. **This animation is a 2.5D effect on a still illustration, not a real recorded video or fully rigged 3D character animation.** Camera-derived table status changes are reflected in the overlay, while actions like eating or wiping remain simulated.

To make the exact artwork available to **all public visitors**, the copyright owner must add their approved PNG at `assets/restaurant-reference.png` on GitHub. The published viewer attempts to load it from the public repository at runtime. Until that asset exists, the viewer explicitly invites the visitor to select the approved image locally. A chosen image is stored in that viewer's browser with IndexedDB and does not upload to any server. The *Alternate 3D model* remains available for visitors without the image. The Vercel static site requires no additional deployment once the public GitHub raw asset exists.

### Living 3D restaurant — interactive upgrade (November 2026)

The live preview renders a **procedural Three.js digital twin**, rather than the original circular table markers. Each table has 3D furniture, place settings, dynamic lighting, simulated diner gestures, and animated staff wiping/resetting tasks. Status rings and badges respond to table state changes. Drag to rotate the viewpoint, click floating table labels to operate them, or pause the motion.

**Important distinction:** The earlier cinematic images were *concept art*, not rigged animations. The interactive 3D people are **stylized simulated avatars**, not real customers reconstructed from cameras. The camera AI can change table occupancy states, but it does not actually recognize someone eating or a cleaner wiping a surface. Staff must manually confirm cleaning completion. Three.js is loaded on first visit from a CDN and WebGL is required. The legacy floor remains as a fallback when 3D rendering is unavailable.

### Product capabilities

| Capability | Current behavior | Status |
|:--|:--|:--|
| Interactive living 3D digital twin | Three.js procedural chairs/tables, animated simulated people, lighting and status controls | Implemented |
| Restaurant simulation | Labeled simulated table activity, alerts, event log | Implemented |
| Laptop and USB cameras | Browser permission-based camera enumeration and preview | Implemented |
| On-device vision | Optional TensorFlow.js + COCO-SSD person detections | Implemented (requires model download) |
| Table-to-camera calibration | Draw a normalized ROI rectangle for each table | Implemented |
| Status state machine | Presence → occupied; absent → cleaning; staff confirms available | Prototype |
| IP cameras | Local RTSP/HTTP → MJPEG relay using OpenCV | Implemented (local bridge) |
| Alerts & timeline | Cleaning alerts and in-memory browser event history | Implemented |
| Recording / cloud upload | Not included; raw browser-camera video is not sent to a backend | Privacy by design |
| Production accuracy, scale, tenancy | Requires benchmark, integration, security hardening | Not yet validated |

## Experience

<div align="center">
<img src="assets/architecture.svg" alt="TableSight privacy-aware camera and browser AI architecture" width="92%"/>
</div>

The front end is a standalone static app (`docs/index.html`, `docs/styles.css`, `docs/app.js`). No API keys or commercial AI service is required. For the optional detection model, the first use downloads TensorFlow.js and COCO-SSD weights from public CDN/model endpoints; **run the app without that step for an offline visual demo**. The app has no face recognition, persistent behavioral tracking, or video recording.

### A. Start the 3D demo (no camera)

Serve the HTML files over a local origin:

```bash
python -m http.server 8000 --directory docs
# Open http://127.0.0.1:8000
```

Open **Operations overview**, select any table, and mark it occupied, free, reserved, or needing cleaning. Use **Next demo event** to advance a clearly simulated scenario. The demo periodically advances events and can be used without model downloads.

### B. Use laptop or external USB camera

1. Open the HTML demo using **HTTPS** (once Pages is enabled) or `localhost`.
2. Under **Camera laboratory**, choose **Laptop / USB camera**.
3. Select a detected video input, press **Start preview**, and grant browser camera permission.
4. Choose **Enable person detection**. The model downloads on first use.
5. Select a table, press **Draw zone**, and drag the rectangle over its **seated-person area** in the preview. Repeat for each monitored table.
6. Watch camera detections affect *only calibrated table regions*. Unmapped tables stay unmonitored. Staff can override statuses on the floor map.

Browser camera input uses `navigator.mediaDevices.getUserMedia`. Browser permissions are per user. A USB webcam appears in the list when the operating system exposes it as a video input. **Never assume that a person near a table is necessarily seated at it**; this MVP uses a simple person-center-in-region heuristic. Test with consented recordings and multiple camera angles before relying on it operationally.

### C. Use an IP / RTSP camera (local network only)

**RTSP cannot be consumed directly by HTML5 video in a standard browser.** The optional Python bridge reads the camera via OpenCV and exposes an MJPEG response. Serve the dashboard and MJPEG from the **same local origin**:

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS / Linux: source .venv/bin/activate
pip install -r bridge/requirements.txt -r bridge/requirements-camera.txt

# Linux / macOS example: set a private environment variable (do not commit credentials)
export CAMERA_SOURCE='rtsp://USER:PASSWORD@192.168.1.50:554/stream1'
python -m bridge.server
# Open http://127.0.0.1:8765
```

**Windows PowerShell**

```powershell
$env:CAMERA_SOURCE="rtsp://USER:PASSWORD@192.168.1.50:554/stream1"
python -m bridge.server
```

In the camera laboratory select **IP camera via local bridge**, enter `http://127.0.0.1:8765/stream.mjpg`, and press **Start preview**. Optionally enable browser AI and draw seating zones. Alternatively use `CAMERA_SOURCE=0` for the host's first OpenCV camera.

**Important:** The local bridge binds to `127.0.0.1` by default and does not include a hardened authentication or stream-access service. **Do not expose it to the public internet or forward port 8765.** For HTTPS-hosted pages, an insecure HTTP stream can be blocked by mixed-content and private-network access protections. The reliable configuration is to serve the dashboard and bridge on the *same* trusted local origin; a production remote deployment needs authenticated TLS reverse proxy, explicit authorization and camera access policies.

### System operation

```text
Camera / IP stream
       │
       ├── Browser USB/laptop camera → getUserMedia ─┐
       └── RTSP IP camera → loopback OpenCV bridge ───┤
                                                     ▼
                                              Browser video
                                                     │
                                               COCO-SSD AI
                                                     │
                                           Person bounding boxes
                                                     │
                                       Calibrated seating-zone ROI
                                                     │
                                        Debounced state transitions
                                                     │
                                     3D floor + alerts + event log
```

- **No video upload:** The browser AI receives frames from the local video/bridge preview.
- **No persistent session state:** Tables, zones and events reset on refresh. This is deliberate for a privacy-conscious prototype.
- **Not reservation software:** The `reserved` state is a manual visual label; there is no booking service.
- **Live accuracy needs validation:** Occlusions, lighting, overlapping regions, standing staff and unreliable connectivity can produce false transitions.

## Development

```bash
pip install -r bridge/requirements.txt -r bridge/requirements-dev.txt
python -m unittest discover -s tests -v
python -m compileall -q bridge tests
node --check docs/app.js
node --check docs/digital-twin.js
node --check docs/cinematic-floor.js
```

### Repository map

```text
├── docs/
│   ├── index.html            # Interactive client presentation
│   ├── styles.css            # Responsive 3D-inspired floor/dashboard
│   └── app.js                # Camera, AI detections, zone editor, simulation
├── assets/
│   ├── hero.svg              # Animated README identity
│   └── architecture.svg      # System diagram
├── bridge/
│   ├── server.py             # Local camera relay and web server
│   ├── requirements.txt      # FastAPI & Uvicorn
│   └── requirements-camera.txt  # Optional OpenCV
├── tests/
│   └── test_bridge.py
├── .github/workflows/ci.yml
├── ARCHITECTURE.md
├── SECURITY.md
├── ROADMAP.md
└── LICENSE
```

## Engineering principles

1. **Consent and privacy:** Get the permissions and signage required for video surveillance and analyze only approved areas. Avoid face or biometric processing.
2. **Fail safely:** If the AI model is unavailable, do not advertise the preview as live AI monitoring. Tables without a mapped seating zone are not inferred.
3. **Human-in-the-loop:** Cleaning completion needs staff confirmation. A model prediction is not an authoritative service event.
4. **Local-first pilot:** No paid services are needed for the visual demo or browser AI. Optional external model/CDN availability may affect first-time downloads.
5. **Evidence before commercial claims:** Evaluate precision, recall, transition latency, per-table error rate, and time-in-state against consented ground-truth data before selling an accuracy guarantee.

See [ROADMAP.md](ROADMAP.md) for measured next milestones.

## Ownership & license

**Copyright © 2026 Md Najmul Hossain. All rights reserved.** This repository is publicly viewable but **NOT open source**. The proprietary [LICENSE](LICENSE) restricts copying, redistribution, sublicensing, and commercial or public deployment without written authorization from the copyright owner. Third-party dependencies and model weights are governed separately by their own licenses.

---

<div align="center"><sub>Designed and owned by <b>Md Najmul Hossain</b> · TableSight — AI Restaurant Monitoring System</sub></div>
