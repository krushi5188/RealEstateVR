import React from 'react';
import './AnalysisFeedback.css';

const ICONS = {
  warning: '⚠️',
  error: '❗️',
  info: 'ℹ️',
};

export default function AnalysisFeedback({ analysis }) {
  if (!analysis || !analysis.warnings || analysis.warnings.length === 0) {
    return null;
  }

  return (
    <div className="analysis-feedback">
      <h2>Architectural Feedback</h2>
      {analysis.warnings.map((warning) => (
        <div key={warning.id} className={`feedback-item ${warning.severity}`}>
          <span className="feedback-icon">{ICONS[warning.severity] || '🔹'}</span>
          <div className="feedback-content">
            <strong>{warning.type}</strong>
            <p>{warning.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
