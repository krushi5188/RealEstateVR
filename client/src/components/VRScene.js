import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { VRButton, XR, DefaultXRController } from '@react-three/xr';
import * as THREE from 'three';
import { CSG } from 'three-csg-ts';
import Staircase from './Staircase';
import Elevator from './Elevator';

// --- Staircase Tool ---
function StaircaseTool({ onAddStaircase }) {
  const [isPlacing, setIsPlacing] = useState(false);
  const [points, setPoints] = useState([]);

  const handleTogglePlacement = () => {
    setIsPlacing(!isPlacing);
    setPoints([]);
  };

  const handlePointSelect = (point) => {
    if (!isPlacing) return;
    const newPoints = [...points, point];
    setPoints(newPoints);
    if (newPoints.length === 2) {
      onAddStaircase(newPoints[0], newPoints[1]);
      setIsPlacing(false);
      setPoints([]);
    }
  };

  // This is a placeholder for the UI. We'll add the 3D interaction later.
  return (
    <div style={{ position: 'absolute', top: '80px', right: '20px', zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px' }}>
      <button onClick={handleTogglePlacement}>
        {isPlacing ? 'Cancel' : 'Add Staircase'}
      </button>
      {isPlacing && <p style={{color: 'white'}}>Click to select start and end points.</p>}
    </div>
  );
}


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
function Model({ modelData, material, staircases, elevators }) {
    const geometry = useMemo(() => {
        if (!modelData || !modelData.vertices || !modelData.faces) return null;

        let baseGeom = new THREE.BufferGeometry();
        baseGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(modelData.vertices), 3));
        baseGeom.setIndex(new THREE.BufferAttribute(new Uint32Array(modelData.faces), 1));
        baseGeom.computeVertexNormals();

        if ((staircases && staircases.length > 0) || (elevators && elevators.length > 0)) {
            let modelMesh = new THREE.Mesh(baseGeom);
            modelMesh.updateMatrix(); // Ensure the matrix is up to date

            if (staircases) {
                staircases.forEach(stair => {
                    const stairWidth = 4.0; // Must match Staircase.js
                    const stairLength = new THREE.Vector3(stair.end.x - stair.start.x, 0, stair.end.z - stair.start.z).length();

                    const holeGeom = new THREE.BoxGeometry(stairLength, 2, stairWidth); // Height of 2 should be enough to cut through a floor
                    const holeMesh = new THREE.Mesh(holeGeom);

                    // Position and rotate the hole to match the staircase
                    const midPoint = new THREE.Vector3().addVectors(stair.start, stair.end).multiplyScalar(0.5);
                    holeMesh.position.set(midPoint.x, stair.end.y, midPoint.z); // Position it at the upper floor level

                    const direction = new THREE.Vector3().subVectors(stair.end, stair.start);
                    const angle = Math.atan2(direction.z, direction.x);
                    holeMesh.rotation.y = -angle + Math.PI / 2;

                    holeMesh.updateMatrix();

                    // Perform CSG
                    modelMesh = CSG.subtract(modelMesh, holeMesh);
                });
            }

            if (elevators) {
                elevators.forEach(elevator => {
                    // Elevator shaft dimensions (must match Elevator.js roughly)
                    const shaftWidth = 6;
                    const shaftDepth = 6;

                    // Create a hole for the shaft
                    const holeGeom = new THREE.BoxGeometry(shaftWidth, 2, shaftDepth);
                    const holeMesh = new THREE.Mesh(holeGeom);

                    // Position the hole. Assuming elevator position is bottom-center of the shaft on current floor.
                    // We need to cut the ceiling (which is next floor's floor).
                    // Elevator height is passed as 10 usually.
                    const WALL_HEIGHT = 10;
                    holeMesh.position.set(elevator.position.x, elevator.position.y + WALL_HEIGHT, elevator.position.z);

                    holeMesh.updateMatrix();
                    modelMesh = CSG.subtract(modelMesh, holeMesh);
                });
            }

            return modelMesh.geometry;
        }

        return baseGeom;
    }, [modelData, staircases, elevators]);

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

function SceneContent({
    modelData, material, sunCycle, heldFurniture, handlePlaceFurniture, allFurniture, children, onTeleportReady,
    isStaircaseMode, staircasePoints, handleStaircasePointSelect, staircases, elevators
}) {
    const { camera, raycaster, scene } = useThree();

    const handleSceneClick = (event) => {
        if (!isStaircaseMode) return;

        // The intersection needs to be calculated based on the event,
        // which useThree doesn't directly provide in the click handler.
        // We'll assume the raycaster is updated based on mouse position internally by fiber/drei.
        const floor = scene.getObjectByName('floorPlane');
        if (floor) {
            const intersects = raycaster.intersectObject(floor);
            if (intersects.length > 0) {
                handleStaircasePointSelect(intersects[0].point);
            }
        }
    };

    const handleTeleport = (floorIndex) => {
        const WALL_HEIGHT = 10; // Must match server
        const targetY = (WALL_HEIGHT + 0.1) * floorIndex + 5; // +5 for a good viewing height

        // Simple animation
        const start = camera.position.clone();
        const end = new THREE.Vector3(camera.position.x, targetY, camera.position.z);
        let t = 0;
        const duration = 0.5; // seconds

        const animate = () => {
            t += 0.05 / duration;
            camera.position.lerpVectors(start, end, Math.min(t, 1));
            camera.lookAt(0, targetY - 5, 0); // Look at the floor level
            if (t < 1) requestAnimationFrame(animate);
        };
        animate();
    };

    // Pass the teleport function up to the App component
    React.useEffect(() => {
        if (onTeleportReady) {
            onTeleportReady(handleTeleport);
        }
    }, [handleTeleport, onTeleportReady]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <Sun isCycling={sunCycle} />
            <DefaultXRController />
            <Model modelData={modelData} material={material} staircases={staircases} elevators={elevators} />
            <PlacedFurniture items={allFurniture} />
            <FurniturePlacer heldFurniture={heldFurniture} onPlace={handlePlaceFurniture} placedItems={allFurniture} />
            {children}
            {/* Render the staircases */}
            {staircases.map((stair, index) => (
                <Staircase key={index} start={stair.start} end={stair.end} />
            ))}
            {/* Render detected elevators */}
            {elevators.map((elevator, index) => (
                <Elevator key={index} position={elevator.position} />
            ))}
            {/* Visual feedback for staircase points */}
            {staircasePoints.map((point, index) => (
                <mesh key={index} position={point}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color="red" />
                </mesh>
            ))}
            <mesh
                name="floorPlane"
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0, 0]}
                onClick={handleSceneClick}
                visible={false}
            >
                <planeGeometry args={[100, 100]} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <shadowMaterial opacity={0.3} />
            </mesh>
            <OrbitControls />
            <Grid infiniteGrid cellSize={1} cellThickness={1} />
        </>
    );
}


