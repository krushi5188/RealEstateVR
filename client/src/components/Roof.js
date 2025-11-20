import React from 'react';
import * as THREE from 'three';

function Roof({ width, depth, height, type = 'Flat' }) {
  if (!width || !depth) return null;

  const roofHeight = 5; // Height of the pitched roof
  const overhang = 2; // Overhang on all sides

  const totalWidth = width + overhang * 2;
  const totalDepth = depth + overhang * 2;

  // Convert dimensions to scene units (0.1 scale)
  const w = totalWidth * 0.1;
  const d = totalDepth * 0.1;
  const h = roofHeight; // Height is usually already in scene units or proportional

  // Determine position: Centered horizontally, sitting at `height`
  // The floor generation centers the model at (0,0).
  const position = [0, height, 0];

  if (type === 'Flat') {
    return (
      <mesh position={position} receiveShadow castShadow>
        <boxGeometry args={[w, 0.5, d]} />
        <meshStandardMaterial color="#333" roughness={0.9} />
      </mesh>
    );
  } else if (type === 'Pitched') {
    // Create a simple prism
    // Using ConeGeometry with 4 sides is a quick way to make a pyramid/hip roof
    // For a gable roof, we'd need a custom shape extrusion. Let's stick to Hip Roof for "Pitched".
    return (
      <mesh position={[0, height + h/2, 0]} rotation={[0, Math.PI / 4, 0]} receiveShadow castShadow>
         <coneGeometry args={[Math.max(w, d) * 0.8, h, 4]} />
         <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
    );
  }

  return null;
}

export default Roof;
