import React from 'react';
import './RoofTool.css';

function RoofTool({ currentType, onSetType }) {
  return (
    <div className="tool-card roof-tool">
      <h4>Roof Generator</h4>
      <div className="tool-controls">
        <button
          className={currentType === 'Flat' ? 'active' : ''}
          onClick={() => onSetType('Flat')}
        >
          Flat Roof
        </button>
        <button
          className={currentType === 'Pitched' ? 'active' : ''}
          onClick={() => onSetType('Pitched')}
        >
          Pitched Roof
        </button>
        <button
          className={currentType === null ? 'active' : ''}
          onClick={() => onSetType(null)}
          style={{ backgroundColor: '#d9534f' }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default RoofTool;
