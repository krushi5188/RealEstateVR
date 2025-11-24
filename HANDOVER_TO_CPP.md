# HANDOVER PROTOCOL: Operation Native Pivot

**Date:** 2025-11-20
**Status:** REFERENCE IMPLEMENTATION COMPLETE - READY FOR PORTING
**From:** Jules (Web Architect)
**To:** Native Systems Engineer

## ⚠️ CRITICAL WARNING: FILE SAFETY ⚠️
*   **WORKING DIRECTORY:** You must ONLY work inside the `ArchNative/` directory.
*   **DO NOT TOUCH:** The `client/` and `server/` directories are the **Gold Master Reference**. They contain the legacy WebApp code which must remain **pristine** and **unmodified**.
*   **DO NOT DELETE:** Never delete the legacy code. We need it to reverse-engineer the simulation logic.

## 1. Executive Summary
The project stakeholders have mandated a complete architectural pivot. The existing Web Stack (React/Node.js/Three.js) is to be **abandoned** in favor of a high-performance, 100% offline, **Native C++ Application**.

**Core Directive:** "Turn 2D Floorplans into 3D VR/Interactive Experiences (Native Desktop)."

**Strategic Requirement:** All project files must be saved in a **Proprietary Binary Format (`.anvr`)** to ensure ecosystem lock-in.

## 2. Work Completed (Phase 1N)
The following files have been created/modified in this session. **All work is contained in `ArchNative/`.**

*   **Build System:**
    *   `ArchNative/CMakeLists.txt`: Configured for Qt6, OpenCV, Tesseract, and macOS Bundle support.
*   **Core Logic:**
    *   `ArchNative/src/main.cpp`: Entry point. Sets OpenGL Compatibility Profile. Handles CLI args.
    *   `ArchNative/src/Core/Camera.h` & `.cpp`: Implements **Orbit** (CAD) and **First-Person** (VR) camera modes.
*   **User Interface:**
    *   `ArchNative/src/UI/MainWindow.h` & `.cpp`: Main application window. Handles screenshot verification logic.
    *   `ArchNative/src/UI/ViewportWidget.h` & `.cpp`: The 3D OpenGL drawing surface. Handles Mouse/Keyboard input.

## 3. The New Architecture (C++ Stack)

| Component | Old Stack (JS) | New Stack (C++) | Rationale |
| :--- | :--- | :--- | :--- |
| **Application Shell** | Electron / Browser | **Qt 6 (Widgets)** | Native OS integration, zero-latency GUI. |
| **Rendering Engine** | Three.js (WebGL) | **OpenGL (via QOpenGLWidget)** | Direct GPU access. |
| **Interaction** | WebXR / OrbitControls | **Custom Camera (Orbit + FPS)** | "Desktop VR" experience without browser limits. |
| **Image Processing** | node-canvas | **OpenCV (C++)** | 50x faster, robust computer vision tools. |
| **OCR** | Tesseract.js | **Tesseract API (libtesseract)** | Native linking. |
| **Analysis Logic** | JS Utils (Light, Sound) | **C++ Simulation Engines** | High-performance raycasting/pathfinding. |
| **File Format** | JSON / GLTF | **Binary Serialization (`.anvr`)** | Proprietary format for IP protection. |

## 4. Build & Verification
We use **CMake** for building.

### Headless Verification
A script `verify_headless.sh` is provided in the root. It compiles the `ArchNative` project and runs:
1.  `./ArchNative --test-screenshot`: Verifies the OpenGL context works (draws a grid).
2.  `./ArchNative --test-camera`: Verifies the Camera rotation logic.

**Artifacts:** `test_output.png`, `test_cam_1.png`, `test_cam_2.png` are generated to visually confirm the state.

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
