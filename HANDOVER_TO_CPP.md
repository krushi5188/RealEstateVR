# HANDOVER PROTOCOL: Operation Native Pivot

**Date:** 2025-11-20
**Status:** REFERENCE IMPLEMENTATION COMPLETE - READY FOR PORTING
**From:** Jules (Web Architect)
**To:** Native Systems Engineer

## 1. Executive Summary
The project stakeholders have mandated a complete architectural pivot. The existing Web Stack (React/Node.js/Three.js) is to be **abandoned** in favor of a high-performance, 100% offline, **Native C++ Application**.

**Core Directive:** "Turn 2D Floorplans into 3D VR/Interactive Experiences (Native Desktop)."

**Strategic Requirement:** All project files must be saved in a **Proprietary Binary Format (`.anvr`)** to ensure ecosystem lock-in.

The current JS codebase (`client/`, `server/`) is the **Gold Master Reference**.

## 2. The New Architecture (C++ Stack)

You are building a desktop application for Windows and macOS.

| Component | Old Stack (JS) | New Stack (C++) | Rationale |
| :--- | :--- | :--- | :--- |
| **Application Shell** | Electron / Browser | **Qt 6 (Widgets)** | Native OS integration, zero-latency GUI. |
| **Rendering Engine** | Three.js (WebGL) | **OpenGL (via QOpenGLWidget)** | Direct GPU access. |
| **Interaction** | WebXR / OrbitControls | **Custom Camera (Orbit + FPS)** | "Desktop VR" experience without browser limits. |
| **Image Processing** | node-canvas | **OpenCV (C++)** | 50x faster, robust computer vision tools. |
| **OCR** | Tesseract.js | **Tesseract API (libtesseract)** | Native linking. |
| **Analysis Logic** | JS Utils (Light, Sound) | **C++ Simulation Engines** | High-performance raycasting/pathfinding. |
| **File Format** | JSON / GLTF | **Binary Serialization (`.anvr`)** | Proprietary format for IP protection. |

## 3. Build & Verification
We use **CMake** for building. The project is located in `ArchNative/`.

### macOS Compatibility
*   `CMakeLists.txt` includes `MACOSX_BUNDLE`.
*   `main.cpp` requests `QSurfaceFormat::CompatibilityProfile` (v2.1).

### Headless Verification
*   `./verify_headless.sh` runs:
    *   Standard Render Test (`--test-screenshot`)
    *   Camera Rotation Test (`--test-camera`)

## 4. Current C++ Project Structure (Phase 1N)

```
ArchNative/
├── CMakeLists.txt              # Master build script
├── src/
│   ├── main.cpp                # Entry point (Test mode logic)
│   ├── Core/
│   │   ├── Project.h           # Data Model
│   │   └── Camera.h/cpp        # Orbit & FPS Camera Logic
│   ├── UI/
│   │   ├── MainWindow.h/cpp    # Main GUI
│   │   └── ViewportWidget.h/cpp # OpenGL Renderer + Input Handling
```

## 5. Logic Migration Map (Future Phases)

You must port the logic from the current JS files to C++ classes.

### A. Image Processor (Phase 2N)
*   **Source:** `server/image-processor.js`
*   **Target:** `src/core/ImageProcessor.cpp`
*   **Key Logic:** `extractWallsFromBitmap`, `labelRoomsWithOCR`.

### B. Mesh Generation & Serialization (Phase 3N)
*   **Source:** `server/model-generator.js`
*   **Target:** `src/core/MeshGenerator.cpp`
*   **Key Logic:** Wall extrusion, Multi-floor stacking, `OpenCSG`.
*   **Serialization:** Implement `Project::saveToANVR(filename)` and `Project::loadFromANVR(filename)`.

### C. Scene & Interaction (Phase 3N/4N)
*   **Source:** `client/src/components/VRScene.js`
*   **Target:** `src/visual/SceneManager.cpp`
*   **Key Logic:** Staircase/Elevator holes, Sun Cycle, Teleportation.

### D. Simulation & Analysis (Phase 4N - "The Brain")
*   **Source:** `client/src/analysis/*.js` & `client/src/components/*.js`
*   **Target:** `src/analysis/`
*   **Key Logic:** Natural Light (Raycasting), Circulation (Pathfinding), Acoustic/Biophilic Reports.

## 6. Immediate Next Steps
1.  **Phase 2N Start:** Begin implementing `ImageProcessor` to load PNGs using OpenCV.
