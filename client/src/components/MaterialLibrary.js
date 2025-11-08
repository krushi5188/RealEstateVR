import React, { useState, useEffect } from 'react';
import './MaterialLibrary.css';

export default function MaterialLibrary({ onMaterialSelect }) {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch('/materials.json');
        if (!response.ok) {
          throw new Error('Failed to fetch materials.');
        }
        const data = await response.json();
        setMaterials(data);
        // Set the first material as the default selection
        if (data.length > 0) {
          setSelectedMaterial(data[0]);
          onMaterialSelect(data[0]);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMaterials();
  }, [onMaterialSelect]);

  const handleSelect = (material) => {
    setSelectedMaterial(material);
    onMaterialSelect(material);
  };

  return (
    <div className="material-library">
      <h3>Material Library</h3>
      {error && <p className="error-message">{error}</p>}
      <div className="material-grid">
        {materials.map((material) => (
          <div
            key={material.id}
            className={`material-card ${selectedMaterial?.id === material.id ? 'selected' : ''}`}
            onClick={() => handleSelect(material)}
          >
            <div className="material-preview" style={{ backgroundColor: material.color }}></div>
            <p>{material.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
