# PROJECT ROADMAP: The Grand Plan 6.0 (Architectural Blueprint Edition)

## Vision Statement
To create the world's most powerful, insightful, and creatively empowering platform for transforming 2D floor plans into immersive, interactive, and intelligent VR experiences. Our strategy is to win by focusing on brilliant, non-AI engineering, sophisticated procedural systems, and a deep, empathetic understanding of the user's design journey. This document is a living blueprint, updated continuously to reflect our progress and challenges.

---
## Technical Decisions & Justifications

*   **`node-canvas` for Image Processing:**
    *   **Decision:** We will use `node-canvas` for all server-side bitmap image analysis.
    *   **Justification:** The previously used `jimp` library was identified as the root cause of a persistent, critical server crash. After extensive debugging, it was clear `jimp` was unstable in our environment. We have migrated to `node-canvas`. Although it introduces native C++ dependencies (requiring a more complex build environment), its stability, performance, and power make it the correct choice for a reliable core pipeline. The trade-off in setup complexity is acceptable for a functioning and stable application.

---
## Detailed Implementation Logs

### **Phase 2: Model Persistence, API & Dashboard Integration**
*   **Status:** ✅ **Complete**
*   **Objective:** To transition from a transient, single-session tool to a persistent, project-based application. This required building a secure backend API to manage 3D model files and a frontend dashboard for user interaction.
*   *(For a full, exhaustive breakdown of this phase, please see the previous version of this document. The log has been condensed to improve readability.)*

### **Phase 3A: The Sun & Shadow Simulation**
*   **Status:** 🎯 **In Progress (Implementation Complete, Verification Blocked)**
*   **Objective:** To introduce a realistic lighting model by simulating a dynamic sun and casting physically plausible shadows, enhancing the sense of realism and immersion in the VR scene.
*   *(For a full, exhaustive breakdown of this phase, please see the previous version of this document. The log has been condensed to improve readability.)*

---
## The Roadmap: Future Phases Detailed Blueprint

### **Part 2: The Simulation Engine (Continued)**

#### **Phase 3B: The Material Physics Simulation**
*   **Status:** ⏳ **Pending**
*   **Goal:** To simulate the real-world physical performance of materials, allowing users to understand not just the look, but the *feel* and *function* of their design choices. This moves the platform from a simple visualizer to a true simulation tool.
*   **Features:**
    *   **Material Library:**
        *   **UI:** A new tab or panel in the VR scene interface will allow users to browse and apply materials to different surfaces (walls, floors, ceilings).
        *   **Data Model:** We will create a JSON-based material definition library. Each material will have properties like: `name`, `texture_map`, `normal_map`, `roughness`, `metalness`, and two new custom properties: `acoustic_absorption_coefficient` and `thermal_conductivity`.
        *   **Implementation:** The user will be able to select a surface in the VR scene and apply a material from the library. This will update the `three.js` `MeshStandardMaterial` on the client side.
    *   **Acoustic Simulation:**
        *   **Concept:** The system will simulate how sound propagates through the designed space. Users will be able to place a virtual sound source (e.g., a conversation, a stereo) and "hear" how it sounds from another point in the room.
        *   **Technical Approach:** This will be a non-trivial engineering challenge. We will use a simplified ray-tracing algorithm. From the sound source, we'll cast a number of "sound rays." When a ray hits a surface, its energy will be reduced based on the material's `acoustic_absorption_coefficient`. We will simulate a few bounces. The final "loudness" at the listener's position will be an aggregate of the energy from all rays that reach it.
        *   **UI/UX:** In the VR scene, the user will be able to drop a "speaker" icon and a "microphone" icon. The UI will then display a simple decibel level or a qualitative description (e.g., "Clear," "Muffled," "Echoey").
    *   **Thermal Simulation:**
        *   **Concept:** The system will provide a basic simulation of heat flow, showing how material choices affect energy efficiency.
        *   **Technical Approach:** This will be a simplified 2D heat-flow simulation. We will define an "outside" temperature and an "inside" temperature. The server will run a simplified finite-difference simulation on the 2D floor plan grid. Each wall segment will have a thermal resistance calculated from its material's `thermal_conductivity`. The simulation will calculate the heat loss/gain through the building envelope over a simulated 24-hour period.
        *   **UI/UX:** The UI will display a simple "Energy Performance Score" (e.g., A+ to F) and a visualization of heat loss on the 2D floor plan, with "hot" and "cold" spots highlighted in red and blue.

---

### **Part 3: The Intelligence Layer**

