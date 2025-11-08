import React from 'react';
import './CirculationAnalysis.css';

export default function CirculationAnalysis({ analysisData, width, height }) {
  if (!analysisData) {
    return <div className="analysis-placeholder">Click "Analyze Circulation" to see the results.</div>;
  }

  const { paths, keyNodes, gridWidth, gridHeight } = analysisData;

  if (!gridWidth || !gridHeight) {
    return <div className="analysis-error">Invalid analysis data received.</div>;
  }

  // Calculate scaling factors
  const scaleX = width / gridWidth;
  const scaleY = height / gridHeight;

  return (
    <div className="circulation-analysis-overlay" style={{ width, height }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="0"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" />
          </marker>
        </defs>

        {/* Draw Paths */}
        {paths && paths.map((path, index) => {
          const points = path.map(node => `${node.x * scaleX},${node.y * scaleY}`).join(' ');
          return (
            <polyline
              key={`path-${index}`}
              points={points}
              className="circulation-path"
              markerMid="url(#arrowhead)"
            />
          );
        })}

        {/* Draw Key Nodes */}
        {keyNodes && keyNodes.map((node, index) => (
          <circle
            key={`node-${index}`}
            cx={node.x * scaleX}
            cy={node.y * scaleY}
            r="8"
            className="key-node"
          />
        ))}
      </svg>
    </div>
  );
}
