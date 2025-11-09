// server/accessibility-auditor.js

// --- Accessibility Rules ---

const RULES = {
  MIN_DOORWAY_WIDTH: 32, // inches
  MIN_HALLWAY_WIDTH: 36, // inches
  BATHROOM_TURNING_RADIUS: 30, // inches (for a 60-inch diameter circle)
};

// --- Audit Logic ---

/**
 * Identifies architectural features like doors and hallways from model data.
 * NOTE: This is a placeholder. A real implementation will need to parse the geometry
 * to recognize these features based on their shape and context.
 * @param {object} modelData - The 3D model geometry.
 * @returns {{doors: object[], hallways: object[]}}
 */
function identifyFeatures(modelData) {
  // Dummy features for now.
  return {
    doors: [
      { id: 'Front Door', width: 36 },
      { id: 'Bedroom Door', width: 30 }, // This one should fail
      { id: 'Bathroom Door', width: 32 },
    ],
    hallways: [
      { id: 'Main Hallway', width: 40 },
      { id: 'Narrow Hall to Bedroom', width: 34 }, // This one should fail
    ],
    bathrooms: [
      // A bathroom is defined by a bounding box
      { id: 'Main Bathroom', bounds: { minX: 100, minY: 100, maxX: 180, maxY: 180 } }, // 80x80, should be ok
      { id: 'Powder Room', bounds: { minX: 200, minY: 200, maxX: 240, maxY: 240 } }, // 40x40, should fail
    ],
  };
}


/**
 * Audits the identified architectural features against accessibility standards.
 * @param {object} modelData - The 3D model geometry.
 * @returns {object[]} A list of compliance issues.
 */
function auditAccessibility(modelData) {
  const features = identifyFeatures(modelData);
  const issues = [];

  // 1. Audit Doors
  for (const door of features.doors) {
    if (door.width < RULES.MIN_DOORWAY_WIDTH) {
      issues.push({
        featureId: door.id,
        type: 'Door',
        message: `Doorway is ${door.width}" wide. Recommended minimum is ${RULES.MIN_DOORWAY_WIDTH}".`,
        severity: 'High',
      });
    }
  }

  // 2. Audit Hallways
  for (const hallway of features.hallways) {
    if (hallway.width < RULES.MIN_HALLWAY_WIDTH) {
      issues.push({
        featureId: hallway.id,
        type: 'Hallway',
        message: `Hallway is ${hallway.width}" wide. Recommended minimum is ${RULES.MIN_HALLWAY_WIDTH}".`,
        severity: 'Medium',
      });
    }
  }

  // 3. Audit Bathroom Turning Space
  for (const bathroom of features.bathrooms) {
    const width = bathroom.bounds.maxX - bathroom.bounds.minX;
    const depth = bathroom.bounds.maxY - bathroom.bounds.minY;
    if (width < RULES.BATHROOM_TURNING_RADIUS * 2 || depth < RULES.BATHROOM_TURNING_RADIUS * 2) {
         issues.push({
            featureId: bathroom.id,
            type: 'Bathroom',
            message: `Bathroom dimensions (${width}"x${depth}") may not provide a ${RULES.BATHROOM_TURNING_RADIUS * 2}" diameter clear turning space.`,
            severity: 'High',
         });
    }
  }

  return {
    report: {
      timestamp: new Date().toISOString(),
      issueCount: issues.length,
      issues: issues,
    }
  };
}

module.exports = { auditAccessibility };
