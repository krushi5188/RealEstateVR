import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const API_URL = 'http://localhost:3001';

export default function Dashboard({ onViewChange }) {
  const [models, setModels] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${API_URL}/models`);
        if (!response.ok) {
          throw new Error('Failed to fetch models.');
        }
        const data = await response.json();
        setModels(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchModels();
  }, []);

  const handleNewProject = () => {
    onViewChange('uploader');
  };

  const handleDownload = async (filename) => {
    try {
      const response = await fetch(`${API_URL}/models/${filename}`, {
        headers: {
          'Authorization': 'admin-secret-token'
        }
      });
      if (!response.ok) {
        throw new Error('Download failed.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Projects</h1>
        <button className="new-project-btn" onClick={handleNewProject}>+ New Project</button>
      </header>
      {error && <p className="error-message">{error}</p>}
      <div className="project-grid">
        {models.length > 0 ? (
          models.map((modelName, index) => (
            <div key={index} className="project-card">
              <h2>{modelName.replace('.json', '')}</h2>
              <p>Generated Model</p>
              <div className="project-card-actions">
                <button className="action-btn">View</button>
                <button className="action-btn" onClick={() => handleDownload(modelName)}>Download</button>
                <button className="action-btn delete-btn">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>No models found. Upload a floor plan to get started!</p>
        )}
      </div>
    </div>
  );
}
