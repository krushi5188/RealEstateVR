// --- Configuration Constants ---
const WALL_HEIGHT = 10;
const WALL_THICKNESS = 0.5;

/**
 * Generates a 3D model from structured wall data for multiple floors.
 * @param {Array<object>} floorPlanData An array of wall data objects, one for each floor.
 * @returns {object} A JSON object representing the combined 3D model.
 */
function generateModel(floorPlanData) {
    const vertices = [];
    const faces = [];
    let vertexIndex = 0;
    let yOffset = 0;

    for (const floorData of floorPlanData) {
        const { walls, width, height } = floorData;
        const offsetX = width / 2;
        const offsetY = height / 2;

        // --- Generate Floor ---
        const floorWidth = (width * 0.1) / 2;
        const floorDepth = (height * 0.1) / 2;
        const floorVertices = [
            [-floorWidth, yOffset, -floorDepth],
            [floorWidth, yOffset, -floorDepth],
            [floorWidth, yOffset, floorDepth],
            [-floorWidth, yOffset, floorDepth],
        ];
        vertices.push(...floorVertices.flat());
        const floorBase = vertexIndex;
        faces.push(
            floorBase, floorBase + 1, floorBase + 2,
            floorBase, floorBase + 2, floorBase + 3
        );
        vertexIndex += 4;


        // --- Generate Walls for the Current Floor ---
        for (const wall of walls) {
            const { x1, y1, x2, y2 } = wall;

            const nx1 = (x1 - offsetX) * 0.1;
            const ny1 = (y1 - offsetY) * 0.1;
            const nx2 = (x2 - offsetX) * 0.1;
            const ny2 = (y2 - offsetY) * 0.1;

            const halfThick = WALL_THICKNESS / 2;
            let v1, v2, v3, v4, v5, v6, v7, v8;

            if (y1 === y2) { // Horizontal wall
                v1 = [nx1 - halfThick, yOffset, ny1];
                v2 = [nx2 + halfThick, yOffset, ny1];
                v3 = [nx2 + halfThick, yOffset + WALL_HEIGHT, ny1];
                v4 = [nx1 - halfThick, yOffset + WALL_HEIGHT, ny1];
                v5 = [nx1 - halfThick, yOffset, ny1 + WALL_THICKNESS];
                v6 = [nx2 + halfThick, yOffset, ny1 + WALL_THICKNESS];
                v7 = [nx2 + halfThick, yOffset + WALL_HEIGHT, ny1 + WALL_THICKNESS];
                v8 = [nx1 - halfThick, yOffset + WALL_HEIGHT, ny1 + WALL_THICKNESS];
            } else { // Vertical wall
                v1 = [nx1, yOffset, ny1 - halfThick];
                v2 = [nx1, yOffset, ny2 + halfThick];
                v3 = [nx1, yOffset + WALL_HEIGHT, ny2 + halfThick];
                v4 = [nx1, yOffset + WALL_HEIGHT, ny1 - halfThick];
                v5 = [nx1 + WALL_THICKNESS, yOffset, ny1 - halfThick];
                v6 = [nx1 + WALL_THICKNESS, yOffset, ny2 + halfThick];
                v7 = [nx1 + WALL_THICKNESS, yOffset + WALL_HEIGHT, ny2 + halfThick];
                v8 = [nx1 + WALL_THICKNESS, yOffset + WALL_HEIGHT, ny1 - halfThick];
            }

            const wallVertices = [v1, v2, v3, v4, v5, v6, v7, v8];
            vertices.push(...wallVertices.flat());

            const base = vertexIndex;
            const wallFaces = [
                base, base + 1, base + 2, base, base + 2, base + 3, // Front
                base + 4, base + 5, base + 6, base + 4, base + 6, base + 7, // Back
                base + 0, base + 4, base + 7, base + 0, base + 7, base + 3, // Left
                base + 1, base + 5, base + 6, base + 1, base + 6, base + 2, // Right
                base + 3, base + 2, base + 6, base + 3, base + 6, base + 7, // Top
                base + 0, base + 1, base + 5, base + 0, base + 5, base + 4, // Bottom
            ];
            faces.push(...wallFaces);
            vertexIndex += 8;
        }

        // Increment Y-offset for the next floor.
        // We add a small gap for visual separation, which could also be the ceiling/floor thickness.
        yOffset += WALL_HEIGHT + 0.1;
    }

    return {
        vertices: new Float32Array(vertices),
        faces: new Uint32Array(faces),
    };
}

module.exports = {
    generateModel,
};
