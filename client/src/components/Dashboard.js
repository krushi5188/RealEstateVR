import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL;
const ADMIN_TOKEN = process.env.REACT_APP_ADMIN_SECRET_TOKEN;

export default function Dashboard({ onViewChange, onViewModel }) {
  const [models, setModels] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load models from localStorage for an instant UI update
    try {
      const cachedModels = localStorage.getItem('models');
      if (cachedModels) {
        setModels(JSON.parse(cachedModels));
      }
    } catch (err) {
      // If parsing fails, just ignore the cached version
      console.error("Failed to parse cached models:", err);
    }

    const fetchModels = async () => {
      try {
        const response = await fetch(`${API_URL}/models`);
        if (!response.ok) {
          throw new Error('Failed to fetch models.');
        }
        const data = await response.json();
        setModels(data);
        // Cache the fresh data in localStorage
        localStorage.setItem('models', JSON.stringify(data));
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
          'Authorization': ADMIN_TOKEN
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

  const handleView = async (filename) => {
    try {
      const response = await fetch(`${API_URL}/models/${filename}`, {
        headers: {
          'Authorization': ADMIN_TOKEN
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch model data.');
      }
      const data = await response.json();
      onViewModel(data); // Pass the data to the parent component
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (filename) => {
    try {
      const response = await fetch(`${API_URL}/models/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': ADMIN_TOKEN
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete model.');
      }

      const updatedModels = models.filter(model => model !== filename);
      setModels(updatedModels);
      localStorage.setItem('models', JSON.stringify(updatedModels));

    } catch (err) {
      setError(err.message);
    }
  };

  // Group models by project ID (assuming 'project_id-timestamp-original_name.json')
  // Actually, current naming is 'uuid-original_name.json'
  // Snapshots are 'uuid-original_name-snapshot-name.json'
  // So we can group by the prefix before '-snapshot-'
  const groupedModels = models.reduce((groups, filename) => {
      let baseName = filename;
      let isSnapshot = false;
      if (filename.includes('-snapshot-')) {
          baseName = filename.split('-snapshot-')[0] + '.json';
          isSnapshot = true;
      }

      if (!groups[baseName]) {
          groups[baseName] = { main: null, snapshots: [] };
      }

      if (isSnapshot) {
          groups[baseName].snapshots.push(filename);
      } else {
          groups[baseName].main = filename;
      }
      return groups;
  }, {});

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Projects</h1>
        <button className="new-project-btn" onClick={handleNewProject}>+ New Project</button>
      </header>
      {error && <p className="error-message">{error}</p>}
      <div className="project-grid">
        {Object.keys(groupedModels).length > 0 ? (
          Object.entries(groupedModels).map(([baseName, group], index) => (
            <div key={index} className="project-card">
              {group.main ? (
                  <>
                    <h2>{group.main.replace('.json', '').split('-').slice(5).join('-')}</h2>
                    <p>Original Project</p>
                    <div className="project-card-actions">
                        <button className="action-btn" onClick={() => handleView(group.main)}>View Main</button>
                        <button className="action-btn delete-btn" onClick={() => handleDelete(group.main)}>Delete</button>
                    </div>
                  </>
              ) : (
                  <h2>Unlinked Snapshots ({baseName})</h2>
              )}

              {group.snapshots.length > 0 && (
                  <div className="snapshots-list">
                      <h4>Snapshots:</h4>
                      {group.snapshots.map(snap => (
                          <div key={snap} style={{ marginBottom: '5px' }}>
                              <span style={{ fontSize: '0.8em' }}>{snap.split('-snapshot-')[1].replace('.json', '')}</span>
                              <button className="action-btn small" onClick={() => handleView(snap)} style={{ marginLeft: '10px', padding: '2px 5px' }}>Load</button>
                          </div>
                      ))}
                  </div>
              )}
            </div>
          ))
        ) : (
          <p>No models found. Upload a floor plan to get started!</p>
        )}
      </div>
    </div>
  );
}
