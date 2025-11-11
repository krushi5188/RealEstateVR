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
    const origin = [room.center.x, 5, room.center.y]; // Assume eye-level height of 5

    for (const window of windows) {
        // For each window, cast a few rays towards its corners and center
        const targets = [
            [window.x1, 0, window.y1],
            [window.x2, 0, window.y2],
            [window.x1, 10, window.y1],
            [window.x2, 10, window.y2],
            [(window.x1 + window.x2) / 2, 5, (window.y1 + window.y2) / 2],
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
                    // A simple check to see if the intersection is between the room and the window
                    const distToIntersection = Math.sqrt(Math.pow(intersection[0] - origin[0], 2) + Math.pow(intersection[1] - origin[1], 2) + Math.pow(intersection[2] - origin[2], 2));
                    const distToTarget = Math.sqrt(Math.pow(target[0] - origin[0], 2) + Math.pow(target[1] - origin[1], 2) + Math.pow(target[2] - origin[2], 2));
                    if(distToIntersection < distToTarget - 0.1) { // -0.1 to account for floating point errors
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
 * Calculates a "Natural Light Score" for a single room.
 * @param {object} room - The room object, including its center point.
 * @param {Array<object>} windows - A list of all window objects.
 * @param {Array<number>} vertices - The vertices of the 3D model.
 * @param {Array<number>} faces - The faces of the 3D model.
 * @returns {number} A score from 0 to 100.
 */
function calculateNaturalLightForRoom(room, windows, vertices, faces) {
    let successfulRays = 0;
    const simulationSteps = 36; // One step for every 10 degrees of the sun's path
    const roomCenter = [room.center.x, 5, room.center.y];

    for (let i = 0; i < simulationSteps; i++) {
        const angle = (i / simulationSteps) * 2 * Math.PI;
        const sunPosition = [
            100 * Math.cos(angle), // Sun is far away
            50 + 40 * Math.sin(angle), // Sun rises and sets
            100 * Math.sin(angle),
        ];

        const dir = [roomCenter[0] - sunPosition[0], roomCenter[1] - sunPosition[1], roomCenter[2] - sunPosition[2]];
        let hitWindow = false;

        // Check if the ray from the sun to the room center passes through any window
        for(const window of windows) {
            const windowCenter = [(window.x1 + window.x2) / 2, 5, (window.y1 + window.y2) / 2];
            const tri = [
                [window.x1, 0, window.y1],
                [window.x2, 0, window.y2],
                [window.x1, 10, window.y1],
            ];
             const intersection = intersect([], sunPosition, dir, tri);
             if(intersection) {
                 hitWindow = true;
                 break;
             }
        }

        if(hitWindow) {
             let obstructed = false;
            // Now, check if anything is blocking the path from the window to the room
             for (let i = 0; i < faces.length; i += 3) {
                const tri = [
                    vertices.slice(faces[i] * 3, faces[i] * 3 + 3),
                    vertices.slice(faces[i+1] * 3, faces[i+1] * 3 + 3),
                    vertices.slice(faces[i+2] * 3, faces[i+2] * 3 + 3),
                ];
                const intersection = intersect([], sunPosition, dir, tri);
                if(intersection) {
                    obstructed = true;
                    break;
                }
            }

            if(!obstructed) {
                successfulRays++;
            }
        }
    }

    return Math.round((successfulRays / simulationSteps) * 100);
}


module.exports = { calculateViewQualityForRoom, calculateNaturalLightForRoom };

/**
 * Analyzes the biophilic design qualities of the space.
 * @param {object} modelData - The 3D model geometry, including rooms and windows.
 * @returns {Promise<object>} A promise that resolves with the analysis results.
 */
async function analyzeBiophilicDesign(modelData) {
    const { rooms, windows, vertices, faces } = modelData;
    const roomReports = [];
    let totalViewQuality = 0;
    let totalNaturalLight = 0;

    for (const room of rooms) {
        const viewQualityScore = calculateViewQualityForRoom(room, windows, vertices, faces);
        const naturalLightScore = calculateNaturalLightForRoom(room, windows, vertices, faces);
        const biophilicScore = Math.round((viewQualityScore + naturalLightScore) / 2);

        roomReports.push({
            roomId: room.id,
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
