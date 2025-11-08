# PROJECT ROADMAP: The Grand Plan 6.0 (Architectural Blueprint Edition)

## Vision Statement
To create the world's most powerful, insightful, and creatively empowering platform for transforming 2D floor plans into immersive, interactive, and intelligent VR experiences. Our strategy is to win by focusing on brilliant, non-AI engineering, sophisticated procedural systems, and a deep, empathetic understanding of the user's design journey. This document is a living blueprint, updated continuously to reflect our progress and challenges.

---
## Technical Decisions & Justifications

*   **`node-canvas` for Image Processing:**
    *   **Decision:** We will use `node-canvas` for all server-side bitmap image analysis.
    *   **Justification:** The previously used `jimp` library was identified as the root cause of a persistent, critical server crash. After extensive debugging, it was clear `jimp` was unstable in our environment. We have migrated to `node-canvas`. Although it introduces native C++ dependencies (requiring a more complex build environment), its stability, performance, and power make it the correct choice for a reliable core pipeline. The trade-off in setup complexity is acceptable for a functioning and stable application.

---
## Development & Issue Log
*This section will be updated with every significant action and challenge.*

*   **Log Entry 2025-11-07 (Server Instability RESOLVED):**
    *   **Action:** Replaced the `jimp` library with `node-canvas` to resolve the server crash.
    *   **Issue:** The Node.js server was crashing silently upon file upload. The root cause was identified as an unstable interaction with the `jimp` library.
    *   **Resolution:**
        1.  Installed the necessary system dependencies for `node-canvas` (e.g., `libcairo2-dev`, `libpango1.0-dev`).
        2.  Removed `jimp` and added `canvas` to the server's `package.json`.
        3.  Refactored `server/image-processor.js` to use the `node-canvas` API for loading the image, reading pixel data, and performing the binarization.
        4.  Successfully tested the end-to-end `/generate-model` endpoint with a test PNG image, confirming the crash is resolved.
    *   **Status:** The server is now stable. Phase 2A is **Unblocked**.

*   **Log Entry 2025-11-07 (PBR Implementation):**
    *   **Action:** Began implementation of Phase 3B: The Material Physics Simulation.
    *   **Details:** Implemented PBR materials for the walls and floor in the `VRScene` component, using placeholder textures. This will allow for a significant increase in visual realism once the final textures are added.
    *   **Status:** Phase 3B is **In Progress**.

*   **Log Entry 2025-11-07 (Simulation Engine Kickoff):**
    *   **Action:** Began implementation of Part 2: The Simulation Engine, starting with Phase 3A.
    *   **Details:** Implemented a realistic lighting and shadow system in the `VRScene` component. Replaced the basic `pointLight` with a `directionalLight` to simulate sunlight, and configured both the model and a new ground plane to cast and receive shadows, respectively.
    *   **Status:** Phase 3A is **In Progress**.

*   **Log Entry 2025-11-07 (Core Foundation Complete):**
    *   **Action:** Completed Part 1: The Core Foundation.
    *   **Details:** Implemented `localStorage` caching for the model list in the dashboard, providing an instant loading experience. This completes all features for Phase 2B. The core pipeline is now feature-complete and stable.
    *   **Status:** Part 1 is **Complete**. Part 2 is **Unblocked**.

*   **Log Entry 2025-11-07 (Dashboard Functionality):**
    *   **Action:** Completed interactive features for the user dashboard.
    *   **Details:**
        1.  **View Model:** Implemented `handleView` in `Dashboard.js` to fetch model data and switch to the VR scene.
        2.  **Delete Model:** Added a `DELETE /models/:filename` endpoint to the server and implemented the corresponding `handleDelete` function in the client to remove models.
    *   **Status:** "View" and "Delete" features are complete. Phase 2B is nearly finished.

*   **Log Entry 2025-11-07 (GLTF Exporter):**
    *   **Action:** Began implementation of Phase 2A: Model Persistence.
    *   **Issue:** The initial `npm install` for `node-gltf` failed with a 404 error.
    *   **Root Cause Analysis:** The `node-gltf` package does not exist or is deprecated. The `three.js` `GLTFExporter` was attempted, but it is not compatible with the Node.js environment and caused silent crashes.
    *   **Resolution Plan:** Abandoned server-side `.glb` generation in favor of sending raw model data to the client. This issue is now superseded by the larger server instability issue.
    *   **Status:** Closed.

---

## The Roadmap

### **Part 1: The Core Foundation**

#### **Phase 1: Foundational Pipeline**
*   **Status:** ✅ **Complete**
*   **Goal:** Establish the core end-to-end functionality of the application.

#### **Phase 2A: Model Persistence & API**
*   **Status:** ✅ **Complete**
*   **Goal:** Save generated models to persistent files and create secure, accessible APIs.
*   **Features:**
    *   **Model File Generation:**
        *   `[X]` Save generated model as a `.json` file on the server.
    *   **API Endpoint Creation:**
        *   `[X]` Create `GET /models` to list available models.
        *   `[X]` Create `GET /models/:filename` for secure model download.
    *   **Client-Side Integration:**
        *   `[X]` Integrate model listing and download into the dashboard.

#### **Phase 2B: The User Dashboard**
*   **Status:** ✅ **Complete**
*   **Goal:** Create the central hub for users to manage their projects.
*   **Features:**
    *   **Dashboard UI:**
        *   `[X]` Design and build a new React component for the user dashboard.
        *   `[X]` Create UI elements for listing, creating, and deleting projects.
    *   **Project State Management:**
        *   `[X]` Implement client-side state management for projects.
        *   `[X]` Persist project list to the browser's `localStorage`.

---

### **Part 2: The Simulation Engine**
*(All subsequent phases are pending the completion of Part 1)*

#### **Phase 3A: The Sun & Shadow Simulation**
*   **Status:** 🎯 **In Progress**
*   **Goal:** Simulate realistic, physically accurate natural lighting and shadows.

#### **Phase 3B: The Material Physics Simulation**
*   **Status:** 🎯 **In Progress**
*   **Goal:** Simulate the real-world physical performance of materials.

---

### **Part 3: The Intelligence Layer**

#### **Phase 4A: Architectural Pattern Analysis**
*   **Status:** ⏳ Pending
*   **Goal:** Provide users with expert feedback based on established architectural principles.

#### **Phase 4B: Human Factors & Ergonomics**
*   **Status:** ⏳ Pending
*   **Goal:** Simulate the human experience within the design to optimize for comfort and usability.

---

### **Part 4: The Professional Toolkit**

#### **Phase 5: Financial & Construction Reality**
*   **Status:** ⏳ Pending
*   **Goal:** Bridge the gap between the virtual design and its real-world construction and cost.

#### **Phase 6: Creative & Collaborative Power**
*   **Status:** ⏳ Pending
*   **Goal:** Evolve the platform into a tool for limitless creativity and shared experiences.

#### **Phase 7: Future Expansion**
*   **Status:** ⏳ Pending
*   **Goal:** Expand to new platforms and secure our position as a market leader.
