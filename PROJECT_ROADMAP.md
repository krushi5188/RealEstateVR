# PROJECT ROADMAP: The Grand Plan 7.0 (Native Pivot Edition)

## 🚨 PIVOT ALERT 🚨
**The Web/JS Architecture (Phases 1-9) has been DEPRECATED.**
**The project is shifting to a Native C++ Architecture.**

**IMPORTANT:** The existing `client/` and `server/` folders are **READ-ONLY References**. Do not modify them. All new work happens in `ArchNative/`.

---

## Vision Statement
To build the ultimate, high-performance, **100% offline Architectural Analysis & VR/AR Simulation Suite**. We are moving away from browser constraints to harness the raw power of the GPU and local hardware using C++ and Qt. This tool will automatically convert 2D floor plans into 3D environments ready for **any AR Glasses**.

**Key Strategic Directive:**
1.  **Universal AR Support:** The software must work with **ANY AR Glasses** (Meta, Vive, XREAL, HoloLens) via **OpenXR**. This is the most critical feature.
2.  **Proprietary Lock-in:** All project outputs must be saved in a **Proprietary Binary Format (`.anvr`)**.
3.  **Future Mobile Expansion:** A standalone **Android AR Companion App** will be built to view `.anvr` files offline on mobile AR glasses (without a PC).

---

## Feature List (The "Gold Master" Spec)

We are recreating the following features from the legacy WebApp:

1.  **Automated 2D-to-3D Conversion:**
    *   Multi-Floor Upload (Stacking logic).
    *   Auto-detection of Walls, Windows, Doors, and Stairs via Computer Vision.
    *   OCR Room Labeling (Tesseract).
    *   Procedural Roof Generation.

2.  **Immersive Interaction (Desktop & AR):**
    *   **Universal AR Mode:** Hardware-agnostic support for AR Glasses via OpenXR.
    *   **First-Person Walk Mode:** WASD + Mouse navigation (Desktop fallback).
    *   **Orbit "God View":** Rotating around the model for inspection.

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
    *   **1N.2:** Implement `MainWindow` with `QOpenGLWidget` & "Apple-like" Styling. ✅
    *   **1N.3:** Implement Camera System (Orbit + FPS). ✅
    *   **1N.4:** Verify "Hello World" Rendering & Camera Movement. ✅

### **Phase 2N: The Engine (Image Analysis)**
*   **Status:** ✅ **DONE**
*   **Goal:** Port the Computer Vision logic to C++.
*   **Tasks:**
    *   **2N.1:** `ImageProcessor` Skeleton & Loading Logic. ✅ **DONE**
    *   **2N.2:** Gap Detection (Windows/Doors) & Room Detection (Flood Fill). ✅ **DONE**
    *   **2N.3:** OCR Integration (Tesseract) for room labels. ✅ **DONE**
    *   **2N.4:** Multi-Floor alignment logic (Project/Floor Models). ✅ **DONE**

### **Phase 3N: Mesh Generation & Scene**
*   **Status:** ✅ **DONE**
*   **Goal:** Convert 2D data into a rich 3D Scene Graph.
*   **Tasks:**
    *   **3N.1:** Generate Walls (Extrusion) & Floors (Stacking). ✅ **DONE**
    *   **3N.2:** Procedural Roof Generation. 📅 **PLANNED**
    *   **3N.3:** CSG Operations (Cutting holes for Windows/Doors). ✅ **DONE**
    *   **3N.4:** **Implement `.anvr` File Format (Serialization).** ✅ **DONE**

### **Phase 4N: The "Smart" Features**
*   **Status:** ✅ **DONE**
*   **Goal:** Re-implement the high-value simulation tools.
*   **Tasks:**
    *   **4N.1:** Natural Light & Sun Cycle (Raycasting). ✅ **DONE**
    *   **4N.2:** Circulation Analysis (A*) & Virtual Agent. ✅ **DONE**
    *   **4N.3:** Acoustic & Biophilic Reports (Window/Area Ratios). ✅ **DONE**

### **Phase 5N: The Professional Tools**
*   **Status:** 🚧 **IN PROGRESS**
*   **Tasks:**
    *   **5N.1:** Cost Estimator (BOM Calculation). ✅ **DONE**
    *   **5N.2:** PDF Export (Blueprints). ✅ **DONE**
    *   **5N.3:** Furniture Library.

### **Phase 6N: OpenXR Integration (Universal AR)**
*   **Status:** 🚧 **IN PROGRESS**
*   **Goal:** Enable hardware-agnostic AR support.
*   **Tasks:**
    *   **6N.1:** Integrate `libopenxr` into CMake. ✅ **DONE**
    *   **6N.2:** Implement `OpenXRManager` to handle HMD connection. ✅ **DONE** (Skeleton)
    *   **6N.3:** Render Stereo Views (Left/Right Eye) from `ViewportWidget`. 📅 **PLANNED**
    *   **6N.4:** Map OpenXR Controller inputs to Scene Interaction.

### **Phase 7N: Android AR Companion App (Mobile)**
*   **Status:** 📅 **PLANNED**
*   **Goal:** Standalone viewer for `.anvr` files on Android AR Glasses.
*   **Tech:** Qt for Android / OpenXR Mobile Loader (Snapdragon Spaces).
*   **Tasks:**
    *   **7N.1:** Port `ArchNative` Core to Android (ARM64).
    *   **7N.2:** Implement Touch/Gaze input system.
    *   **7N.3:** Optimize rendering for mobile GPUs (Vulkan).
