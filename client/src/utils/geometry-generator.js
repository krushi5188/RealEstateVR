import * as THREE from 'three';

// --- Standard Architectural Dimensions (in feet) ---
const RISER_HEIGHT = 7 / 12; // 7 inches
const TREAD_DEPTH = 11 / 12; // 11 inches
const STAIR_WIDTH = 3; // 3 feet

/**
 * Procedurally generates a straight staircase mesh.
 * @param {THREE.Vector3} start - The starting point of the staircase on the lower floor.
 * @param {THREE.Vector3} end - The ending point of the staircase on the upper floor (ceiling).
 * @returns {THREE.BufferGeometry}
 */
export function createStaircaseGeometry(start, end) {
  const geom = new THREE.BufferGeometry();
  const vertices = [];
  const faces = [];
  let vertexIndex = 0;

  const run = end.z - start.z; // Assuming stairs run along the Z axis for simplicity
  const rise = end.y - start.y;
  const numSteps = Math.ceil(rise / RISER_HEIGHT);
  const actualRiserHeight = rise / numSteps;

  for (let i = 0; i < numSteps; i++) {
    const stepY = i * actualRiserHeight;
    const stepZ = (i / numSteps) * run;

    // Riser
    const v1 = [start.x - STAIR_WIDTH / 2, start.y + stepY, start.z + stepZ];
    const v2 = [start.x + STAIR_WIDTH / 2, start.y + stepY, start.z + stepZ];
    const v3 = [start.x + STAIR_WIDTH / 2, start.y + stepY + actualRiserHeight, start.z + stepZ];
    const v4 = [start.x - STAIR_WIDTH / 2, start.y + stepY + actualRiserHeight, start.z + stepZ];

    vertices.push(...v1, ...v2, ...v3, ...v4);
    faces.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);
    faces.push(vertexIndex, vertexIndex + 2, vertexIndex + 3);
    vertexIndex += 4;

    // Tread
    const v5 = [start.x - STAIR_WIDTH / 2, start.y + stepY + actualRiserHeight, start.z + stepZ];
    const v6 = [start.x + STAIR_WIDTH / 2, start.y + stepY + actualRiserHeight, start.z + stepZ];
    const v7 = [start.x + STAIR_WIDTH / 2, start.y + stepY + actualRiserHeight, start.z + stepZ - TREAD_DEPTH];
    const v8 = [start.x - STAIR_WIDTH / 2, start.y + stepY + actualRiserHeight, start.z + stepZ - TREAD_DEPTH];

    vertices.push(...v5, ...v6, ...v7, ...v8);
    faces.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);
    faces.push(vertexIndex, vertexIndex + 2, vertexIndex + 3);
    vertexIndex += 4;
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(faces);
  geom.computeVertexNormals();
  return geom;
}
