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
        *   **Evidence:** The `FurniturePlacer` component in `VRScene.js` is a fully functional, client-side feature. It correctly uses raycasting for placement and performs real-time AABB collision detection to prevent objects from overlapping. The "Layout Assistant" portion is not yet implemented.
    *   **"Day in the Life" Simulation:**
        *   **Status:** ✅ **Fully Functional**
        *   **Evidence:** The client now sends the real `wallData` to the server's `/find-path` endpoint. The server uses its A* pathfinding algorithm to generate a valid path between two points (e.g., the centers of the first two rooms). This path is then used to drive the `VirtualAgent` animation. The feature is functional end-to-end.

#### **Phase 4C: Design Philosophy Analysis (Vastu Shastra & Feng Shui)**
*   **Status:** 🟡 **Partially Implemented**
*   **Goal:** To provide automated analysis based on ancient and modern design philosophies, transforming the platform into a virtual design consultant.
*   **Evidence:** The backend `design-philosophy-analyzer.js` module contains **real, non-placeholder analysis logic** for Vastu. However, its functionality is entirely dependent on the client's ability to generate a complex `layoutData` object from the raw model data, which is a significant and unverified dependency.

#### **Phase 4D: Wellness & Biophilic Design Analysis**
*   **Status:** 🟠 **Placeholder**
*   **Goal:** To computationally score a design's positive impact on human well-being by analyzing its connection to nature.
*   **Evidence:** The feature is implemented as a purely client-side module (`biophilic-analyzer.js`) that contains **no real analysis logic**. It returns a hardcoded, static report.

#### **Phase 4E: Acoustic Separation Analysis**
*   **Status:** 🟡 **Partially Implemented**
*   **Goal:** To analyze and mitigate noise pollution between rooms, ensuring a functional and peaceful living environment.
*   **Evidence:** The backend `acoustic-separation-analyzer.js` module appears to contain real analysis logic. However, the client in `App.js` sends it **hardcoded dummy data**, making the feature non-functional from a user's perspective.

---

### **Part 4: The Creative Engine**

#### **Phase 5A: Procedural Layout Suggestions**
*   **Status:** ⏳ **Pending**
*   **Goal:** To inspire users and help them overcome "designer's block" by automatically generating optimized furniture layouts.
*   **Features:**
    *   **Automated Arrangement:**
        *   **Concept:** The system will suggest multiple valid furniture arrangements based on user-selected items and established interior design principles.
        *   **Technical Approach:** The user will select a room and a list of furniture items from a library (e.g., "1 sofa, 2 armchairs, 1 coffee table"). The server will then run a placement algorithm. This algorithm will be rule-based, considering factors like clearance zones (e.g., `3ft` of walking space), conversation areas (e.g., seating arranged in a `U-shape`), and focal points (e.g., aligning seating towards a fireplace or window). It will generate several valid layouts and send them to the client.
        *   **UI/UX:** The user will be presented with 3-4 "layout cards" showing miniature 2D representations of the suggested arrangements. Clicking on a card will apply that layout to the main VR scene, which the user can then accept or customize further.

#### **Phase 5B: Color Palette Extraction**
*   **Status:** ✅ **Fully Functional**
*   **Goal:** To help users create a stylistically coherent design by analyzing their inspirational images.
*   **Evidence:** The `MoodBoardUploader` component correctly sends an image to the `/analyze-mood-board` endpoint. The server's `mood-board-analyzer.js` module uses a **real k-means clustering algorithm** to process the image pixels and extract a dominant color palette. The feature works end-to-end.

---

### **Part 5: Multi-Floor & Structure**

#### **Phase 6A: Multi-Floor Support**
*   **Status:** ⏳ **Pending**
*   **Goal:** To enable the creation and visualization of multi-story buildings, a critical feature for professional use cases.
*   **Features:**
    *   **Multi-File Upload:**
        *   **Concept:** The system will be updated to support the upload of multiple floor plan images within a single project.
        *   **Technical Approach:** The frontend uploader will be redesigned to accept multiple files. Each file will be assigned a level (e.g., "Ground Floor," "First Floor"). On the server, the `generate-model` endpoint will be updated to process a batch of images. It will generate a separate 3D model for each floor, then stack them vertically at a standard height (e.g., 9ft) to create a single, unified 3D model data structure.
        *   **UI/UX:** The user will be able to drag and drop multiple images and label them. In the VR scene, a new UI element (e.g., a simple level selector) will allow the user to instantly teleport between the different floors.

