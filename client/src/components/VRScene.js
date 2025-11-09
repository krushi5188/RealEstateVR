import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { VRButton, XR, DefaultXRController } from '@react-three/xr';
import * as THREE from 'three';

// --- Furniture Components ---

function PlacedFurniture({ items }) {
  const scaleFactor = 1 / 12; // inches to feet
  return (
    <group>
      {items.map((item, index) => (
        <mesh key={index} position={item.position}>
          <boxGeometry args={[item.dimensions.width * scaleFactor, item.dimensions.height * scaleFactor, item.dimensions.depth * scaleFactor]} />
          <meshStandardMaterial color="gray" />
        </mesh>
      ))}
    </group>
  );
}

function FurniturePlacer({ heldFurniture, onPlace, placedItems }) {
  const { raycaster, scene } = useThree();
  const [position, setPosition] = useState(new THREE.Vector3());
  const [canPlace, setCanPlace] = useState(true);
  const scaleFactor = 1 / 12;

  // Helper for AABB collision detection
  const checkCollision = (posA, dimA, posB, dimB) => {
    const boxA = new THREE.Box3().setFromCenterAndSize(posA, new THREE.Vector3(dimA.width * scaleFactor, dimA.height * scaleFactor, dimA.depth * scaleFactor));
    const boxB = new THREE.Box3().setFromCenterAndSize(posB, new THREE.Vector3(dimB.width * scaleFactor, dimB.height * scaleFactor, dimB.depth * scaleFactor));
    return boxA.intersectsBox(boxB);
  };

  useFrame(() => {
    if (!heldFurniture) return;

    const floor = scene.getObjectByName('floorPlane');
    if (floor) {
      const intersects = raycaster.intersectObject(floor);
      if (intersects.length > 0) {
        const newPos = intersects[0].point;
        setPosition(newPos);

        // Collision detection
        let collision = false;
        for (const item of placedItems) {
          if (checkCollision(newPos, heldFurniture.dimensions, item.position, item.dimensions)) {
            collision = true;
            break;
          }
        }
        setCanPlace(!collision);
      }
    }
  });

  if (!heldFurniture) return null;

  const { width, depth, height } = heldFurniture.dimensions;

  return (
    <mesh position={position} onClick={() => canPlace && onPlace(position)}>
      <boxGeometry args={[width * scaleFactor, height * scaleFactor, depth * scaleFactor]} />
      <meshStandardMaterial color={canPlace ? "lightblue" : "red"} transparent opacity={0.7} />
    </mesh>
  );
}


// A custom component to render the 3D model from raw geometry data
function Model({ modelData, material }) {
    const geometry = useMemo(() => {
        if (!modelData || !modelData.vertices || !modelData.faces) return null;

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(modelData.vertices), 3));
        geom.setIndex(new THREE.BufferAttribute(new Uint32Array(modelData.faces), 1));
        geom.computeVertexNormals();
        return geom;
    }, [modelData]);

    if (!geometry) return null;

    // Define default material properties
    const materialProps = {
        color: material?.color || 'white',
        roughness: material?.roughness ?? 0.8,
        metalness: material?.metalness ?? 0.1,
        side: THREE.DoubleSide,
    };

    return (
        <mesh geometry={geometry} castShadow receiveShadow>
            <meshStandardMaterial {...materialProps} />
        </mesh>
    );
}

function Sun({ isCycling }) {
    const lightRef = useRef();

    useFrame(({ clock }) => {
        if (isCycling && lightRef.current) {
            // Animate the sun in a circular path over, for example, a 60-second cycle
            const elapsedTime = clock.getElapsedTime();
            const angle = (elapsedTime % 60) / 60 * 2 * Math.PI; // Full circle every 60s
            lightRef.current.position.x = 20 * Math.cos(angle);
            lightRef.current.position.z = 20 * Math.sin(angle);
            lightRef.current.position.y = 15 + 5 * Math.sin(angle); // Sun rises and sets
        }
    });

    return (
        <directionalLight
            ref={lightRef}
            castShadow
            position={[10, 20, 15]}
            intensity={1.5}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.5}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
        />
    );
}

// The main VR Scene component
export default function VRScene({ modelData, material, sunCycle = false, heldFurniture, setHeldFurniture, children }) {
    const [placedFurniture, setPlacedFurniture] = useState([]);

    const handlePlaceFurniture = (position) => {
        if (heldFurniture) {
            setPlacedFurniture([...placedFurniture, { ...heldFurniture, position }]);
            setHeldFurniture(null); // Clear the held item
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
            <VRButton />
            <Canvas shadows camera={{ position: [0, 5, 15] }}>
                <XR>
                    <ambientLight intensity={0.5} />
                    <Sun isCycling={sunCycle} />

                    <DefaultXRController />

                    <Model modelData={modelData} material={material} />
                    <PlacedFurniture items={placedFurniture} />
                    <FurniturePlacer heldFurniture={heldFurniture} onPlace={handlePlaceFurniture} placedItems={placedFurniture} />
                    {children}

                    <mesh name="floorPlane" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} visible={false}>
                        <planeGeometry args={[100, 100]} />
                    </mesh>

                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                        <planeGeometry args={[100, 100]} />
                        <shadowMaterial opacity={0.3} />
                    </mesh>

                    <OrbitControls />
                    <Grid infiniteGrid cellSize={1} cellThickness={1} />
                </XR>
            </Canvas>
        </div>
    );
}
