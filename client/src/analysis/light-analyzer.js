// client/src/analysis/light-analyzer.js

/**
 * A simplified representation of a window opening.
 * @param {number} x - The x-coordinate of the window's center.
 * @param {number} y - The y-coordinate of the window's center.
 * @param {number} z - The z-coordinate of the window's center.
 * @param {object} normal - The normal vector of the window's surface.
 * @param {number} area - The area of the window.
 */
class Window {
  constructor(x, y, z, normal, area) {
    this.position = { x, y, z };
    this.normal = normal; // Should be a normalized {x, y, z} object
    this.area = area;
  }
}

/**
 * Identifies window openings from the model geometry.
 * the geometry to find vertical openings in the walls.
 * @param {object} wallData - The 2D wall data from the server.
 * @returns {Window[]} An array of identified windows.
 */
function identifyWindows(wallData) {
    if (!wallData || !wallData.windows) return [];

    const windows = wallData.windows.map(win => {
        const centerX = (win.x1 + win.x2) / 2;
        const centerZ = (win.y1 + win.y2) / 2; // y in 2D is z in 3D
        const width = Math.abs(win.x2 - win.x1);
        const depth = Math.abs(win.y2 - win.y1);
        const area = (width > depth ? width : depth) * 5; // Assuming a height of 5 units

        let normal = { x: 0, y: 0, z: 0 };
        if (width > depth) { // Horizontal window
            normal.z = centerZ > 0 ? -1 : 1;
        } else { // Vertical window
            normal.x = centerX > 0 ? -1 : 1;
        }

        return new Window(centerX * 0.1, 5, centerZ * 0.1, normal, area);
    });

    return windows;
}

/**
 * Calculates the total light score for a given sun position and set of windows.
 * @param {object} sunPosition - The {x, y, z} position of the sun.
 * @param {Window[]} windows - An array of window objects.
 * @returns {number} The calculated light score for that moment.
 */
function calculateInstantaneousLight(sunPosition, windows) {
  let totalLight = 0;

  for (const window of windows) {
    // Calculate the vector from the window to the sun
    const lightVector = {
      x: sunPosition.x - window.position.x,
      y: sunPosition.y - window.position.y,
      z: sunPosition.z - window.position.z,
    };

    // Normalize the light vector
    const magnitude = Math.sqrt(lightVector.x**2 + lightVector.y**2 + lightVector.z**2);
    lightVector.x /= magnitude;
    lightVector.y /= magnitude;
    lightVector.z /= magnitude;

    // Calculate the dot product of the light vector and the window normal
    // This tells us how directly the light is hitting the window.
    const dotProduct = (lightVector.x * window.normal.x) +
                       (lightVector.y * window.normal.y) +
                       (lightVector.z * window.normal.z);

    // Only add light if it's coming from the front of the window
    if (dotProduct > 0) {
      // The light contribution is the dot product (angle) times the window area
      totalLight += dotProduct * window.area;
    }
  }

  return totalLight;
}

/**
 * Analyzes the natural light over a full day cycle.
 * @param {object} wallData - The 2D wall data from the server.
 * @returns {Promise<object>} A promise that resolves with the analysis results.
 */
async function analyzeNaturalLight(wallData) {
  const windows = identifyWindows(wallData);
  let cumulativeLightScore = 0;
  const simulationSteps = 100; // Number of steps in our simulated day

  for (let i = 0; i <= simulationSteps; i++) {
    const angle = (i / simulationSteps) * 2 * Math.PI;
    const sunPosition = {
      x: 20 * Math.cos(angle),
      z: 20 * Math.sin(angle),
      y: 15 + 5 * Math.sin(angle),
    };

    cumulativeLightScore += calculateInstantaneousLight(sunPosition, windows);
  }

  // Normalize the score to a more readable number
  const finalScore = Math.round((cumulativeLightScore / simulationSteps) * 10);

  return {
    naturalLightScore: finalScore,
    // In the future, this would also return a heatmap data structure.
  };
}

export { analyzeNaturalLight };
