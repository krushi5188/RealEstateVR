import React from 'react';
import * as THREE from 'three';

function Elevator({ position, height = 10 }) {
  // Simple representation: A box representing the elevator shaft/cabin
  // In a real app, this would be more detailed (doors, interior).
  const width = 6; // feet
  const depth = 6; // feet

  // Center the box vertically on the floor height
  const yPos = position.y + height / 2;

  return (
    <group position={[position.x, yPos, position.z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="silver" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Add a visual door marker */}
      <mesh position={[0, 0, depth / 2 + 0.1]}>
        <planeGeometry args={[4, 7]} />
        <meshStandardMaterial color="darkgrey" />
      </mesh>
    </group>
  );
}

export default Elevator;
