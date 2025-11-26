# HANDOVER PROTOCOL: Operation Native Pivot

**Date:** 2025-11-20
**Status:** IN PROGRESS (Phase 5N Active)
**From:** Jules (Web Architect)
**To:** Native Systems Engineer

## ⚠️ CRITICAL WARNING: FILE SAFETY ⚠️
*   **WORKING DIRECTORY:** You must ONLY work inside the `ArchNative/` directory.
*   **DO NOT TOUCH:** The `client/` and `server/` directories are the **Gold Master Reference**. They contain the legacy WebApp code which must remain **pristine** and **unmodified**.
*   **DO NOT DELETE:** Never delete the legacy code. We need it to reverse-engineer the simulation logic.

## 1. Executive Summary
The project stakeholders have mandated a complete architectural pivot. The existing Web Stack (React/Node.js/Three.js) is to be **abandoned** in favor of a high-performance, 100% offline, **Native C++ Application**.

**Core Directive:** "Turn 2D Floorplans into 3D VR/AR Experiences (Native Desktop)."

**Strategic Requirements:**
1.  **Universal AR:** Support **Any AR Glasses** via **OpenXR**.
2.  **Proprietary Format:** All project files must be saved as **`.anvr`** to ensure lock-in.
3.  **Android Companion:** Future standalone Android app for mobile AR glasses.
4.  **Apple-like GUI:** The interface must be modern, minimalist, and beautiful.

## 2. Work Completed
The following files have been created/modified in this session. **All work is contained in `ArchNative/`.**

*   **Build System:**
    *   `ArchNative/CMakeLists.txt`: Configured for Qt6, OpenCV, Tesseract, and Asset Copying.
*   **Core Logic:**
    *   `ArchNative/src/main.cpp`: Entry point. Sets OpenGL Compatibility Profile. Handles CLI args. Loads QSS.
    *   `ArchNative/src/Core/Camera.h` & `.cpp`: Implements **Orbit** (CAD) and **First-Person** (VR) camera modes.
    *   `ArchNative/src/Core/ImageProcessor.h` & `.cpp`: Implements `extractWallsFromBitmap` (HoughLines), OCR (Tesseract), and **Gap Detection** (Windows).
    *   `ArchNative/src/Core/Project.h` & `.cpp`: Manages multi-floor projects.
    *   `ArchNative/src/Core/Floor.h`: Data model for a single floor level (Walls, Rooms, Windows, Doors).
    *   `ArchNative/src/Core/MeshGenerator.h` & `.cpp`: Converts Project data to 3D Mesh geometry.
    *   `ArchNative/src/Core/Serializer.h` & `.cpp`: Saves/Loads `.anvr` proprietary binary files.
    *   `ArchNative/src/Core/Sun.h` & `.cpp`: Simulates Sun position.
    *   `ArchNative/src/Core/VirtualAgent.h` & `.cpp`: AI Agent for circulation simulation.
*   **Analysis Modules:**
    *   `ArchNative/src/Analysis/LightAnalyzer.h` & `.cpp`: 2D Raycasting for light heatmaps.
    *   `ArchNative/src/Analysis/PathFinder.h` & `.cpp`: A* Pathfinding algorithm.
    *   `ArchNative/src/Analysis/AcousticAnalyzer.h` & `.cpp`: Acoustic scoring logic.
    *   `ArchNative/src/Analysis/BiophilicAnalyzer.h` & `.cpp`: Window-to-Wall ratio analysis.
    *   `ArchNative/src/Analysis/CostEstimator.h` & `.cpp`: BOM Calculator (Walls/Windows/Doors).
    *   `ArchNative/src/Analysis/BlueprintGenerator.h` & `.cpp`: **(NEW)** PDF Export logic.
*   **User Interface:**
    *   `ArchNative/src/UI/MainWindow.h` & `.cpp`: Main application window with Toolbar and Apple-like styling.
    *   `ArchNative/src/UI/ViewportWidget.h` & `.cpp`: The 3D OpenGL drawing surface. Handles Mouse/Keyboard/Mesh rendering.
    *   `ArchNative/assets/styles/macos.qss`: The Stylesheet defining the "Apple-like" look.

## 3. The New Architecture (C++ Stack)

| Component | Old Stack (JS) | New Stack (C++) | Rationale |
| :--- | :--- | :--- | :--- |
| **Application Shell** | Electron / Browser | **Qt 6 (Widgets)** | Native OS integration, zero-latency GUI. |
| **Rendering Engine** | Three.js (WebGL) | **OpenGL (via QOpenGLWidget)** | Direct GPU access. |
| **AR/VR** | WebXR | **OpenXR (Desktop & Mobile)** | Hardware-agnostic AR/VR support. |
| **Interaction** | OrbitControls | **Custom Camera (Orbit + FPS)** | "Desktop VR" experience without browser limits. |
| **Image Processing** | node-canvas | **OpenCV (C++)** | 50x faster, robust computer vision tools. |
| **OCR** | Tesseract.js | **Tesseract API (libtesseract)** | Native linking. |
| **Analysis Logic** | JS Utils (Light, Sound) | **C++ Simulation Engines** | High-performance raycasting/pathfinding. |
| **File Format** | JSON / GLTF | **Binary Serialization (`.anvr`)** | Proprietary format. Must be binary compatible with ARM64 (Android). |

## 4. Build & Verification
We use **CMake** for building.

### Headless Verification
A script `verify_headless.sh` is provided in the root. It compiles the `ArchNative` project and runs:
1.  `./ArchNative --test-screenshot`: Verifies the OpenGL context works (draws a grid).
2.  `./ArchNative --test-camera`: Verifies the Camera rotation logic.
3.  `./ArchNative --test-project`: Verifies Multi-Floor, Mesh Gen, Serialization, Light Analysis, Pathfinding, Reports, Cost Estimation, and **PDF Export**.

**Artifacts:** `test_output.png`, `test_cam_*.png`, `test_floor_*.png`, `test_project.anvr`, `test_blueprint.pdf`.
**Note:** These artifacts are intentionally committed to the repo per user request.

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

### C. Scene & Interaction (Phase 3N/4N/6N)
*   **Source:** `client/src/components/VRScene.js`
*   **Target:** `src/visual/SceneManager.cpp`
*   **Key Logic:** Staircase/Elevator holes, Sun Cycle, Teleportation.
*   **New Logic:** **OpenXR Integration** for AR Glasses support.

### D. Simulation & Analysis (Phase 4N - "The Brain")
*   **Source:** `client/src/analysis/*.js` & `client/src/components/*.js`
*   **Target:** `src/analysis/`
*   **Key Logic:** Natural Light (Raycasting), Circulation (Pathfinding), Acoustic/Biophilic Reports.

## 6. Immediate Next Steps
1.  **Phase 6N Start:** Implement `OpenXRManager` skeleton.
2.  **Phase 7N:** Android porting investigation.
