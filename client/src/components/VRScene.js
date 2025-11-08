import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { VRButton, XR, DefaultXRController } from '@react-three/xr';
import * as THREE from 'three';

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
export default function VRScene({ modelData, material, sunCycle = false }) {
    return (
        <div style={{ position: 'relative', width: '100%', height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
            <VRButton />
            <Canvas shadows camera={{ position: [0, 5, 15] }}>
                <XR>
                    <ambientLight intensity={0.5} />
                    <Sun isCycling={sunCycle} />

                    <DefaultXRController />

                    <Model modelData={modelData} material={material} />

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
