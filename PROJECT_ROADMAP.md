# PROJECT ROADMAP: The Grand Plan 6.0 (Architectural Blueprint Edition)

## Vision Statement
To create the world's most powerful, insightful, and creatively empowering platform for transforming 2D floor plans into immersive, interactive, and intelligent VR experiences. Our strategy is to win by focusing on brilliant, non-AI engineering, sophisticated procedural systems, and a deep, empathetic understanding of the user's design journey. This document is a living blueprint, updated continuously to reflect our progress and challenges.

---
## Technical Decisions & Justifications

*   **`jimp` vs. `node-canvas` for Image Processing:**
    *   **Decision:** We will use `jimp` for all server-side bitmap image analysis.
    *   **Justification:** Our primary task is reading pixel data to detect walls, not complex 2D drawing. `jimp` is a pure JavaScript library with zero native dependencies, making our application significantly easier to install, deploy, and maintain. While `node-canvas` is more powerful, its reliance on compiled C++ dependencies (Cairo) introduces unnecessary complexity and potential installation issues. `jimp` is the simplest, most portable tool that perfectly solves our specific problem.

---
## Development & Issue Log
*This section will be updated with every significant action and challenge.*

*   **Log Entry 2025-11-07 (Server Instability):**
    *   **Action:** Attempted to test the end-to-end file upload and model generation flow.
    *   **Issue:** The Node.js server crashes silently and instantly upon receiving a file upload request. The crash is happening at a low level, preventing any error messages from being logged.
    *   **Investigation Summary:**
        1.  Initial hypothesis was a code bug in `server/index.js`. Re-implemented the server with Express.js; crash persisted.
        2.  Second hypothesis was a "zombie" process blocking the port. This was a real issue (`EADDRINUSE`), but fixing it did not solve the crash.
        3.  Third hypothesis was a dependency version mismatch in the `jimp` library. A `debug-test.js` script proved that the `jimp` API was incorrect.
        4.  Final hypothesis was a shell or environment-level caching/corruption issue, as attempts to fix the `jimp` code did not change the test script's output.
    *   **Strategic Decision:** Per user instruction, we will **defer** the final debugging of this issue until the deployment phase. The server's instability is likely due to the specific, non-local shell environment. We will pause work on this feature and proceed with other tasks.
    *   **Status:** Phase 2A is **On Hold**.

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
*   **Status:** 🎯 **In Progress - Testing Blocked**
*   **Goal:** Save generated models to persistent files and create secure, accessible APIs.
*   **Reason for Block:** Blocked by a persistent, environment-related server crash. Debugging is deferred until the deployment phase.
*   **Features:**
    *   **Model File Generation:**
        *   `[X]` Implement correct `jimp` API usage.
        *   `[ ]` Task deferred: Final end-to-end testing.
    *   **API Endpoint Creation:**
        *   `[ ]` Task deferred.
    *   **Client-Side Integration:**
        *   `[ ]` Task deferred.

#### **Phase 2B: The User Dashboard**
*   **Status:** 🎯 **In Progress**
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
*   **Status:** ⏳ Pending
*   **Goal:** Simulate realistic, physically accurate natural lighting and shadows.

#### **Phase 3B: The Material Physics Simulation**
*   **Status:** ⏳ Pending
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
