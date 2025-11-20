import React from 'react';
import * as THREE from 'three';

export default function Window({ width, height, position, rotation }) {
  const frameThickness = 0.2;
  const glassThickness = 0.05;

  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[width, height, frameThickness]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Glass */}
      <mesh>
        <boxGeometry args={[width - 0.2, height - 0.2, glassThickness]} />
        <meshPhysicalMaterial
          color="lightblue"
          transmission={0.9}
          opacity={0.5}
          transparent
          roughness={0}
          metalness={0}
        />
      </mesh>
    </group>
  );
}
