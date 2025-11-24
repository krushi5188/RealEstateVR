# PROJECT ROADMAP: The Grand Plan 7.0 (Native Pivot Edition)

## 🚨 PIVOT ALERT 🚨
**The Web/JS Architecture (Phases 1-9) has been DEPRECATED.**
**The project is shifting to a Native C++ Architecture.**

---

## Vision Statement
To build the ultimate, high-performance, 100% offline architectural design tool. We are moving away from browser constraints to harness the raw power of the GPU and local hardware using C++ and Qt. This tool will rival industry standards like AutoCAD in performance and reliability.

---

## The Pivot: Native C++ Rewrite

### **Phase 1N: The Foundation (Setup & Core)**
*   **Status:** 🚧 **IN PROGRESS**
*   **Goal:** Establish the native build environment and rendering capability.
*   **Complexity:** Medium
*   **Tasks:**
    *   **1N.1:** Initialize `CMake` project structure with `Qt6` and `OpenCV` dependencies. ✅ **DONE**
    *   **1N.2:** Implement `MainWindow` with a central `QOpenGLWidget`. ✅ **DONE**
    *   **1N.3:** Create a Basic Camera controller (Orbit/Pan/Zoom) for the OpenGL viewport. 🔄 **PENDING**
    *   **1N.4:** Verify "Hello World" Rendering (RGB Triangle). ✅ **DONE**
    *   **Acceptance Criteria:** Application compiles, runs, and shows a 3D grid that can be rotated.

### **Phase 2N: The Engine (Image Analysis)**
*   **Status:** 📅 **PLANNED**
*   **Goal:** Port the Image Processor logic to C++.
*   **Complexity:** High
*   **Tasks:**
    *   **2N.1:** Implement `ImageProcessor::load(path)`.
    *   **2N.2:** Port "Gap Detection" (Windows/Doors) using `cv::inRange` and `cv::findContours`.
    *   **2N.3:** Port "Room Detection" using `cv::floodFill`.
    *   **2N.4:** Integrate Tesseract C++ API for room label OCR.
    *   **Acceptance Criteria:** Loading a PNG floor plan outputs a `std::vector<Wall>` and `std::vector<Room>` with accurate coordinates.

### **Phase 3N: Mesh Generation (The Builder)**
*   **Status:** 📅 **PLANNED**
*   **Goal:** Convert 2D data into 3D Geometry (VBOs).
*   **Complexity:** High
*   **Tasks:**
    *   **3N.1:** Implement `MeshGenerator::generateWalls(std::vector<Wall>)`.
    *   **3N.2:** Implement Multi-Floor Stacking (Y-Offset logic).
    *   **3N.3:** Implement Roof Generation (Procedural Geometry).
    *   **3N.4:** Implement CSG (Constructive Solid Geometry) to cut holes for Stairs/Elevators using `OpenCSG` or `CGAL`.
    *   **Acceptance Criteria:** The 3D Viewport renders the full building structure with correct holes and roof.

### **Phase 4N: The Professional Tools**
*   **Status:** 📅 **PLANNED**
*   **Goal:** Re-implement high-value analysis features.
*   **Complexity:** Medium
*   **Tasks:**
    *   **4N.1:** Port `CostEstimator` logic (Materials, BOM Calculation).
    *   **4N.2:** Implement "Plan View" (2D rendering using `QPainter`).
    *   **4N.3:** Implement PDF Export (Using `QPdfWriter`).
    *   **Acceptance Criteria:** User can view a cost breakdown and export a PDF blueprint.

---

## 🪦 Deprecated Web Roadmap (Archived)

*The following features were implemented in the Web Prototype but are now obsolete until ported.*

### ~~Phases 6-9 (Web Features)~~
*   ~~Multi-Floor Support (Web)~~ -> **Archive**
*   ~~AR Overlay (WebXR)~~ -> **Scrapped** (Not supported on Desktop)
*   ~~Environment Controls (Three.js)~~ -> **Archive**
*   ~~PDF Export (jspdf)~~ -> **Archive** (Will use Qt Printer API)
