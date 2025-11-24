import React from 'react';
import { Sky, Stars } from '@react-three/drei';

export default function EnvironmentController({ mode = 'Day' }) {
  return (
    <group>
      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#556B2F" roughness={1} /> {/* Olive Drab for grass */}
      </mesh>

      {/* Skybox / Lighting */}
      {mode === 'Day' && (
        <>
          <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} />
          <ambientLight intensity={0.6} />
        </>
      )}

      {mode === 'Sunset' && (
        <>
          <Sky sunPosition={[100, 2, 100]} turbidity={10} rayleigh={3} mieCoefficient={0.005} mieDirectionalG={0.7} />
          <ambientLight intensity={0.3} color="#ffaa00" />
        </>
      )}

      {mode === 'Night' && (
        <>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ambientLight intensity={0.1} color="#000033" />
          <fog attach="fog" args={['#000000', 10, 50]} />
        </>
      )}
    </group>
  );
}
