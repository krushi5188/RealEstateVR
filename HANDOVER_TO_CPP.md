# HANDOVER PROTOCOL: Operation Native Pivot

**Date:** 2025-11-20
**Status:** IN PROGRESS (Phase 1N)
**From:** Jules (Web Architect)
**To:** Native Systems Engineer

## 1. Executive Summary
The project stakeholders have mandated a complete architectural pivot. The existing Web Stack (React/Node.js/Three.js) is to be **abandoned** in favor of a high-performance, 100% offline, **Native C++ Application**.

**Core Directive:** "I need nothing web based. Not even frontend."

The current JS codebase has been finalized to serve as a "Gold Master" reference implementation. All logic described below exists and is functional in the JS prototype.

## 2. The New Architecture (C++ Stack)

You are building a desktop application for Windows and macOS.

| Component | Old Stack (JS) | New Stack (C++) | Rationale |
| :--- | :--- | :--- | :--- |
| **Application Shell** | Electron / Browser | **Qt 6 (Widgets)** | Native OS integration, zero-latency GUI. |
| **Rendering Engine** | Three.js (WebGL) | **OpenGL (via QOpenGLWidget)** | Direct GPU access, industry standard. |
| **Image Processing** | node-canvas | **OpenCV (C++)** | 50x faster, robust computer vision tools. |
| **OCR** | Tesseract.js | **Tesseract API (libtesseract)** | Native linking, no WASM overhead. |
| **Geometry Math** | Three.js Math | **GLM (OpenGL Mathematics)** | Standard C++ graphics math library. |
| **Geometry Logic** | three-csg-ts | **OpenCSG / CGAL** | Professional-grade mesh boolean ops. |
| **Build System** | npm / Webpack | **CMake** | Cross-platform native build management. |

## 3. Build & Verification
We use **CMake** for building. The project is located in `ArchNative/`.

### macOS Compatibility
*   The `CMakeLists.txt` includes `MACOSX_BUNDLE` property to ensure correct `.app` bundle generation.
*   The application explicitly requests an OpenGL `CompatibilityProfile` (v2.1) to support legacy drawing commands on macOS.

### Headless Verification (Linux/CI)
*   A script `verify_headless.sh` is provided.
*   It uses `xvfb` to simulate a display.
*   It runs `ArchNative --test-screenshot` which renders one frame and exits, saving `test_output.png`.

## 4. Current C++ Project Structure (Phase 1N)

```
ArchNative/
├── CMakeLists.txt              # Master build script (Configured for C++20, Qt6, OpenCV, macOS Bundle)
├── src/
│   ├── main.cpp                # QApplication entry point & CLI parsing
│   ├── Core/
│   │   ├── Project.h           # Data model (Walls, Floors)
│   │   ├── ImageProcessor.h    # OpenCV wrapper
│   │   └── MeshGenerator.h     # VBO generator
│   ├── UI/
│   │   ├── MainWindow.h/cpp    # Main Window (Screenshot logic included)
│   │   ├── ViewportWidget.h/cpp # QOpenGLWidget subclass (Renders RGB Triangle)
│   │   └── PropertiesDock.h    # QDockWidget for Inspector
│   └── Analysis/
│       └── CostEstimator.h     # Pricing logic
├── assets/
│   └── shaders/                # GLSL shaders
└── tests/                      # GoogleTest
```

## 5. Logic Migration Map (Future Phases)

You must port the logic from the current JS files to C++ classes.

### A. Image Processor (The "Eye")
*   **Source:** `server/image-processor.js`
*   **Target:** `src/core/ImageProcessor.cpp`
*   **Key Algorithms:**
    *   **`extractWallsFromBitmap`:**
        *   *Input:* Image File Path.
        *   *Logic:*
            1.  Load image via `cv::imread`.
            2.  Thresholding: `cv::inRange` to find black pixels (walls).
            3.  Line Detection: `cv::HoughLinesP` or custom scanline iterator (as implemented in JS) to find wall segments.
            4.  Room Detection: `cv::connectedComponents` or flood fill to find enclosed white spaces.
    *   **`detectNorthArrow`:**
        *   *Logic:* OCR scan for 'N' character. ROI analysis around 'N' to find triangle shape.
    *   **`labelRoomsWithOCR`:**
        *   *Logic:* `tesseract::TessBaseAPI` on room ROIs.
        *   *Scale Calibration:* Parse regex `(\d+)x(\d+)` from label. `scale = (pixel_width / real_width + pixel_height / real_height) / 2`.

### B. Mesh Generation (The "Builder")
*   **Source:** `server/model-generator.js`
*   **Target:** `src/core/MeshGenerator.cpp`
*   **Key Algorithms:**
    *   **`generateModel`:**
        *   *Input:* Vector of `Floor` objects (containing walls, rooms).
        *   *Logic:* Iterate walls. For each wall, generate 8 vertices (cuboid). Push to `std::vector<float> vertices` and `std::vector<unsigned int> indices`.
        *   *Stacking:* Apply `yOffset = floorIndex * (WALL_HEIGHT + slab_thickness)` to vertices.

### C. Scene Logic & CSG (The "Visualizer")
*   **Source:** `client/src/components/VRScene.js`
*   **Target:** `src/visual/SceneManager.cpp`
*   **Key Algorithms:**
    *   **Auto-Placement:**
        *   Iterate `wallData.rooms`.
        *   If `type == 'staircase'`, instantiate `StaircaseMesh`.
        *   If `type == 'elevator'`, instantiate `ElevatorMesh`.
    *   **Boolean Operations (CSG):**
        *   *Logic:* `FloorMesh - StaircaseHoleMesh - ElevatorShaftMesh`.
        *   *Lib:* Use `OpenCSG` or `CGAL` to subtract the hole geometry from the floor slab.

### D. Simulation & Analysis (The "Brain")
*   **Source:** `client/src/utils/cost-estimator.js`
*   **Target:** `src/analysis/CostEstimator.cpp`
*   **Key Algorithms:**
    *   **`calculateProjectCost`:**
        *   `WallCost = Sum(WallLength) * Height * PricePerSqFt`
        *   `StructureCost = (NumStairs * UnitCost) + (NumElevators * UnitCost)`
        *   `FixtureCost = (NumWindows * UnitCost) + (NumDoors * UnitCost)`

## 6. Immediate Next Steps for Next Developer
1.  **Phase 1N Completion:** Implement the Camera Controller (Orbit/Pan/Zoom) in `ViewportWidget`.
2.  **Phase 2N Start:** Begin implementing `ImageProcessor` to load PNGs using OpenCV.
