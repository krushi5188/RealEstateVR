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

  const { overallBiophilicScore, rooms } = report;

  return (
    <div className="biophilic-report-container">
      <h3>Biophilic Design Report</h3>
      <div className="score-summary">
        <div className="score-main">
          <span className="score-label">Overall Biophilic Score</span>
          <span className="score-value">{overallBiophilicScore}</span>
        </div>
        <div className="score-breakdown">
          {rooms && rooms.map(room => (
            <div key={room.roomId} className="room-report">
                <h4>Room {room.roomId}</h4>
                <p>Biophilic Score: <strong>{room.biophilicScore}</strong></p>
                <p>Natural Light: <strong>{room.naturalLightScore}</strong></p>
                <p>View Quality: <strong>{room.viewQualityScore}</strong></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
