import React, { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Interactive, useHitTest, useXR } from '@react-three/xr';

export default function ARPlacement({ children, onPlaced }) {
  const reticleRef = useRef();
  const [modelPosition, setModelPosition] = useState(null);
  const { isPresenting: xrIsPresenting, session } = useXR();

  const isAR = session && session.mode === 'immersive-ar';

  useHitTest((hitMatrix, hit) => {
    if (isAR && reticleRef.current) {
      reticleRef.current.matrix.copy(hitMatrix);
      // If we haven't placed the model yet, show the reticle
      if (!modelPosition) {
        reticleRef.current.visible = true;
      }
    }
  });

  const handleSelect = () => {
    if (isAR && reticleRef.current && reticleRef.current.visible) {
      const position = new THREE.Vector3();
      const rotation = new THREE.Quaternion();
      const scale = new THREE.Vector3();

      reticleRef.current.matrix.decompose(position, rotation, scale);

      setModelPosition(position);
      if (onPlaced) onPlaced(position);
    }
  };

  // If not in AR mode, just render children normally (for VR/3D view compatibility)
  if (!isAR) {
      return <>{children}</>;
  }

  return (
    <>
      {/* Reticle */}
      {!modelPosition && (
        <mesh ref={reticleRef} rotation-x={-Math.PI / 2} visible={false}>
          <ringGeometry args={[0.1, 0.25, 32]} />
          <meshBasicMaterial color="white" />
        </mesh>
      )}

      {/* Placement Interaction */}
      <Interactive onSelect={handleSelect}>
        {/* Invisible plane to catch taps. This ensures the raycaster has something to hit
            when the user taps the screen, triggering the onSelect event. */}
        {!modelPosition && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} visible={false}>
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial />
            </mesh>
        )}
      </Interactive>

      {/* Render Model at Placed Position */}
      {modelPosition && (
        <group position={modelPosition}>
          {children}
        </group>
      )}
    </>
  );
}
