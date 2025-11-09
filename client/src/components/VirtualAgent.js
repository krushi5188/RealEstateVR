import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function VirtualAgent({ path, speed = 2 }) {
  const agentRef = useRef();
  const [currentPath, setCurrentPath] = useState(path);
  const [targetIndex, setTargetIndex] = useState(1);

  useEffect(() => {
    // Reset the animation when the path changes
    setCurrentPath(path);
    setTargetIndex(1);
    if (agentRef.current && path && path.length > 0) {
      agentRef.current.position.set(path[0].x, 0.5, path[0].z);
    }
  }, [path]);

  useFrame((_, delta) => {
    if (!agentRef.current || !currentPath || targetIndex >= currentPath.length) {
      return; // Animation is finished or not ready
    }

    const targetPosition = new THREE.Vector3(currentPath[targetIndex].x, 0.5, currentPath[targetIndex].z);
    const currentPosition = agentRef.current.position;

    const distance = currentPosition.distanceTo(targetPosition);

    if (distance < 0.1) {
      // Reached the target, move to the next one
      setTargetIndex(targetIndex + 1);
    } else {
      // Move towards the target
      const direction = targetPosition.clone().sub(currentPosition).normalize();
      agentRef.current.position.add(direction.multiplyScalar(speed * delta));
    }
  });

  if (!path || path.length === 0) {
    return null;
  }

  return (
    <mesh ref={agentRef} castShadow>
      <capsuleGeometry args={[0.2, 1.0, 4, 8]} />
      <meshStandardMaterial color="royalblue" />
    </mesh>
  );
}
