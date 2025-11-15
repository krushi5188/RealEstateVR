import React from 'react';

function StaircaseTool({ onActivate }) {
  return (
    <div className="tool-card">
      <h4>Staircase Tool</h4>
      <p>Connect floors by adding a staircase.</p>
      <button className="tool-button" onClick={onActivate}>
        Add Stairs
      </button>
    </div>
  );
}

export default StaircaseTool;
