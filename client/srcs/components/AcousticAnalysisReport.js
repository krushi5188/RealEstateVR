import React from 'react';
// Using the same CSS as another report for consistency
import './AccessibilityReport.css';

export default function AcousticAnalysisReport({ report, onRunAnalysis }) {
  if (!report) {
    return (
      <div className="accessibility-report-container start-audit">
        <button className="analysis-button" onClick={onRunAnalysis}>
          Analyze Acoustic Separation
        </button>
      </div>
    );
  }

  const { issueCount, issues } = report;

  return (
    <div className="accessibility-report-container">
      <h3>Acoustic Separation Report</h3>
      <div className="report-summary">
        {issueCount > 0 ? (
          <p>Found {issueCount} potential noise leak{issueCount > 1 ? 's' : ''}.</p>
        ) : (
          <p className="no-issues">No significant noise leak paths found.</p>
        )}
      </div>
      <ul className="issue-list">
        {issues.map((issue, index) => (
          <li key={index} className={`issue-item severity-${issue.severity.toLowerCase()}`}>
            <span className="severity-indicator">
              M
            </span>
            <div className="issue-details">
              <span className="issue-type">{issue.featureId}</span>
              <p className="issue-message">{issue.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
