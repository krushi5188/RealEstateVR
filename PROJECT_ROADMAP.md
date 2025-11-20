# PROJECT ROADMAP: The Grand Plan 6.0 (Architectural Blueprint Edition)

## Vision Statement
To create the world's most powerful, insightful, and creatively empowering platform for transforming 2D floor plans into immersive, interactive, and intelligent VR experiences. Our strategy is to win by focusing on brilliant, non-AI engineering, sophisticated procedural systems, and a deep, empathetic understanding of the user's design journey. This document is a living blueprint, updated continuously to reflect our progress and challenges.

---

## **`[Meta-Note]`**
*This document has been updated to reflect the true, evidence-based status of each feature as of the latest codebase analysis. The statuses now accurately represent what is fully functional, what is partially implemented, and what remains a placeholder.*

---
## Technical Decisions & Justifications

*   **`node-canvas` for Image Processing:**
    *   **Decision:** We will use `node-canvas` for all server-side bitmap image analysis.
    *   **Justification:** The previously used `jimp` library was identified as the root cause of a persistent, critical server crash. After extensive debugging, it was clear `jimp` was unstable in our environment. We have migrated to `node-canvas`. Although it introduces native C++ dependencies (requiring a more complex build environment), its stability, performance, and power make it the correct choice for a reliable core pipeline. The trade-off in setup complexity is acceptable for a functioning and stable application.

---
## Detailed Implementation Logs

### **Core Pipeline: 2D to 3D Conversion**
*   **Status:** ✅ **Fully Functional**
*   **Evidence:** The end-to-end pipeline from image upload (`App.js`), through server-side processing (`image-processor.js`), to 3D model generation (`model-generator.js`) and rendering (`VRScene.js`) is complete and operates on user-provided data.

### **Phase 3A: The Sun & Shadow Simulation**
*   **Status:** ✅ **Fully Functional**
*   **Evidence:** The `Sun` component within `VRScene.js` correctly implements a dynamic directional light that animates on a timer, casting realistic shadows. This is a purely client-side feature.

### **Phase 3B: Foundational Material Library**
*   **Status:** ✅ **Fully Functional**
*   **Evidence:** The `MaterialLibrary.js` component allows users to select materials, and the `Model` component in `VRScene.js` correctly applies these materials to the 3D mesh. This is a purely client-side feature.

---
## The Roadmap: Future Phases Detailed Blueprint

### **Part 3: The Intelligence Layer**

#### **Phase 4A: Architectural Pattern Analysis**
*   **Goal:** To provide users with expert, automated feedback based on established architectural principles and best practices, acting as a virtual design consultant.
*
    *   **Circulation Path Analysis:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** The server now saves the 2D `wallData` to the model's JSON file. The `/analyze-circulation` endpoint has been updated to load this real data and pass it to the A* pathfinding algorithm, replacing the previous hardcoded dummy data. The feature is functional end-to-end.
    *   **Natural Light Analysis:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** The client-side `light-analyzer.js` module now uses the real `wallData` (fetched from the server when a model is loaded) to identify window locations. It performs a geometric calculation to produce a natural light score, replacing the previous static placeholder.
    *   **Ergonomics & Accessibility Audit:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** The `accessibility-auditor.js` module on the server now contains a rule-based engine that programmatically identifies and measures doorway widths from the real `wallData`. The `/audit-accessibility` endpoint is now connected to this real data, replacing the previous static placeholder report.

#### **Phase 4B: Human Factors & Usability Simulation**
*   **Goal:** To simulate the human *experience* of the design, helping users understand how the space will function in practice.
*
    *   **Furniture Placement & Layout Assistant:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** The `FurniturePlacer` component provides real-time, client-side placement with collision detection. The "Layout Assistant" is also now functional: the `layout-generator.js` module on the server uses a rule-based algorithm to generate multiple valid layouts, which are presented to the user on the client. This completes Phase 4B.
    *   **"Day in the Life" Simulation:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** The client now sends the real `wallData` to the server's `/find-path` endpoint. The server uses its A* pathfinding algorithm to generate a valid path between two points (e.g., the centers of the first two rooms). This path is then used to drive the `VirtualAgent` animation. The feature is functional end-to-end.

#### **Phase 4C: Design Philosophy Analysis (Vastu Shastra & Feng Shui)**
*   **Status:** ✅ **Fully Functional**
*   **Goal:** To provide automated analysis based on ancient and modern design philosophies, transforming the platform into a virtual design consultant.
*   **Evidence:** The `image-processor.js` module now uses OCR (`tesseract.js`) to automatically extract room labels from the floor plan. It also performs a "best-effort" computer vision analysis to detect the North arrow. The client UI (`DesignPhilosophyInput.js`) uses this automated data and provides a manual override for the North direction, ensuring the backend always receives complete and accurate data for its analysis.

#### **Phase 4D: Wellness & Biophilic Design Analysis**
*   **Status:** ✅ **Fully Functional**
*   **Goal:** To computationally score a design's positive impact on human well-being by analyzing its connection to nature.
*   **Evidence:** The `biophilic-analyzer.js` module on the server now uses a ray-triangle intersection algorithm to calculate a "View Quality Score" by casting rays from the center of each room to the windows. It combines this with a simplified "Natural Light Score" to produce an overall Biophilic Score. The feature is functional end-to-end.

