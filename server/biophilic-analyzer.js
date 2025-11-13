// server/biophilic-analyzer.js
const intersect = require('ray-triangle-intersection');

/**
 * Calculates a "View Quality Score" for a single room.
 * @param {object} room - The room object, including its center point.
 * @param {Array<object>} windows - A list of all window objects.
 * @param {Array<number>} vertices - The vertices of the 3D model.
 * @param {Array<number>} faces - The faces of the 3D model.
 * @returns {number} A score from 0 to 100.
 */
function calculateViewQualityForRoom(room, windows, vertices, faces) {
    if (windows.length === 0) return 0;

    let totalRays = 0;
    let successfulRays = 0;
    const origin = [room.center.x * 0.1, 5, room.center.y * 0.1]; // Assume eye-level height of 5

    for (const window of windows) {
        // For each window, cast a few rays towards its corners and center
        const targets = [
            [window.x1 * 0.1, 0, window.y1 * 0.1],
            [window.x2 * 0.1, 0, window.y2 * 0.1],
            [window.x1 * 0.1, 10, window.y1 * 0.1],
            [window.x2 * 0.1, 10, window.y2 * 0.1],
            [((window.x1 + window.x2) / 2) * 0.1, 5, ((window.y1 + window.y2) / 2) * 0.1],
        ];

        for (const target of targets) {
            totalRays++;
            const dir = [target[0] - origin[0], target[1] - origin[1], target[2] - origin[2]];
            let obstructed = false;

            // Check for intersection with every triangle in the model
            for (let i = 0; i < faces.length; i += 3) {
                const tri = [
                    vertices.slice(faces[i] * 3, faces[i] * 3 + 3),
                    vertices.slice(faces[i+1] * 3, faces[i+1] * 3 + 3),
                    vertices.slice(faces[i+2] * 3, faces[i+2] * 3 + 3),
                ];

                const intersection = intersect([], origin, dir, tri);
                if (intersection) {
                    const distToIntersection = Math.sqrt(Math.pow(intersection[0] - origin[0], 2) + Math.pow(intersection[1] - origin[1], 2) + Math.pow(intersection[2] - origin[2], 2));
                    const distToTarget = Math.sqrt(Math.pow(target[0] - origin[0], 2) + Math.pow(target[1] - origin[1], 2) + Math.pow(target[2] - origin[2], 2));
                    if(distToIntersection < distToTarget - 0.1) {
                        obstructed = true;
                        break;
                    }
                }
            }

            if (!obstructed) {
                successfulRays++;
            }
        }
    }

    return totalRays > 0 ? Math.round((successfulRays / totalRays) * 100) : 0;
}


/**
 * Analyzes the biophilic design qualities of the space.
 * @param {object} modelData - The 3D model geometry and 2D wall data.
 * @returns {Promise<object>} A promise that resolves with the analysis results.
 */
async function analyzeBiophilicDesign(modelData) {
    const { wallData, model: { vertices, faces } } = modelData;
    const { rooms, windows } = wallData;
    const roomReports = [];
    let totalViewQuality = 0;
    let totalNaturalLight = 0; // Natural light calculation is complex, simplified for now.

    if (!rooms || rooms.length === 0) {
        return { report: { overallBiophilicScore: 0, rooms: [] } };
    }

    for (const room of rooms) {
        const viewQualityScore = calculateViewQualityForRoom(room, windows, vertices, faces);
        // Simplified Natural Light Score: proportional to number of windows
        const naturalLightScore = Math.min(100, (windows.length / 5) * 100);
        const biophilicScore = Math.round((viewQualityScore + naturalLightScore) / 2);

        roomReports.push({
            roomId: room.id,
            label: room.label,
            viewQualityScore,
            naturalLightScore,
            biophilicScore,
        });

        totalViewQuality += viewQualityScore;
        totalNaturalLight += naturalLightScore;
    }

    const overallBiophilicScore = Math.round((totalViewQuality / rooms.length + totalNaturalLight / rooms.length) / 2);

    return {
        report: {
            timestamp: new Date().toISOString(),
            overallBiophilicScore,
            rooms: roomReports,
        }
    };
}

module.exports = { analyzeBiophilicDesign };
