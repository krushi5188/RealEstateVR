import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, useTexture } from '@react-three/drei';
import { VRButton, ARButton, XR, Controllers, Hands } from '@react-three/xr';
import * as THREE from 'three';
import AnalysisFeedback from './AnalysisFeedback';

// A custom component to render the 3D model from raw geometry data
function Model({ modelData }) {
    const [colorMap, roughnessMap, normalMap, aoMap] = useTexture([
        '/textures/wall/color.jpg',
        '/textures/wall/roughness.jpg',
        '/textures/wall/normal.jpg',
        '/textures/wall/ao.jpg',
      ]);

    const geometry = useMemo(() => {
        if (!modelData || !modelData.vertices || !modelData.faces) return null;

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(modelData.vertices, 3));
        geom.setIndex(new THREE.BufferAttribute(modelData.faces, 1));
        geom.computeVertexNormals();
        return geom;
    }, [modelData]);

    if (!geometry) return null;

    return (
        <mesh castShadow geometry={geometry}>
            <meshStandardMaterial
                map={colorMap}
                roughnessMap={roughnessMap}
                normalMap={normalMap}
                aoMap={aoMap}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

function Ground() {
    const [colorMap, roughnessMap, normalMap, aoMap] = useTexture([
      '/textures/floor/color.jpg',
      '/textures/floor/roughness.jpg',
      '/textures/floor/normal.jpg',
      '/textures/floor/ao.jpg',
    ]);

    return (
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial
          map={colorMap}
          roughnessMap={roughnessMap}
          normalMap={normalMap}
          aoMap={aoMap}
        />
      </mesh>
    );
  }

// The main VR Scene component
export default function VRScene({ modelData, analysis }) {
    return (
        <div style={{ position: 'relative', width: '100%', height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
            <AnalysisFeedback analysis={analysis} />
            <VRButton />
            <Canvas shadows camera={{ position: [0, 5, 15], fov: 50 }}>
                <XR>
                    <ambientLight intensity={0.5} />
                    <directionalLight
                        castShadow
                        position={[10, 20, 15]}
                        intensity={1.5}
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                        shadow-camera-far={50}
                        shadow-camera-left={-10}
                        shadow-camera-right={10}
                        shadow-camera-top={10}
                        shadow-camera-bottom={-10}
                    />

                    <Controllers />
                    <Hands />

                    <Model modelData={modelData} />

                    <Ground />

                    <OrbitControls />
                    <Grid infiniteGrid cellSize={1} cellThickness={1} />
                </XR>
            </Canvas>
        </div>
    );
}
