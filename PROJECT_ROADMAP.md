# PROJECT ROADMAP: The Grand Plan 6.0 (Tactical Edition)

## Vision Statement
To create the world's most powerful, insightful, and creatively empowering platform for transforming 2D floor plans into immersive, interactive, and intelligent VR experiences. Our strategy is to win by focusing on brilliant, non-AI engineering, sophisticated procedural systems, and a deep, empathetic understanding of the user's design journey. This document is a living blueprint, updated continuously to reflect our progress and challenges.

---
## Development & Issue Log
*This section will be updated with every significant action and challenge.*

*   **Log Entry 2025-11-07:**
    *   **Action:** Began implementation of Phase 2A: Model Persistence.
    *   **Issue:** The initial `npm install` for `node-gltf` failed with a 404 error.
    *   **Root Cause Analysis:** The `node-gltf` package does not exist or is deprecated in the public NPM registry. The initial assumption for GLB creation was incorrect.
    *   **Resolution Plan:** Pivot to using the official `three.js` library, which includes the `GLTFExporter` module suitable for use in a Node.js environment. This is a more robust and future-proof solution.
    *   **Status:** Plan enacted. `three.js` has been successfully installed.

---

## The Roadmap

### **Part 1: The Core Foundation**

#### **Phase 1: Foundational Pipeline**
*   **Status:** ✅ **Complete**
*   **Goal:** Establish the core end-to-end functionality of the application.
*   **Features:**
    *   **2D Plan Uploader:**
        *   `[X]` Create React frontend for file upload.
        *   `[X]` Support bitmap (PNG, JPEG) and vector (SVG) formats.
    *   **Server-Side Image Processing:**
        *   `[X]` Implement Node.js server with `jimp` and `svg-parser`.
        *   `[X]` Develop algorithmic wall/line detection.
    *   **3D Model Generation:**
        *   `[X]` Create in-memory procedural engine to generate mesh from wall data.
    *   **Client-Side VR Rendering:**
        *   `[X]` Use `@react-three/fiber` to render the 3D model in a basic VR scene.

#### **Phase 2A: Model Persistence & API**
*   **Status:** 🎯 **In Progress**
*   **Goal:** Save generated models to persistent files and create secure, accessible APIs.
*   **Features:**
    *   **Model File Generation:**
        *   `[ ]` Install `three.js` dependency on the server. - ✅ **Complete**
        *   `[ ]` Create a new `models/` directory for `.glb` files. - `In Progress`
        *   `[ ]` In the `/generate-model` endpoint, construct a `THREE.Scene` from the generated geometry.
        *   `[ ]` Use `GLTFExporter` to convert the scene to a binary `.glb` buffer.
        *   `[ ]` Save the buffer to a unique file in the `models/` directory.
    *   **API Endpoint Creation:**
        *   `[ ]` Create a secure, admin-only `/download-model` endpoint for direct file downloads.
        *   `[ ]` Create a public `/view-model` endpoint to serve the model to the client viewer.
        *   `[ ]` Update server response to include the new model filename.
    *   **Client-Side Integration:**
        *   `[ ]` Update `client/src/App.js` to handle the new server response (model filename).
        *   `[ ]` Update `client/src/components/VRScene.js` to use the `useGLTF` hook and load the model from the `/view-model` endpoint.

#### **Phase 2B: The User Dashboard**
*   **Status:** ⏳ Pending
*   **Goal:** Create the central hub for users to manage their projects.
*   **Features:**
    *   **Dashboard UI:**
        *   `[ ]` Design and build a new React component for the user dashboard.
        *   `[ ]` Create UI elements for listing, creating, and deleting projects.
    *   **Project State Management:**
        *   `[ ]` Implement client-side state management (e.g., React Context or Zustand) for projects.
        *   `[ ]` Persist project list to the browser's `localStorage` as an initial step.

---

### **Part 2: The Simulation Engine**

