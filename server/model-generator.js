// --- Configuration Constants ---
const WALL_HEIGHT = 10;
const WALL_THICKNESS = 0.5;

/**
 * Generates a 3D model from structured wall data.
 * @param {object} wallData The structured data from the image processor.
 * @returns {object} A JSON object representing the 3D model.
 */
function generateModel(wallData) {
    const { walls, width, height } = wallData;
    const vertices = [];
    const faces = [];
    let vertexIndex = 0;

    // Normalize coordinates to be centered around the origin
    const offsetX = width / 2;
    const offsetY = height / 2;

    for (const wall of walls) {
        const { x1, y1, x2, y2 } = wall;

        // Normalize and scale coordinates
        const nx1 = (x1 - offsetX) * 0.1;
        const ny1 = (y1 - offsetY) * 0.1;
        const nx2 = (x2 - offsetX) * 0.1;
        const ny2 = (y2 - offsetY) * 0.1;

        const halfThick = WALL_THICKNESS / 2;
        let v1, v2, v3, v4, v5, v6, v7, v8;

        if (y1 === y2) { // Horizontal wall
            v1 = [nx1 - halfThick, 0, ny1];
            v2 = [nx2 + halfThick, 0, ny1];
            v3 = [nx2 + halfThick, WALL_HEIGHT, ny1];
            v4 = [nx1 - halfThick, WALL_HEIGHT, ny1];
            v5 = [nx1 - halfThick, 0, ny1 + WALL_THICKNESS];
            v6 = [nx2 + halfThick, 0, ny1 + WALL_THICKNESS];
            v7 = [nx2 + halfThick, WALL_HEIGHT, ny1 + WALL_THICKNESS];
            v8 = [nx1 - halfThick, WALL_HEIGHT, ny1 + WALL_THICKNESS];
        } else { // Vertical wall
            v1 = [nx1, 0, ny1 - halfThick];
            v2 = [nx1, 0, ny2 + halfThick];
            v3 = [nx1, WALL_HEIGHT, ny2 + halfThick];
            v4 = [nx1, WALL_HEIGHT, ny1 - halfThick];
            v5 = [nx1 + WALL_THICKNESS, 0, ny1 - halfThick];
            v6 = [nx1 + WALL_THICKNESS, 0, ny2 + halfThick];
            v7 = [nx1 + WALL_THICKNESS, WALL_HEIGHT, ny2 + halfThick];
            v8 = [nx1 + WALL_THICKNESS, WALL_HEIGHT, ny1 - halfThick];
        }

        const wallVertices = [v1, v2, v3, v4, v5, v6, v7, v8];
        vertices.push(...wallVertices.flat());

        const base = vertexIndex;
        const wallFaces = [
            // Front face
            base, base + 1, base + 2,
            base, base + 2, base + 3,
            // Back face
            base + 4, base + 5, base + 6,
            base + 4, base + 6, base + 7,
            // Left face
            base + 0, base + 4, base + 7,
            base + 0, base + 7, base + 3,
            // Right face
            base + 1, base + 5, base + 6,
            base + 1, base + 6, base + 2,
            // Top face
            base + 3, base + 2, base + 6,
            base + 3, base + 6, base + 7,
            // Bottom face
            base + 0, base + 1, base + 5,
            base + 0, base + 5, base + 4,
        ];
        faces.push(...wallFaces);
        vertexIndex += 8;
    }

    // Add a ground plane
    const groundSize = Math.max(width, height) * 0.1;
    const groundVertices = [
        -groundSize, -0.1, -groundSize,
         groundSize, -0.1, -groundSize,
         groundSize, -0.1,  groundSize,
        -groundSize, -0.1,  groundSize,
    ];
    vertices.push(...groundVertices);
    const groundBase = vertexIndex;
    faces.push(
        groundBase, groundBase + 1, groundBase + 2,
        groundBase, groundBase + 2, groundBase + 3
    );

    return {
        vertices: new Float32Array(vertices),
        faces: new Uint32Array(faces),
    };
}

module.exports = {
    generateModel,
};
