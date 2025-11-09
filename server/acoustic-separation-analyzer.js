// server/acoustic-separation-analyzer.js

/**
 * Analyzes the acoustic separation between rooms to identify potential noise leaks.
 * @param {object} layoutData - Contains room definitions, adjacencies, and material properties.
 * @returns {object} An object containing a list of potential acoustic issues.
 */
function analyzeAcousticSeparation(layoutData) {
  const { rooms, adjacencies } = layoutData;
  const issues = [];

  // Noise level definitions (e.g., 1 = Quiet, 2 = Normal, 3 = Noisy)
  const noiseLevels = {
    Bedroom: 1,
    Office: 1,
    LivingRoom: 3,
    Kitchen: 3,
    Bathroom: 2,
  };

  for (const adjacency of adjacencies) {
    const roomA = rooms.find(r => r.id === adjacency.roomA);
    const roomB = rooms.find(r => r.id === adjacency.roomB);

    if (!roomA || !roomB) continue;

    const noiseDifference = Math.abs(
      (noiseLevels[roomA.label] || 2) - (noiseLevels[roomB.label] || 2)
    );

    // Get the acoustic dampening of the shared wall's material (placeholder)
    const wallAcousticDampening = adjacency.wallMaterial.acoustic_dampening || 0.5; // Default dampening

    // A high noise difference combined with low dampening is a potential issue.
    const transmissionScore = noiseDifference * (1 - wallAcousticDampening);

    if (transmissionScore > 1.0) { // Threshold for a significant issue
      issues.push({
        featureId: `Wall between ${roomA.label} and ${roomB.label}`,
        message: `High potential for noise transmission between a noisy room (${roomA.label}) and a quiet room (${roomB.label}). Consider using a material with better acoustic dampening.`,
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