#### **Phase 3A: The Sun & Shadow Simulation**
*   **Status:** ⏳ Pending
*   **Goal:** Simulate realistic, physically accurate natural lighting and shadows.
*   **Features:**
    *   **Geospatial Context:**
        *   `[ ]` Add UI for users to input a latitude/longitude for their project.
    *   **Celestial Algorithm:**
        *   `[ ]` Implement a library or algorithm to calculate the sun's position for any date/time based on location.
    *   **Real-Time Rendering:**
        *   `[ ]` Integrate the sun position with a `DirectionalLight` in the `three.js` scene.
        *   `[ ]` Configure high-quality, real-time shadow mapping.

#### **Phase 3B: The Material Physics Simulation**
*   **Status:** ⏳ Pending
*   **Goal:** Simulate the real-world physical performance of materials.
*   **Features:**
    *   **Material Properties System:**
        *   `[ ]` Build a database of materials with properties (e.g., R-value, density, acoustic absorption).
        *   `[ ]` Create a UI for users to "paint" these materials onto surfaces in their model.
    *   **Thermal Simulation:**
        *   `[ ]` Develop a simplified FEA algorithm to model heat transfer and generate a real-time heat map visualization.
    *   **Acoustic Simulation:**
        *   `[ ]` Develop a ray-tracing-based algorithm to simulate sound propagation and reverberation.

---

### **Part 3: The Intelligence Layer**

#### **Phase 4A: Architectural Pattern Analysis**
*   **Status:** ⏳ Pending
*   **Goal:** Provide users with expert feedback based on established architectural principles.
*   **Features:**
    *   **Expert System Engine:**
        *   `[ ]` Research and codify a library of architectural heuristics (e.g., from "A Pattern Language").
        *   `[ ]` Build a rules engine that can analyze the 3D model's geometry against these heuristics.
    *   **Feedback UI:**
        *   `[ ]` Design and implement a non-intrusive UI to display warnings, suggestions, and analysis to the user.

#### **Phase 4B: Human Factors & Ergonomics**
*   **Status:** ⏳ Pending
*   **Goal:** Simulate the human experience within the design to optimize for comfort and usability.
*   **Features:**
    *   **Avatar & Animation System:**
        *   `[ ]` Integrate a simple 3D avatar into the scene.
        *   `[ ]` Implement an inverse kinematics system for realistic task animation.
    *   **Ergonomics Database:**
        *   `[ ]` Create a database of standard ergonomic data (reach distances, turning radii, etc.).
    *   **Simulation Engine:**
        *   `[ ]` Develop a pathfinding and task simulation algorithm to analyze workflows and highlight ergonomic issues.

---

### **Part 4: The Professional Toolkit**

#### **Phase 5: Financial & Construction Reality**
*   **Status:** ⏳ Pending
*   **Goal:** Bridge the gap between the virtual design and its real-world construction and cost.
*   **Features:**
    *   **Bill of Materials Engine:**
        *   `[ ]` Develop an algorithm to procedurally calculate material quantities from the 3D model.
        *   `[ ]` Build and integrate a database of regional material costs.
    *   **Live Cost Dashboard:**
        *   `[ ]` Create a UI to display a real-time, itemized cost estimate.

#### **Phase 6: Creative & Collaborative Power**
*   **Status:** ⏳ Pending
*   **Goal:** Evolve the platform into a tool for limitless creativity and shared experiences.
*   **Features:**
    *   **Parametric Design Sandbox:**
        *   `[ ]` Re-architect the core design system to support parametric rules and constraints.
        *   `[ ]` Build a UI for users to define these rules.
    *   **Multi-User & Sharing:**
        *   `[ ]` Implement a WebSocket/WebRTC backend for real-time scene synchronization.
        *   `[ ]` Build collaboration features (avatars, voice chat).

#### **Phase 7: Future Expansion**
*   **Status:** ⏳ Pending
*   **Goal:** Expand to new platforms and secure our position as a market leader.
*   **Features:**
    *   **Augmented Reality (AR) Integration:**
        *   `[ ]` Use WebXR to project models into the real world.