#### **Phase 4E: Acoustic Separation Analysis**
*   **Status:** ✅ **Fully Functional**
*   **Goal:** To analyze and mitigate noise pollution between rooms, ensuring a functional and peaceful living environment.
*   **Evidence:** The `handleAcousticAnalysis` function in `client/src/App.js` has been updated to send the real `wallData` object to the server's `/analyze-acoustic-separation` endpoint. The feature is now fully functional end-to-end.

---

### **Part 4: The Creative Engine**

#### **Phase 5A: Procedural Layout Suggestions**
*   **Status:** ✅ **Fully Functional**
*   **Goal:** To inspire users and help them overcome "designer's block" by automatically generating optimized furniture layouts.
*   **Evidence:** The `LayoutSuggester.js` component correctly calls the `/generate-layouts` endpoint on the server. The `layout-generator.js` module on the server contains a rule-based algorithm that generates multiple valid furniture layouts and returns them to the client. The feature is functional end-to-end.

#### **Phase 5B: Color Palette Extraction**
*   **Status:** ✅ **Fully Functional**
*   **Goal:** To help users create a stylistically coherent design by analyzing their inspirational images.
*   **Evidence:** The `MoodBoardUploader` component correctly sends an image to the `/analyze-mood-board` endpoint. The server's `mood-board-analyzer.js` module uses a **real k-means clustering algorithm** to process the image pixels and extract a dominant color palette. The feature works end-to-end.

---

### **Part 5: Multi-Floor & Structure**

#### **Phase 6A: Multi-Floor Support**
*   **Status:** ✅ **Fully Functional**
*   **Goal:** To enable the creation and visualization of multi-story buildings, a critical feature for professional use cases.
*   **Evidence:** Multi-file upload is implemented in `App.js` with the redesigned uploader accepting multiple files and labels. The server (`index.js` and `model-generator.js`) correctly processes batch uploads and stacks the generated 3D models vertically. The client includes a `FloorTeleporter` component for seamless vertical navigation.

#### **Phase 6B: Staircase and Elevator System**
*   **Status:** ✅ **Fully Functional**
*   **Goal:** To provide a realistic and interactive method for navigating between floors in a multi-story building.
*   **Features:**
    *   **Auto-Detection System:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** The system now automatically detects staircases and elevators from the 2D floor plan using OCR text recognition in `server/image-processor.js`.
    *   **Staircase Visualization:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** The `Staircase.js` component procedurally generates 3D stair geometry. `VRScene.js` uses this to automatically place stairs in detected locations and uses CSG (Constructive Solid Geometry) to cut openings in the upper floor.
    *   **Elevator Visualization:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** A new `Elevator.js` component renders a 3D representation of the elevator shaft and cabin. `VRScene.js` automatically instantiates these models based on the server's detection data.

#### **Phase 6C: Automatic Roof Generator**
*   **Status:** ✅ **Fully Functional**
*   **Goal:** To allow users to easily add a roof to their building, completing the exterior structure.
*   **Features:**
    *   **Roof Generation Tool:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** A `RoofTool` component has been added to the UI, allowing users to toggle between "Flat" and "Pitched" roof styles. The `Roof` component in `VRScene.js` dynamically calculates the roof's dimensions and position based on the top-most floor of the loaded model, ensuring a perfect fit.

#### **Phase 6D: Simple Exterior Environment**
*   **Status:** ✅ **Fully Functional**
*   **Goal:** To improve the sense of realism and immersion by placing the building in a simple environment.
*   **Features:**
    *   **Ground Plane & Skybox:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** An `EnvironmentController` component has been integrated into `VRScene.js`. It utilizes `@react-three/drei` components (`<Sky>`, `<Stars>`) to generate dynamic "Day", "Sunset", and "Night" environments. A new `EnvironmentTool` UI allows users to toggle between these modes in real-time.

---

### **Part 6: Advanced Customization & Workflow**

#### **Phase 7A: Window and Door Customization**
*   **Status:** ✅ **Fully Functional**
*   **Goal:** To increase the realism and detail of the model by allowing users to place custom window and door models.
*   **Features:**
    *   **Component Library:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** Procedural 3D models for `Window` (frame + glass) and `Door` (frame + panel + handle) have been implemented.
    *   **Placement Logic:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** The server (`image-processor.js`) now distinguishes between windows (exterior gaps) and doors (interior gaps) and calculates their dimensions. The client (`VRScene.js`) automatically places the correct 3D component into these detected openings, sized to fit perfectly.

#### **Phase 7B: Saved Project "Snapshots"**
*   **Status:** ✅ **Fully Functional**
*   **Goal:** To allow users to experiment with different design ideas without losing their original work.
*   **Features:**
    *   **Versioning System:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** A `/save-snapshot` endpoint has been implemented on the server to save the current model state as a new file. The client includes a "Save Snapshot" button in the VR view. The `Dashboard` component groups these snapshots under their parent project, allowing users to easily view and load different versions of their design.

