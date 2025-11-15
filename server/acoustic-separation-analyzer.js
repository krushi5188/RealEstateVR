// server/acoustic-separation-analyzer.js

/**
 * Analyzes the acoustic separation between rooms from wallData.
 * @param {object} wallData - Contains room definitions and wall segments.
 * @returns {object} An object containing a list of potential acoustic issues.
 */
function analyzeAcousticSeparation(wallData) {
  const { rooms, walls } = wallData;
  const issues = [];

  const noiseLevels = {
    Bedroom: 1, Office: 1,
    LivingRoom: 3, Kitchen: 3,
    Bathroom: 2, Default: 2,
  };

  // Helper to find adjacencies. A pair of walls are adjacent if they are back-to-back.
  const findAdjacencies = () => {
    const adjacencies = [];
    const WALL_THICKNESS_THRESHOLD = 10; // Max distance between back-to-back walls
    const MIN_OVERLAP_LENGTH = 1; // Minimum overlap to be considered adjacent

    for (let i = 0; i < walls.length; i++) {
      for (let j = i + 1; j < walls.length; j++) {
        const w1 = walls[i];
        const w2 = walls[j];

        if (w1.roomId === w2.roomId) continue;

        const roomA = rooms.find(r => r.id === w1.roomId);
        const roomB = rooms.find(r => r.id === w2.roomId);
        if (!roomA || !roomB) continue;

        const isW1Vertical = Math.abs(w1.start.x - w1.end.x) < 1;
        const isW2Vertical = Math.abs(w2.start.x - w2.end.x) < 1;
        const isW1Horizontal = Math.abs(w1.start.y - w1.end.y) < 1;
        const isW2Horizontal = Math.abs(w2.start.y - w2.end.y) < 1;

        let overlap = 0;

        // Case 1: Both walls are vertical
        if (isW1Vertical && isW2Vertical && Math.abs(w1.start.x - w2.start.x) < WALL_THICKNESS_THRESHOLD) {
          const y1_min = Math.min(w1.start.y, w1.end.y);
          const y1_max = Math.max(w1.start.y, w1.end.y);
          const y2_min = Math.min(w2.start.y, w2.end.y);
          const y2_max = Math.max(w2.start.y, w2.end.y);
          overlap = Math.max(0, Math.min(y1_max, y2_max) - Math.max(y1_min, y2_min));
        }
        // Case 2: Both walls are horizontal
        else if (isW1Horizontal && isW2Horizontal && Math.abs(w1.start.y - w2.start.y) < WALL_THICKNESS_THRESHOLD) {
          const x1_min = Math.min(w1.start.x, w1.end.x);
          const x1_max = Math.max(w1.start.x, w1.end.x);
          const x2_min = Math.min(w2.start.x, w2.end.x);
          const x2_max = Math.max(w2.start.x, w2.end.x);
          overlap = Math.max(0, Math.min(x1_max, x2_max) - Math.max(x1_min, x2_min));
        }

        if (overlap > MIN_OVERLAP_LENGTH) {
          // Found an adjacency, use wall1 for material properties (it's arbitrary)
          adjacencies.push({ roomA, roomB, wall: w1 });
        }
      }
    }
    // Deduplicate adjacencies (e.g., [A,B] and [B,A])
    const uniqueAdjacencies = [];
    const seenPairs = new Set();
    for(const adj of adjacencies) {
        const id1 = adj.roomA.id;
        const id2 = adj.roomB.id;
        const key = id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
        if (!seenPairs.has(key)) {
            uniqueAdjacencies.push(adj);
            seenPairs.add(key);
        }
    }
    return uniqueAdjacencies;
  };

  const adjacencies = findAdjacencies();

  for (const { roomA, roomB, wall } of adjacencies) {
    const roomALabel = roomA.label.split('_')[0];
    const roomBLabel = roomB.label.split('_')[0];

    const noiseDifference = Math.abs(
      (noiseLevels[roomALabel] || noiseLevels.Default) - (noiseLevels[roomBLabel] || noiseLevels.Default)
    );

    // Re-introduce material properties. Assume a default if not specified.
    const wallAcousticDampening = wall.material?.acoustic_dampening || 0.3;

    const transmissionScore = noiseDifference * (1 - wallAcousticDampening);

    if (transmissionScore > 1.0) {
      issues.push({
        featureId: `Wall between ${roomA.label} and ${roomB.label}`,
        message: `High potential for noise transmission between a ${roomALabel} and a ${roomBLabel}. Consider using materials with better acoustic dampening.`,
        severity: 'Medium',
        score: transmissionScore,
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

module.exports = { analyzeAcousticSeparation };