#### **Phase 4A: Architectural Pattern Analysis**
*   **Status:** ⏳ **Pending**
*   **Goal:** To provide users with expert, automated feedback based on established architectural principles and best practices, acting as a virtual design consultant.
*   **Features:**
    *   **Circulation Path Analysis:**
        *   **Concept:** The system will analyze the flow of movement through the space to identify bottlenecks, inefficient paths, and wasted space.
        *   **Technical Approach:** The server will perform a graph-based analysis. We will represent the floor plan as a grid. The algorithm will identify all major "nodes" (doorways, entry points, key rooms) and calculate the shortest paths between them using A* search. It will then analyze the properties of these paths (e.g., width, number of turns).
        *   **UI/UX:** The analysis will be displayed as an overlay on the 2D floor plan, showing the primary circulation paths. Problem areas (e.g., paths that are too narrow, paths that cross through private spaces) will be highlighted with warnings and suggestions.
    *   **Natural Light Analysis:**
        *   **Concept:** Building on the Sun Simulation, this feature will analyze the quantity and quality of natural light throughout the day.
        *   **Technical Approach:** The server will run the sun simulation for a full day cycle at different times of the year (e.g., solstices, equinoxes). For each key room, it will calculate the total "lumen-hours" received.
        *   **UI/UX:** The results will be presented as a "Natural Light Score" for each room and a heatmap visualization showing which areas receive the most and least light.
    *   **Ergonomics & Accessibility Audit:**
        *   **Concept:** The system will check the design against common accessibility standards (e.g., ADA-like guidelines for doorway width, turning radii in bathrooms).
        *   **Technical Approach:** This will be a rule-based system. The server will parse the geometry to identify features like doors, hallways, and bathrooms. It will then measure their dimensions and compare them against a set of predefined rules (e.g., `is_doorway_width >= 32_inches`).
        *   **UI/UX:** A "Compliance Report" will be generated, listing any potential issues and providing links to explanations of the relevant standards.

#### **Phase 4B: Human Factors & Usability Simulation**
*   **Status:** ⏳ **Pending**
*   **Goal:** To simulate the human *experience* of the design, helping users understand how the space will function in practice.
*   **Features:**
    *   **Furniture Placement & Layout Assistant:**
        *   **Concept:** An interactive tool that allows users to place virtual furniture and get feedback on the layout.
        *   **Technical Approach:** We will create a library of common furniture items with accurate dimensions. Users will be able to drag and drop these into the VR scene. The system will provide real-time feedback, highlighting issues like blocked circulation paths or insufficient clearance around furniture.
        *   **UI/UX:** A simple, intuitive drag-and-drop interface within the VR scene. Visual guides (e.g., colored outlines showing clearance zones) will appear as furniture is moved.
    *   **"Day in the Life" Simulation:**
        *   **Concept:** A powerful visualization tool that shows an animated representation of how people might use the space over a typical day.
        *   **Technical Approach:** Users will be able to define simple "scripts" for virtual agents (e.g., "Wake up, go to kitchen, make coffee, go to office"). The system will then animate these agents moving through the 3D model, following the calculated circulation paths.
        *   **UI/UX:** A timeline interface will allow the user to scrub through the simulated day. The animated agents will be visible in the VR scene, revealing how different activities might interact or conflict.

---

### **Part 4: The Professional Toolkit & Future Vision**

#### **Phase 5: Financial & Construction Reality**
*   **Status:** ⏳ **Pending**
*   **Goal:** To bridge the gap between the virtual design and its real-world construction and cost implications.
*   **Features:**
    *   **Real-Time Cost Estimation:** As users apply materials from the library, the system will calculate a running, real-time estimate of the project's material costs.
    *   **Bill of Materials Generation:** Users will be able to export a detailed list of all materials and their quantities, ready to be taken to a supplier.
    *   **Constructability Analysis:** The system will perform a basic check for common construction issues (e.g., identifying load-bearing walls that have been removed, checking for sufficient structural support based on simplified rules).

#### **Phase 6: Creative & Collaborative Power**
*   **Status:** ⏳ **Pending**
*   **Goal:** To evolve the platform into a tool for limitless creativity and shared experiences.
*   **Features:**
    *   **Multi-User VR Sessions:** Allow multiple users to inhabit the same VR scene simultaneously, enabling real-time collaboration between designers, clients, and contractors.
    *   **Procedural Content Generation:** Add tools for procedurally generating interior design elements (e.g., shelving layouts, tiling patterns) based on user-defined parameters.
    *   **Augmented Reality (AR) Overlay:** Develop a mobile app that allows users to project their 3D model into their real-world space using AR, providing a powerful sense of scale and context.

#### **Phase 7: Future Expansion & Market Leadership**
*   **Status:** ⏳ **Pending**
*   **Goal:** To expand the platform's reach and secure its position as an indispensable tool for the entire architecture, engineering, and construction (AEC) industry.
*   **Features:**
    *   **Plugin Architecture & Marketplace:** Develop a plugin system that allows third-party developers to create and sell their own analysis tools, material packs, and furniture libraries.
    *   **Integration with Professional CAD Software:** Create import/export plugins for industry-standard tools like Revit and AutoCAD, allowing seamless workflow integration.
    *   **Enterprise Licensing & Support:** Develop a tiered pricing model for professional firms, offering features like team management, advanced security, and dedicated technical support.