---

### **Part 7: The Professional Toolkit & Future Vision**

#### **Phase 8A: Financial & Construction Reality**
*   **Status:** ✅ **Fully Functional**
*   **Goal:** To bridge the gap between the virtual design and its real-world construction and cost implications.
*   **Features:**
    *   **Real-Time Cost Estimation:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** The `CostEstimator` component calculates project costs in real-time based on material prices defined in `materials.json`, wall area, roof type, and auto-detected features (stairs, elevators, windows, doors).
    *   **Bill of Materials Generation:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** The `CostEstimator` includes an "Export BOM" function that generates a CSV file detailing the costs of walls, structural elements, fixtures, and roofing.
    *   **Constructability Analysis:**
        *   **Status:** ⏳ **Pending**
        *   **Note:** Basic structural cost analysis is included, but deep constructability checks (load-bearing walls) remain a future enhancement.

#### **Phase 8B: Automated Dimensioning & 2D Plan Export**
*   **Status:** ⏳ **Pending**
*   **Goal:** To save users significant time by automatically generating professional, dimensioned 2D plans.
*   **Features:**
    *   **Automated Dimensioning:**
        *   **Concept:** The system will automatically calculate and draw all necessary dimension lines on the 2D floor plan.
        *   **Technical Approach:** After the initial wall data is extracted, the server will perform a geometry analysis to identify all wall segments, rooms, windows, and doors. It will calculate their lengths, widths, and positions. This data will be used to generate a new SVG or PDF layer containing standard architectural dimension lines (e.g., lines, arrows, and text labels).
        *   **UI/UX:** In the 2D view, the user will be able to toggle a "Show Dimensions" overlay. They will also have a button to "Export as PDF," which will generate a clean, professionally formatted 2D technical drawing, complete with a title block and the dimensioned floor plan.

#### **Phase 9: Creative & Collaborative Power**
*   **Status:** ⏳ **Pending**
*   **Goal:** To evolve the platform into a tool for limitless creativity and shared experiences.
*   **Features:**
    *   **Multi-User VR Sessions:** Allow multiple users to inhabit the same VR scene simultaneously, enabling real-time collaboration between designers, clients, and contractors.
    *   **Procedural Content Generation:** Add tools for procedurally generating interior design elements (e.g., shelving layouts, tiling patterns) based on user-defined parameters.
    *   **Augmented Reality (AR) Overlay:** Develop a mobile app that allows users to project their 3D model into their real-world space using AR, providing a powerful sense of scale and context.

#### **Phase 10: Future Expansion & Market Leadership**
*   **Status:** ⏳ **Pending**
*   **Goal:** To expand the platform's reach and secure its position as an indispensable tool for the entire architecture, engineering, and construction (AEC) industry.
*   **Features:**
    *   **Plugin Architecture & Marketplace:** Develop a plugin system that allows third-party developers to create and sell their own analysis tools, material packs, and furniture libraries.
    *   **Integration with Professional CAD Software:** Create import/export plugins for industry-standard tools like Revit and AutoCAD, allowing seamless workflow integration.
    *   **Enterprise Licensing & Support:** Develop a tiered pricing model for professional firms, offering features like team management, advanced security, and dedicated technical support.

---

### **Part 8: Optional Future Simulations**

*   **Note:** The following features are considered optional and are not part of the primary development roadmap. Their implementation will be decided upon at a later date, as they are not deemed essential for the core product.

#### **Acoustic Simulation**
*   **Status:**  shelved **Shelved**
*   **Concept:** The system will simulate how sound propagates through the designed space. Users will be able to place a virtual sound source (e.g., a conversation, a stereo) and "hear" how it sounds from another point in the room.
*   **Technical Approach:** This will be a non-trivial engineering challenge. We will use a simplified ray-tracing algorithm. From the sound source, we'll cast a number of "sound rays." When a ray hits a surface, its energy will be reduced based on the material's `acoustic_absorption_coefficient`. We will simulate a few bounces. The final "loudness" at the listener's position will be an aggregate of the energy from all rays that reach it.
*   **UI/UX:** In the VR scene, the user will be able to drop a "speaker" icon and a "microphone" icon. The UI will then display a simple decibel level or a qualitative description (e.g., "Clear," "Muffled," "Echoey").

#### **Thermal Simulation**
*   **Status:**  shelved **Shelved**
*   **Concept:** The system will provide a basic simulation of heat flow, showing how material choices affect energy efficiency.
*   **Technical Approach:** This will be a simplified 2D heat-flow simulation. We will define an "outside" temperature and an "inside" temperature. The server will run a simplified finite-difference simulation on the 2D floor plan grid. Each wall segment will have a thermal resistance calculated from its material's `thermal_conductivity`. The simulation will calculate the heat loss/gain through the building envelope over a simulated 24-hour period.
*   **UI/UX:** The UI will display a simple "Energy Performance Score" (e.g., A+ to F) and a visualization of heat loss on the 2D floor plan, with "hot" and "cold" spots highlighted in red and blue.
