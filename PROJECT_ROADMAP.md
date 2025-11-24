# PROJECT ROADMAP: The Grand Plan 7.0 (Native Pivot Edition)

## 🚨 PIVOT ALERT 🚨
**The Web/JS Architecture (Phases 1-9) has been DEPRECATED.**
**The project is shifting to a Native C++ Architecture.**

**IMPORTANT:** The existing `client/` and `server/` folders are **READ-ONLY References**. Do not modify them. All new work happens in `ArchNative/`.

---

## Vision Statement
To build the ultimate, high-performance, **100% offline Architectural Analysis & VR Simulation Suite**. We are moving away from browser constraints to harness the raw power of the GPU and local hardware using C++ and Qt. This tool will automatically convert 2D floor plans into 3D VR-ready environments.

**Key Strategic Directive:**
All project outputs must be saved in a **Proprietary Binary Format (`.anvr`)**. This ensures user lock-in, as project files can only be opened and edited within our software ecosystem.

---

## Feature List (The "Gold Master" Spec)

We are recreating the following features from the legacy WebApp:

1.  **Automated 2D-to-3D Conversion:**
    *   Multi-Floor Upload (Stacking logic).
    *   Auto-detection of Walls, Windows, Doors, and Stairs via Computer Vision.
    *   OCR Room Labeling (Tesseract).
    *   Procedural Roof Generation.

2.  **Immersive "Desktop VR" Interaction:**
    *   **First-Person Walk Mode:** WASD + Mouse navigation (replacing WebXR).
    *   **Orbit "God View":** Rotating around the model for inspection.
    *   **Floor Teleportation:** Instantly jumping between levels.

3.  **Advanced Analysis & Simulation (The "Brain"):**
    *   **Natural Light Analysis:** Simulating sun exposure (Raycasting).
    *   **Sun Cycle:** Animated Day/Night loop.
    *   **Circulation Analysis:** Pathfinding heatmaps & Virtual Agent simulation.
    *   **Acoustic & Biophilic Reports:** Automated design scoring.
    *   **Cost Estimator:** Real-time Bill of Materials (BOM).

4.  **Design Tools:**
    *   **Material Library:** Drag-and-drop textures.
    *   **Furniture Library:** 3D object placement.
    *   **Mood Board:** Color palette extraction from images.

---

## The Pivot: Native C++ Rewrite

### **Phase 1N: The Foundation (Setup & Core)**
*   **Status:** ✅ **DONE**
*   **Goal:** Establish the native build environment, rendering, and camera control.
*   **Tasks:**
    *   **1N.1:** Initialize `CMake` project structure (Qt6, OpenCV). ✅
    *   **1N.2:** Implement `MainWindow` with `QOpenGLWidget`. ✅
    *   **1N.3:** Implement Camera System (Orbit + FPS). ✅
    *   **1N.4:** Verify "Hello World" Rendering & Camera Movement. ✅

### **Phase 2N: The Engine (Image Analysis)**
*   **Status:** 📅 **PLANNED**
*   **Goal:** Port the Computer Vision logic to C++.
*   **Tasks:**
    *   **2N.1:** `ImageProcessor::load(path)` (OpenCV).
    *   **2N.2:** Gap Detection (Windows/Doors) & Room Detection (Flood Fill).
    *   **2N.3:** OCR Integration (Tesseract) for room labels.
    *   **2N.4:** Multi-Floor alignment logic.

### **Phase 3N: Mesh Generation & Scene**
*   **Status:** 📅 **PLANNED**
*   **Goal:** Convert 2D data into a rich 3D Scene Graph.
*   **Tasks:**
    *   **3N.1:** Generate Walls (Extrusion) & Floors (Stacking).
    *   **3N.2:** Procedural Roof Generation.
    *   **3N.3:** CSG Operations (Cutting holes for Stairs/Elevators).
    *   **3N.4:** **Implement `.anvr` File Format (Serialization).**

### **Phase 4N: The "Smart" Features**
*   **Status:** 📅 **PLANNED**
*   **Goal:** Re-implement the high-value simulation tools.
*   **Tasks:**
    *   **4N.1:** Natural Light & Sun Cycle.
    *   **4N.2:** Circulation Analysis & Virtual Agent.
    *   **4N.3:** Acoustic & Biophilic Reports.

### **Phase 5N: The Professional Tools**
*   **Status:** 📅 **PLANNED**
*   **Tasks:**
    *   **5N.1:** Cost Estimator (BOM Calculation).
    *   **5N.2:** PDF Export (Blueprints).
    *   **5N.3:** Furniture Library.
