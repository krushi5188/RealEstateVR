import React, { useState } from 'react';
import './LayoutSuggester.css';

export default function LayoutSuggester({ furnitureLibrary, onLayoutSelect }) {
  const [selectedFurniture, setSelectedFurniture] = useState([]);
  const [suggestedLayouts, setSuggestedLayouts] = useState([]);

  const handleToggleFurniture = (item) => {
    setSelectedFurniture((prev) =>
      prev.find(f => f.id === item.id)
        ? prev.filter(f => f.id !== item.id)
        : [...prev, item]
    );
  };

  const handleGenerate = async () => {
    // In a real implementation, room dimensions would be passed in
    const dummyRoom = { width: 400, depth: 400 };
    try {
      const response = await fetch('/generate-layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: dummyRoom, furniture: selectedFurniture }),
      });
      const data = await response.json();
      setSuggestedLayouts(data.layouts);
    } catch (e) {
      console.error("Failed to generate layouts", e);
    }
  };

  return (
    <div className="layout-suggester">
      <h4>Procedural Layout Suggester</h4>
      <p>Select furniture to include:</p>
      <div className="furniture-selection-list">
        {furnitureLibrary.map(item => (
          <div
            key={item.id}
            className={`item ${selectedFurniture.find(f => f.id === item.id) ? 'selected' : ''}`}
            onClick={() => handleToggleFurniture(item)}
          >
            {item.name}
          </div>
        ))}
      </div>
      <button onClick={handleGenerate} className="generate-btn">Generate Layouts</button>
      <div className="suggested-layouts">
        {suggestedLayouts.map((layout, index) => (
          <div key={index} className="layout-card" onClick={() => onLayoutSelect(layout.furniture)}>
            <p>{layout.name}</p>
            {/* A real implementation would render a mini 2D preview here */}
          </div>
        ))}
      </div>
    </div>
  );
}
