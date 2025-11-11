// client/src/analysis/biophilic-analyzer.js
import { analyzeNaturalLight } from './light-analyzer'; // We'll reuse this

/**
 * Calculates a "View Quality Score" by analyzing line-of-sight to windows.
 * NOTE: This is a placeholder. A real implementation would require complex 3D
 * geometry analysis (raycasting from room centers to windows) that is best
 * performed within the Three.js scene itself. This simplified version
 * returns a dummy score.
 *
 * @param {object} modelData - The 3D model geometry.
 * @param {object[]} rooms - An array of room definitions with center points.
 * @param {object[]} windows - An array of window definitions.
 * @returns {number} A score from 0 to 100.
 */
function calculateViewQuality(modelData, rooms, windows) {
  // Placeholder logic
  if (!rooms || rooms.length === 0 || !windows || windows.length === 0) {
    return 0;
  }
  // Dummy score based on the number of rooms and windows
  const score = Math.min(100, (windows.length / rooms.length) * 50);
  return Math.round(score);
}


/**
 * Analyzes the biophilic design qualities of the space.
 * @param {object} modelData - The 3D model geometry.
 * @returns {Promise<object>} A promise that resolves with the analysis results.
 */
async function analyzeBiophilicDesign(modelData) {
  // 1. Get the Natural Light Score (reusing existing analyzer)
  const lightAnalysis = await analyzeNaturalLight(modelData);
  const naturalLightScore = lightAnalysis.naturalLightScore; // This is already on a scale of ~0-100

  // 2. Get the View Quality Score
  // Placeholders for room and window data, which would be identified from modelData in a real implementation
  const dummyRooms = [{ center: {} }, { center: {} }];
  const dummyWindows = [{}, {}, {}];
  const viewQualityScore = calculateViewQuality(modelData, dummyRooms, dummyWindows);

  // 3. Combine the scores into a final Biophilic Score (simple average for now)
  const biophilicScore = Math.round((naturalLightScore + viewQualityScore) / 2);

  return {
    naturalLightScore,
    viewQualityScore,
    biophilicScore,
  };
}

export { analyzeBiophilicDesign };
