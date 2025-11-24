# HANDOVER PROTOCOL: Operation Native Pivot

**Date:** 2025-11-20
**Status:** REFERENCE IMPLEMENTATION COMPLETE - READY FOR PORTING
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

## 3. Logic Migration Map

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

## 4. Proposed C++ Project Structure

```
ArchNative/
├── CMakeLists.txt              # Master build script
├── src/
│   ├── main.cpp                # QApplication entry point
│   ├── Core/
│   │   ├── Project.h           # Data model (Walls, Floors)
│   │   ├── ImageProcessor.h    # OpenCV wrapper
│   │   └── MeshGenerator.h     # VBO generator
│   ├── UI/
│   │   ├── MainWindow.h        # Main Window (Qt Designer or C++)
│   │   ├── ViewportWidget.h    # QOpenGLWidget subclass
│   │   └── PropertiesDock.h    # QDockWidget for Inspector
│   └── Analysis/
│       └── CostEstimator.h     # Pricing logic
├── assets/
│   └── shaders/                # GLSL shaders
└── tests/                      # GoogleTest
```

## 5. CMakeLists.txt Template

```cmake
cmake_minimum_required(VERSION 3.16)
project(ArchNative VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

find_package(Qt6 REQUIRED COMPONENTS Widgets OpenGLWidgets)
find_package(OpenCV REQUIRED)
find_package(Tesseract REQUIRED)

add_executable(ArchNative
    src/main.cpp
    src/Core/ImageProcessor.cpp
    src/UI/MainWindow.cpp
    # ... add other sources
)

target_link_libraries(ArchNative PRIVATE
    Qt6::Widgets
    Qt6::OpenGLWidgets
    ${OpenCV_LIBS}
    libtesseract
)
```

## 6. Immediate Next Steps

1.  **Initialize Repo:** Create the folder structure above.
2.  **Hello World:** Render a simple window with `Qt6`.
3.  **Port Phase 1 (Image Loading):** Implement `ImageProcessor::load()` using `cv::imread` and display it in a `QLabel`.
