import React, { useState, useEffect } from 'react';
import { calculateProjectCost } from '../utils/cost-estimator';

export default function CostEstimator({ projectData }) {
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    if (projectData) {
      const cost = calculateProjectCost(projectData);
      setEstimate(cost);
    }
  }, [projectData]);

  const handleExportBOM = () => {
    if (!estimate) return;

    const csvContent = "data:text/csv;charset=utf-8,"
        + "Item,Cost\n"
        + `Walls,${estimate.breakdown.walls.toFixed(2)}\n`
        + `Structure (Stairs/Elevators),${estimate.breakdown.structure.toFixed(2)}\n`
        + `Fixtures (Windows/Doors),${estimate.breakdown.fixtures.toFixed(2)}\n`
        + `Roof,${estimate.breakdown.roof.toFixed(2)}\n`
        + `TOTAL,${estimate.total.toFixed(2)}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bill_of_materials.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!estimate) return null;

  return (
    <div className="tool-card" style={{ marginTop: '10px', backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <h4>Cost Estimate</h4>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', marginBottom: '5px' }}>
        <span>Walls:</span>
        <span>${estimate.breakdown.walls.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', marginBottom: '5px' }}>
        <span>Struct:</span>
        <span>${estimate.breakdown.structure.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', marginBottom: '5px' }}>
        <span>Fixtures:</span>
        <span>${estimate.breakdown.fixtures.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', marginBottom: '5px' }}>
        <span>Roof:</span>
        <span>${estimate.breakdown.roof.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
      </div>
      <div style={{ borderTop: '1px solid #555', paddingTop: '5px', marginTop: '5px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
        <span>Total:</span>
        <span style={{ color: '#28a745' }}>${estimate.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
      <button
        onClick={handleExportBOM}
        style={{ width: '100%', marginTop: '10px', padding: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
      >
        Export BOM
      </button>
    </div>
  );
}
