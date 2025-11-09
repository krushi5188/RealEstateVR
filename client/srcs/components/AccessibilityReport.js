import React from 'react';
import './AccessibilityReport.css';

const severityIcon = {
  High: ' H ',
  Medium: ' M ',
  Low: ' L ',
};

export default function AccessibilityReport({ report, onRunAudit }) {
  if (!report) {
    return (
      <div className="accessibility-report-container start-audit">
        <button className="analysis-button" onClick={onRunAudit}>
          Run Accessibility Audit
        </button>
      </div>
    );
  }

  const { issueCount, issues } = report;

  return (
    <div className="accessibility-report-container">
      <h3>Accessibility Audit</h3>
      <div className="report-summary">
        {issueCount > 0 ? (
          <p>Found {issueCount} potential issue{issueCount > 1 ? 's' : ''}.</p>
        ) : (
          <p className="no-issues">No potential accessibility issues found.</p>
        )}
      </div>
      <ul className="issue-list">
        {issues.map((issue, index) => (
          <li key={index} className={`issue-item severity-${issue.severity.toLowerCase()}`}>
            <span className="severity-indicator">
              {severityIcon[issue.severity]}
            </span>
            <div className="issue-details">
              <span className="issue-type">{issue.type}: {issue.featureId}</span>
              <p className="issue-message">{issue.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
