import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const LOCAL_STORAGE_KEY = 'vr-floor-plan-projects';

export default function Dashboard() {
  const [projects, setProjects] = useState(() => {
    // Load projects from local storage on initial render
    const savedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedProjects) {
      return JSON.parse(savedProjects);
    } else {
      return [
        { id: 1, name: 'Modern House', lastModified: '2025-11-07' },
        { id: 2, name: 'Downtown Office Space', lastModified: '2025-11-06' },
        { id: 3, name: 'Lakeside Cabin', lastModified: '2025-11-05' },
      ];
    }
  });

  // Save projects to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const handleNewProject = () => {
    const newProject = {
      id: Date.now(), // Use a timestamp for a more unique ID
      name: `New Project`,
      lastModified: new Date().toISOString().slice(0, 10),
    };
    setProjects([newProject, ...projects]);
  };

  const handleDeleteProject = (projectId) => {
    setProjects(projects.filter((p) => p.id !== projectId));
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Projects</h1>
        <button className="new-project-btn" onClick={handleNewProject}>+ New Project</button>
      </header>
      <div className="project-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <h2>{project.name}</h2>
            <p>Last Modified: {project.lastModified}</p>
            <div className="project-card-actions">
              <button className="action-btn">View</button>
              <button className="action-btn delete-btn" onClick={() => handleDeleteProject(project.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
