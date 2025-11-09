import React, { useState, useEffect } from 'react';
import './FurnitureLibrary.css';

export default function FurnitureLibrary({ onFurnitureSelect }) {
  const [furniture, setFurniture] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFurniture = async () => {
      try {
        const response = await fetch('/furniture.json');
        if (!response.ok) {
          throw new Error('Failed to fetch furniture data.');
        }
        const data = await response.json();
        setFurniture(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchFurniture();
  }, []);

  return (
    <div className="furniture-library">
      <h4>Furniture Library</h4>
      {error && <p className="error-message">{error}</p>}
      <div className="furniture-list">
        {furniture.map((item) => (
          <div
            key={item.id}
            className="furniture-item"
            onClick={() => onFurnitureSelect(item)}
            title={`W: ${item.dimensions.width}" D: ${item.dimensions.depth}" H: ${item.dimensions.height}"`}
          >
            <span className="furniture-name">{item.name}</span>
            <span className="furniture-category">{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
