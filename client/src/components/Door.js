import React from 'react';

export default function Door({ width, height, position, rotation }) {
  const frameThickness = 0.3;
  const doorThickness = 0.1;

  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh position={[0, height/2, 0]}>
         {/* Simplified frame using three boxes or a shape, here just a placeholder frame box */}
         <boxGeometry args={[width + 0.2, height, frameThickness]} />
         <meshStandardMaterial color="#5D4037" />
      </mesh>
      {/* Door Panel */}
      <mesh position={[0, height/2, 0]}>
        <boxGeometry args={[width, height - 0.1, doorThickness]} />
        <meshStandardMaterial color="#8D6E63" />
      </mesh>
      {/* Handle */}
      <mesh position={[width/3, height/2, doorThickness/2 + 0.05]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="gold" />
      </mesh>
    </group>
  );
}