#### **Phase 6B: Staircase and Elevator Tool**
*   **Status:** ⏳ **Pending**
*   **Goal:** To provide a realistic and interactive method for navigating between floors in a multi-story building.
*   **Features:**
    *   **Interactive Placement Tool:**
        *   **Concept:** Users will be able to place staircases and elevators to connect the different levels of their project.
        *   **Technical Approach:** This will be a client-side tool. After a multi-floor model is loaded, the user will activate the "Staircase Tool." They will then click a point on the floor of the lower level and a corresponding point on the ceiling. The tool will then procedurally generate the 3D geometry for a staircase and automatically cut the required opening in the upper floor's model data.
        *   **UI/UX:** A simple tool in the VR interface will allow users to select "Add Stairs." The interface will guide them to select a start and end point. The staircase will appear instantly, and the user will be able to walk up and down it in the VR scene.

#### **Phase 6C: Automatic Roof Generator**
*   **Status:** ⏳ **Pending**
*   **Goal:** To allow users to easily add a roof to their building, completing the exterior structure.
*   **Features:**
    *   **Roof Generation Tool:**
        *   **Concept:** A simple tool to automatically generate a roof that fits the top floor of the building.
        *   **Technical Approach:** The server will analyze the perimeter of the top-most floor plan. The user will select a roof type (e.g., "Flat," "Pitched"). The server will then generate the corresponding 3D geometry for the roof, sized and positioned to fit the building perfectly.
        *   **UI/UX:** A simple "Add Roof" button will appear after a multi-story project is created. The user can select a style, and the roof will be added to the model.

#### **Phase 6D: Simple Exterior Environment**
*   **Status:** ⏳ **Pending**
*   **Goal:** To improve the sense of realism and immersion by placing the building in a simple environment.
*   **Features:**
    *   **Ground Plane & Skybox:**
        *   **Concept:** Users can place their building on a ground plane and select a skybox for the environment.
        *   **Technical Approach:** In the `VRScene` component, we will add a larger, textured ground plane (e.g., with a grass texture) and a `<Sky>` component from `@react-three/drei`. The user will be able to select from a predefined list of skybox images.
        *   **UI/UX:** A new "Environment" tab in the VR interface will allow the user to toggle the ground plane and choose a sky (e.g., "Sunny Day," "Night Sky"). This will be especially impactful when looking out of the windows of the model.

---

### **Part 6: Advanced Customization & Workflow**

#### **Phase 7A: Window and Door Customization**
*   **Status:** ⏳ **Pending**
*   **Goal:** To increase the realism and detail of the model by allowing users to place custom window and door models.
*   **Features:**
    *   **Component Library:**
        *   **Concept:** A new library of 3D models for various types of windows and doors will be available.
        *   **Technical Approach:** We will create a library of pre-made 3D models for windows and doors in a format like `.glb`. The server-side image processing will be updated to not just identify openings, but to mark their location and size. In the client, the user will be able to select a window/door from the new library and "place" it into one of these marked openings.
        *   **UI/UX:** A new "Doors & Windows" tab will appear in the UI. The user can select an opening in the model, which will then show a list of compatible window/door models from the library that can be inserted.

#### **Phase 7B: Saved Project "Snapshots"**
*   **Status:** ⏳ **Pending**
*   **Goal:** To allow users to experiment with different design ideas without losing their original work.
*   **Features:**
    *   **Versioning System:**
        *   **Concept:** Users can save different versions, or "snapshots," of their project at any time.
        *   **Technical Approach:** This will require a change on the server. When a user saves a "snapshot," instead of overwriting the existing model file, the server will save a new version with a timestamp or a user-provided name (e.g., `project_a_snapshot_kitchen_idea_b.json`). The dashboard will be updated to show these snapshots grouped under the main project.
        *   **UI/UX:** A "Save Snapshot" button will be added to the VR view. The dashboard will be redesigned to show a primary project card, which can be expanded to show all the saved snapshots for that project. Users can then load, view, or delete any snapshot.

---

### **Part 7: The Professional Toolkit & Future Vision**

#### **Phase 8A: Financial & Construction Reality**
*   **Status:** ⏳ **Pending**
*   **Goal:** To bridge the gap between the virtual design and its real-world construction and cost implications.
*   **Features:**
    *   **Real-Time Cost Estimation:** As users apply materials from the library, the system will calculate a running, real-time estimate of the project's material costs.
    *   **Bill of Materials Generation:** Users will be able to export a detailed list of all materials and their quantities, ready to be taken to a supplier.
    *   **Constructability Analysis:** The system will perform a basic check for common construction issues (e.g., identifying load-bearing walls that have been removed, checking for sufficient structural support based on simplified rules).

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
