import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { VRButton, ARButton, XR, Controllers, Hands } from '@react-three/xr';
import * as THREE from 'three';

/**
 * Render a mesh from raw vertex and index arrays and prepare it for shadowed rendering.
 *
 * Creates a BufferGeometry from the provided modelData, computes vertex normals for correct shading,
 * and renders a white, double-sided MeshStandardMaterial mesh that casts shadows. If modelData is missing
 * or lacks required arrays, nothing is rendered.
 *
 * @param {{vertices: TypedArray, faces: TypedArray}} props.modelData - Geometry source where `vertices` is a flat XYZ float array (e.g., Float32Array) and `faces` is an index array (e.g., Uint16Array/Uint32Array).
 * @returns {JSX.Element|null} A mesh React element ready for inclusion in a three.js canvas, or `null` when geometry cannot be constructed.
 */
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
        <mesh castShadow geometry={geometry}>
            <meshStandardMaterial color="white" side={THREE.DoubleSide} />
        </mesh>
    );
}

/**
 * Render a VR/AR-capable 3D scene that displays a provided model with lighting, shadows, and XR controls.
 *
 * @param {Object} modelData - Geometry data for the scene model; expected to include `vertices` and `faces` arrays consumed by the Model component.
 * @returns {JSX.Element} The VR/AR scene element containing a VR entry button, a shadow-enabled Canvas wrapped in XR, scene lighting, input controllers and hands, the provided Model, a shadow-receiving ground plane, OrbitControls, and an infinite grid.
 */
export default function VRScene({ modelData }) {
    return (
        <div style={{ position: 'relative', width: '100%', height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
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

                    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                        <planeGeometry args={[500, 500]} />
                        <shadowMaterial opacity={0.5} />
                    </mesh>

                    <OrbitControls />
                    <Grid infiniteGrid cellSize={1} cellThickness={1} />
                </XR>
            </Canvas>
        </div>
    );
}