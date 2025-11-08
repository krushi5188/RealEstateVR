import React from 'react';
import './NaturalLightAnalysis.css';

export default function NaturalLightAnalysis({ analysisResult, onStartAnalysis }) {
  return (
    <div className="natural-light-analysis-container">
      {analysisResult ? (
        <div className="analysis-results">
          <h3>Natural Light Analysis</h3>
          <div className="score-container">
            <span className="score-label">Overall Light Score</span>
            <span className="score-value">{analysisResult.naturalLightScore} / 100</span>
          </div>
          <p className="analysis-details">
            This score represents the average amount of natural light the interior receives over a full day. Higher scores indicate better lighting.
          </p>
          <div className="heatmap-placeholder">
            <p>Heatmap visualization coming soon.</p>
          </div>
        </div>
      ) : (
        <div className="start-analysis">
          <button className="analysis-button" onClick={onStartAnalysis}>
            Analyze Natural Light
          </button>
        </div>
      )}
    </div>
  );
}
