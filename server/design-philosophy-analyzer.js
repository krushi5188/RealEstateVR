// server/design-philosophy-analyzer.js

// --- Rule Sets ---

const VASTU_RULES = {
  // Zone definitions (0 degrees is North)
  zones: {
    North: [337.5, 22.5],
    NorthEast: [22.5, 67.5],
    East: [67.5, 112.5],
    SouthEast: [112.5, 157.5],
    South: [157.5, 202.5],
    SouthWest: [202.5, 247.5],
    West: [247.5, 292.5],
    NorthWest: [292.5, 337.5],
  },
  // Ideal room placements
  placements: {
    Kitchen: 'SouthEast',
    MasterBedroom: 'SouthWest',
    LivingRoom: 'North',
    Bathroom: 'NorthWest',
  },
};

const FENG_SHUI_RULES = {
  // More complex; would involve Bagua map, elements, etc.
  // Placeholder for now.
};

// --- Analysis Logic ---

/**
 * Determines the zone (e.g., North, SouthEast) of a room based on its angle from the center.
 * @param {number} angle - The angle of the room's center in degrees from North.
 * @param {object} rules - The rule set to use (e.g., VASTU_RULES).
 * @returns {string} The name of the zone.
 */
function getZone(angle, rules) {
  for (const zone in rules.zones) {
    const [start, end] = rules.zones[zone];
    if (start > end) { // Handles the North zone crossing 360/0 degrees
      if (angle >= start || angle < end) return zone;
    } else {
      if (angle >= start && angle < end) return zone;
    }
  }
  return 'Center';
}

/**
 * Analyzes the layout based on a chosen design philosophy.
 * @param {object} layoutData - Contains room labels, positions, and North orientation.
 * @returns {object} A compliance report.
 */
function analyzeDesignPhilosophy(layoutData) {
  const { philosophy, rooms, northAngle } = layoutData;
  const issues = [];
  let score = 100;

  let rules;
  if (philosophy === 'Vastu') {
    rules = VASTU_RULES;
  } else {
    return { report: { issues: [{ message: 'Selected philosophy is not yet supported.' }] } };
  }

  // Calculate the center of the house (simple average for now)
  let centerX = 0, centerY = 0;
  rooms.forEach(room => {
    centerX += room.center.x;
    centerY += room.center.y;
  });
  centerX /= rooms.length;
  centerY /= rooms.length;

  for (const room of rooms) {
    // Standard Cartesian coordinates for angle calculation
    const dx = room.center.x - centerX;
    const dy = room.center.y - centerY;

    // Calculate angle in degrees (0 is East), then adjust so 0 is North
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    angle = (450 - angle) % 360; // Convert to compass bearing (0-360, 0=N)

    // Apply the user-defined North rotation
    angle = (angle - northAngle + 360) % 360;

    const zone = getZone(angle, rules);
    const idealZone = rules.placements[room.label];

    if (idealZone && zone !== idealZone) {
      issues.push({
        featureId: room.label,
        message: `The ${room.label} is in the ${zone} zone. The ideal zone is ${idealZone}.`,
        severity: 'Medium',
      });
      score -= 20; // Deduct points for each misplaced room
    }
  }

  return {
    report: {
      philosophy,
      complianceScore: Math.max(0, score),
      issueCount: issues.length,
      issues,
    }
  };
}

module.exports = { analyzeDesignPhilosophy };
