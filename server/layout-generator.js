// server/layout-generator.js

// --- Placement Rules ---
const RULES = {
  CLEARANCE: 36, // inches of walking space around major items
  CONVERSATION_DISTANCE_MAX: 120, // max 10 feet between seating
};

/**
 * Generates several procedural layouts for a given room and furniture set.
 * NOTE: This is a highly simplified placeholder. A real implementation would
 * involve a much more complex, constraint-based algorithm.
 * @param {object} layoutRequest - Contains room dimensions and a list of furniture.
 * @returns {object[]} A list of generated layouts.
 */
function generateLayouts(layoutRequest) {
  const { room, furniture } = layoutRequest;
  const layouts = [];

  // --- Layout 1: Simple Conversational Grouping ---
  const layout1 = [];
  let currentX = RULES.CLEARANCE;
  for (const item of furniture) {
    if (item.category === 'Seating') {
      layout1.push({
        ...item,
        position: { x: currentX, y: 0, z: RULES.CLEARANCE },
        rotation: 0, // Facing "forward"
      });
      currentX += item.dimensions.width + RULES.CLEARANCE;
    }
  }
  if (layout1.length > 0) layouts.push({ name: 'Simple Row', furniture: layout1 });


  // --- Layout 2: L-Shape Grouping ---
  const layout2 = [];
  let currentZ = RULES.CLEARANCE;
  let hasPlacedFirstSeating = false;
  for (const item of furniture) {
      if (item.category === 'Seating') {
          if (!hasPlacedFirstSeating) {
              layout2.push({ ...item, position: { x: RULES.CLEARANCE, y: 0, z: currentZ }, rotation: 90 });
              currentZ += item.dimensions.width + RULES.CLEARANCE;
              hasPlacedFirstSeating = true;
          } else {
              layout2.push({ ...item, position: { x: item.dimensions.width + RULES.CLEARANCE * 2, y: 0, z: RULES.CLEARANCE }, rotation: 0 });
          }
      }
  }
  if (layout2.length > 1) layouts.push({ name: 'L-Shape', furniture: layout2 });

  return { layouts };
}

module.exports = { generateLayouts };
