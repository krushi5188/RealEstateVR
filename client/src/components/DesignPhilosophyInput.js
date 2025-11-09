import React, { useState } from 'react';
import './DesignPhilosophyInput.css';

export default function DesignPhilosophyInput({ onAnalyze }) {
  const [philosophy, setPhilosophy] = useState('Vastu');
  const [northAngle, setNorthAngle] = useState(0);

  const handleAnalysis = () => {
    // Placeholder for room data. In a real implementation, this would
    // come from a UI where the user draws and labels rooms.
    const dummyRooms = [
      { label: 'Kitchen', center: { x: 400, y: 400 } },
      { label: 'MasterBedroom', center: { x: 100, y: 100 } },
      { label: 'LivingRoom', center: { x: 100, y: 400 } },
    ];

    onAnalyze({
      philosophy,
      northAngle,
      rooms: dummyRooms,
    });
  };

  return (
    <div className="design-philosophy-input">
      <h4>Design Philosophy Analysis</h4>

      <div className="setting">
        <label>Philosophy:</label>
        <select value={philosophy} onChange={(e) => setPhilosophy(e.target.value)}>
          <option value="Vastu">Vastu Shastra</option>
          <option value="FengShui" disabled>Feng Shui (Coming Soon)</option>
        </select>
      </div>

      <div className="setting">
        <label>Set North:</label>
        <div className="compass-container">
          <div
            className="compass-rose"
            style={{ transform: `rotate(${northAngle}deg)` }}
          >
            N
          </div>
          <input
            type="range"
            min="0"
            max="359"
            value={northAngle}
            onChange={(e) => setNorthAngle(parseInt(e.target.value, 10))}
            className="angle-slider"
          />
        </div>
      </div>

      <div className="room-editor-placeholder">
        <p>Room definition UI coming soon.</p>
      </div>

      <button className="analysis-button" onClick={handleAnalysis}>
        Analyze Philosophy
      </button>
    </div>
  );
}
