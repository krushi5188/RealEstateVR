import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { VRButton, ARButton, XR } from '@react-three/xr';
import { Controllers, Hands } from '@react-three/xr';
import * as THREE from 'three';

// A custom component to render the 3D model from raw geometry data
function Model({ modelData }) {
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
        <mesh geometry={geometry}>
            <meshStandardMaterial color="white" side={THREE.DoubleSide} />
        </mesh>
    );
}

// The main VR Scene component
export default function VRScene({ modelData }) {
    return (
        <div style={{ position: 'relative', width: '100%', height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
            <VRButton />
            <Canvas camera={{ position: [0, 5, 15] }}>
                <XR>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 15, 10]} />

                    <Controllers />
                    <Hands />

                    <Model modelData={modelData} />

                    <OrbitControls />
                    <Grid infiniteGrid cellSize={1} cellThickness={1} />
                </XR>
            </Canvas>
        </div>
    );
}
