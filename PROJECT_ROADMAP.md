# PROJECT ROADMAP: Grand Plan 8.0 (The Return to Web)

## 🔄 STRATEGIC PIVOT
**The Native C++ Architecture (Phases 1N-7N) has been CANCELLED.**
**We are returning to the original WebApp Architecture (React + Node.js).**

The `ArchNative/` directory and associated native build tools have been removed.
The project is now a pure Web Application again, located in `client/` and `server/`.

---

## Vision Statement
To build a accessible, browser-based **Architectural Analysis & VR/AR Simulation Suite**.
We are leveraging modern Web Standards (WebXR, WebGL, React Three Fiber) to deliver floor plan conversion and VR experiences directly in the browser, with no installation required.

---

## Architecture

*   **Frontend:** React, React Three Fiber (R3F), WebXR.
*   **Backend:** Node.js, Express.
*   **Computer Vision:** Tesseract.js, OpenCV.js (or server-side processing).

---

## Immediate Goals (Restoration)

1.  **Stabilize WebApp:** Ensure the React Client and Node Server are fully functional.
2.  **Clean Slate:** Verify all native C++ artifacts are removed. (✅ DONE)
3.  **Feature Parity:** Continue developing features in the WebApp context.

## Feature Roadmap (Web)

### Phase 1: Core Experience (Restored)
*   [ ] Multi-Floor Management.
*   [ ] 2D-to-3D Conversion (Web-based).
*   [ ] VR/AR Mode via WebXR.

### Phase 2: Advanced Analysis
*   [ ] Sun/Light Analysis (Browser-based raycasting).
*   [ ] Pathfinding/Circulation.

### Phase 3: Mobile Companion
*   [ ] Optimize WebXR for Mobile Browsers (Android/iOS).
