import React from 'react';
import './DesignPhilosophyReport.css';

const severityIcon = {
  High: ' H ',
  Medium: ' M ',
  Low: ' L ',
};

export default function DesignPhilosophyReport({ report }) {
  if (!report) {
    return null; // Don't render anything if there's no report
  }

  const { philosophy, complianceScore, issueCount, issues } = report;

  return (
    <div className="design-philosophy-report">
      <h3>{philosophy} Analysis Report</h3>
      <div className="report-summary">
        <div className="score-container">
          <span className="score-label">Compliance Score</span>
          <span className="score-value">{complianceScore}</span>
        </div>
        <p>{issueCount > 0 ? `Found ${issueCount} potential issue(s).` : 'No issues found.'}</p>
      </div>
      <ul className="issue-list">
        {issues.map((issue, index) => (
          <li key={index} className={`issue-item severity-${issue.severity.toLowerCase()}`}>
            <span className="severity-indicator">
              {severityIcon[issue.severity]}
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
