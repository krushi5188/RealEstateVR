import React from 'react';
import * as THREE from 'three';
import { useMemo } from 'react';

function Staircase({ start, end }) {
  const geometry = useMemo(() => {
    // --- Basic Calculations ---
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const height = end.y - start.y;
    const horizontalDirection = new THREE.Vector3(direction.x, 0, direction.z).normalize();
    const angle = Math.atan2(horizontalDirection.z, horizontalDirection.x);

    // --- Staircase Parameters (customize as needed) ---
    const stepHeight = 0.6; // in feet (e.g., 7.2 inches)
    const stepDepth = 1.0;  // in feet (e.g., 12 inches)
    const staircaseWidth = 4.0; // in feet

    const numSteps = Math.floor(Math.abs(height) / stepHeight);
    const actualStepHeight = height / numSteps;
    const actualStepDepth = length / numSteps;

    // --- Create the Staircase Shape ---
    const shape = new THREE.Shape();

    // Start at the base
    shape.moveTo(0, 0);

    // Create the steps
    for (let i = 1; i <= numSteps; i++) {
      shape.lineTo(i * actualStepDepth, (i - 1) * actualStepHeight);
      shape.lineTo(i * actualStepDepth, i * actualStepHeight);
    }
    // Finish the top of the last step
    shape.lineTo((numSteps + 1) * actualStepDepth, numSteps * actualStepHeight);

    // Create the bottom profile
    shape.lineTo((numSteps + 1) * actualStepDepth, 0); // Straight line back to the bottom
    shape.closePath();


    const extrudeSettings = {
      steps: 1,
      depth: staircaseWidth,
      bevelEnabled: false,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // The shape is created along the X/Y axis, so we need to position and rotate it correctly.
    // We'll handle the rotation and positioning in the mesh component itself.
    return geom;
  }, [start, end]);

  if (!start || !end) return null;

  // --- Positioning and Rotation ---
  // The geometry is extruded along the Z-axis, but we need to align it with the direction vector.
  const direction = new THREE.Vector3().subVectors(end, start);
  const horizontalLength = new THREE.Vector3(direction.x, 0, direction.z).length();
  const rotationY = Math.atan2(direction.z, direction.x);

  const position = new THREE.Vector3(start.x, start.y, start.z);

  // We need to adjust the position because the extrusion happens from the origin.
  const halfWidth = 4.0 / 2; // staircaseWidth / 2
  const offset = new THREE.Vector3(-halfWidth * Math.sin(rotationY), 0, halfWidth * Math.cos(rotationY));
  position.add(offset);


  return (
    <mesh
      geometry={geometry}
      position={position}
      rotation={[0, -rotationY + Math.PI / 2, 0]} // Rotate to align with the direction
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="sandybrown" side={THREE.DoubleSide} />
    </mesh>
  );
}

export default Staircase;
