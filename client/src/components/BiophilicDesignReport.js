import React from 'react';
import './BiophilicDesignReport.css';

export default function BiophilicDesignReport({ report, onRunAnalysis }) {
  if (!report) {
    return (
      <div className="biophilic-report-container start-analysis">
        <button className="analysis-button" onClick={onRunAnalysis}>
          Run Biophilic Analysis
        </button>
      </div>
    );
  }

  const { naturalLightScore, viewQualityScore, biophilicScore } = report;

  return (
    <div className="biophilic-report-container">
      <h3>Biophilic Design Report</h3>
      <div className="score-summary">
        <div className="score-main">
          <span className="score-label">Overall Biophilic Score</span>
          <span className="score-value">{biophilicScore}</span>
        </div>
        <div className="score-breakdown">
          <p>Natural Light: <strong>{naturalLightScore}</strong></p>
          <p>View Quality: <strong>{viewQualityScore}</strong></p>
        </div>
      </div>
    </div>
  );
}
