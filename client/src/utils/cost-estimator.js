// client/src/utils/cost-estimator.js

// --- Unit Costs (USD) ---
const COSTS = {
  WALL_HEIGHT: 10, // feet
  STAIRCASE_UNIT: 2500.00,
  ELEVATOR_UNIT: 25000.00,
  WINDOW_UNIT: 400.00,
  DOOR_UNIT: 250.00,
  ROOF_SQFT_FLAT: 15.00,
  ROOF_SQFT_PITCHED: 25.00,
  DEFAULT_WALL_SQFT: 5.00, // Fallback if no material selected
};

/**
 * Calculates the estimated cost of the project.
 * @param {object} data - The project data.
 * @param {object[]} data.wallData - Array of floor data objects.
 * @param {object} data.material - The selected wall/floor material.
 * @param {object[]} data.staircases - Detected staircases.
 * @param {object[]} data.elevators - Detected elevators.
 * @param {object[]} data.windows - Detected windows.
 * @param {object[]} data.doors - Detected doors.
 * @param {string} data.roofType - 'Flat' or 'Pitched'.
 * @returns {object} Breakdown of costs.
 */
export function calculateProjectCost(data) {
  let totalCost = 0;
  const breakdown = {
    walls: 0,
    structure: 0,
    roof: 0,
    fixtures: 0,
  };

  const { wallData, material, roofType } = data;
  const floors = Array.isArray(wallData) ? wallData : [wallData];
  const wallPrice = material ? material.price_per_sqft : COSTS.DEFAULT_WALL_SQFT;

  let totalStairs = 0;
  let totalElevators = 0;
  let totalWindows = 0;
  let totalDoors = 0;

  // 1. Calculate Wall Cost & Count Features
  let totalWallLength = 0;
  floors.forEach(floor => {
    if (floor.walls) {
      floor.walls.forEach(wall => {
        const length = Math.sqrt(Math.pow(wall.x2 - wall.x1, 2) + Math.pow(wall.y2 - wall.y1, 2));
        totalWallLength += length;
      });
    }

    // Count features directly from wallData (Auto-detected)
    if (floor.rooms) {
        floor.rooms.forEach(room => {
            if (room.type === 'staircase') totalStairs++;
            if (room.type === 'elevator') totalElevators++;
        });
    }
    if (floor.windows) totalWindows += floor.windows.length;
    if (floor.doors) totalDoors += floor.doors.length;
  });

  // Convert pixels to feet (0.1 scale factor)
  const wallArea = (totalWallLength * 0.1) * COSTS.WALL_HEIGHT;
  breakdown.walls = wallArea * wallPrice;

  // 2. Calculate Structure Cost (Stairs & Elevators)
  breakdown.structure += totalStairs * COSTS.STAIRCASE_UNIT;
  breakdown.structure += totalElevators * COSTS.ELEVATOR_UNIT;

  // 3. Calculate Fixtures Cost (Windows & Doors)
  breakdown.fixtures += totalWindows * COSTS.WINDOW_UNIT;
  breakdown.fixtures += totalDoors * COSTS.DOOR_UNIT;

  // 4. Calculate Roof Cost
  if (roofType && floors.length > 0) {
      const topFloor = floors[floors.length - 1];
      const roofArea = (topFloor.width * 0.1) * (topFloor.height * 0.1);
      const roofUnitCost = roofType === 'Pitched' ? COSTS.ROOF_SQFT_PITCHED : COSTS.ROOF_SQFT_FLAT;
      breakdown.roof = roofArea * roofUnitCost;
  }

  totalCost = breakdown.walls + breakdown.structure + breakdown.roof + breakdown.fixtures;

  return {
    total: totalCost,
    breakdown,
    currency: 'USD'
  };
}
