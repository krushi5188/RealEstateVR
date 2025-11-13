import React, { useState, useEffect } from 'react';
import './DesignPhilosophyInput.css';

export default function DesignPhilosophyInput({ wallData, onAnalyze }) {
  const [philosophy, setPhilosophy] = useState('Vastu');
  const [northAngle, setNorthAngle] = useState(0);
  const [isNorthDetected, setIsNorthDetected] = useState(false);

  useEffect(() => {
    if (wallData && wallData.detectedNorthVector) {
      // A simple mapping from vector to angle for our UI
      const { x, y } = wallData.detectedNorthVector;
      const angle = Math.round((Math.atan2(y, x) * 180) / Math.PI) + 90;
      setNorthAngle(angle);
      setIsNorthDetected(true);
    }
  }, [wallData]);

  const handleAnalysis = () => {
    if (!wallData || !wallData.rooms) {
      alert("No room data available for analysis.");
      return;
    }
    onAnalyze({
      philosophy,
      northAngle,
      rooms: wallData.rooms,
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
        {isNorthDetected && <p className="detected-message">We've automatically detected North. Adjust if needed.</p>}
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

      <button className="analysis-button" onClick={handleAnalysis}>
        Analyze Philosophy
      </button>
    </div>
  );
}