// The main VR Scene component
export default function VRScene({
    modelData, material, sunCycle = false, heldFurniture, setHeldFurniture,
    placedFurniture = [], floorLabels = [], onTeleportReady, children,
    isStaircaseMode, wallData
}) {
    const [internalPlacedFurniture, setInternalPlacedFurniture] = useState([]);
    const [staircases, setStaircases] = useState([]);
    const [elevators, setElevators] = useState([]);
    const [staircasePoints, setStaircasePoints] = useState([]);

    // --- Automatic Detection Logic ---
    React.useEffect(() => {
        if (wallData && wallData.rooms) {
            const detectedStaircases = [];
            const detectedElevators = [];
            const WALL_HEIGHT = 10; // Must match server

            wallData.rooms.forEach(room => {
                const x = room.center.x * 0.1;
                const z = room.center.y * 0.1;

                if (room.type === 'staircase') {
                     // Heuristic: Calculate a start and end point based on room center
                     // This is a simplification. Ideally, we'd use the room's orientation.
                     // For now, assume staircase goes UP from this room
                     const start = new THREE.Vector3(x - 2, 0, z);
                     const end = new THREE.Vector3(x + 2, WALL_HEIGHT, z);
                     detectedStaircases.push({ start, end });
                } else if (room.type === 'elevator') {
                    detectedElevators.push({ position: new THREE.Vector3(x, 0, z) });
                }
            });

            if (detectedStaircases.length > 0) {
                setStaircases(detectedStaircases);
            }
            if (detectedElevators.length > 0) {
                setElevators(detectedElevators);
            }
        }
    }, [wallData]);

    const handleStaircasePointSelect = (point) => {
        const newPoints = [...staircasePoints, point];
        if (newPoints.length === 2) {
            // We have two points, let's create a staircase
            setStaircases([...staircases, { start: newPoints[0], end: newPoints[1] }]);
            // Reset for the next one
            setStaircasePoints([]);
            // Potentially turn off staircase mode here as well
        } else {
            setStaircasePoints(newPoints);
        }
    };

    const handlePlaceFurniture = (position) => {
        if (heldFurniture) {
            setInternalPlacedFurniture([...internalPlacedFurniture, { ...heldFurniture, position }]);
            setHeldFurniture(null); // Clear the held item
        }
    };

    const allFurniture = useMemo(() => [...placedFurniture, ...internalPlacedFurniture], [placedFurniture, internalPlacedFurniture]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
            <VRButton />
            {/* The 2D UI for the tool is now in App.js, this placeholder is removed */}
            <Canvas shadows camera={{ position: [0, 5, 15] }}>
                <XR>
                    <SceneContent
                        modelData={modelData}
                        material={material}
                        sunCycle={sunCycle}
                        heldFurniture={heldFurniture}
                        handlePlaceFurniture={handlePlaceFurniture}
                        allFurniture={allFurniture}
                        onTeleportReady={onTeleportReady}
                        isStaircaseMode={isStaircaseMode}
                        staircasePoints={staircasePoints}
                        handleStaircasePointSelect={handleStaircasePointSelect}
                        staircases={staircases}
                        elevators={elevators}
                    >
                        {children}
                    </SceneContent>
                </XR>
            </Canvas>
        </div>
    );
}
