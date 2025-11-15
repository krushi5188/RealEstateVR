import React, { useState } from 'react';
import './LayoutSuggester.css';

export default function LayoutSuggester({ wallData, furnitureLibrary, onLayoutSelect }) {
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedFurniture, setSelectedFurniture] = useState([]);
  const [suggestedLayouts, setSuggestedLayouts] = useState([]);
  const [error, setError] = useState('');

  const handleToggleFurniture = (item) => {
    setSelectedFurniture((prev) =>
      prev.find(f => f.id === item.id)
        ? prev.filter(f => f.id !== item.id)
        : [...prev, item]
    );
  };

  const handleGenerate = async () => {
    setError('');
    if (!selectedRoomId) {
      setError("Please select a room first.");
      return;
    }
    if (selectedFurniture.length === 0) {
      setError("Please select at least one furniture item.");
      return;
    }

    const selectedRoom = wallData.rooms.find(r => r.id === parseInt(selectedRoomId));
    if (!selectedRoom) {
      setError("Could not find the selected room data.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/generate-layouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: selectedRoom, furniture: selectedFurniture }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Layout generation failed.');
      }
      const data = await response.json();
      setSuggestedLayouts(data.layouts);
    } catch (e) {
      setError(e.message);
      console.error("Failed to generate layouts", e);
    }
  };

  return (
    <div className="layout-suggester">
      <h4>Procedural Layout Suggester</h4>
      {error && <p className="error-message">{error}</p>}
      <div className="layout-controls">
        <div className="room-selection">
            <label htmlFor="room-select">Select a Room:</label>
            <select
                id="room-select"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                disabled={!wallData || !wallData.rooms || wallData.rooms.length === 0}
            >
                <option value="">--Please choose a room--</option>
                {wallData?.rooms?.map(room => (
                    <option key={room.id} value={room.id}>{room.label}</option>
                ))}
            </select>
        </div>
        <div className="furniture-selection">
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
        </div>
      </div>
      <button onClick={handleGenerate} className="generate-btn">Generate Layouts</button>
      <div className="suggested-layouts">
        {suggestedLayouts.map((layout, index) => (
          <div key={index} className="layout-card" onClick={() => onLayoutSelect(layout.furniture)}>
            <p>{layout.name}</p>
            <LayoutPreview room={wallData.rooms.find(r => r.id === parseInt(selectedRoomId))} layout={layout.furniture} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LayoutPreview({ room, layout }) {
    if (!room) return null;

    const { minX, maxX, minY, maxY } = room.bounds;
    const roomWidth = maxX - minX;
    const roomHeight = maxY - minY;

    // Determine the scale factor to fit the preview in a fixed-size box
    const previewBoxSize = 150; // pixels
    const scale = Math.min(previewBoxSize / roomWidth, previewBoxSize / roomHeight);

    const getBoundingBox = (item) => {
        const w = item.rotation === 90 || item.rotation === -90 ? item.dimensions.depth : item.dimensions.width;
        const d = item.rotation === 90 || item.rotation === -90 ? item.dimensions.width : item.dimensions.depth;
        return {
            x: (item.position.x - w/2) * scale,
            y: (item.position.z - d/2) * scale, // Note: server z is client y
            width: w * scale,
            height: d * scale,
        };
    };

    return (
        <svg width={previewBoxSize} height={previewBoxSize} className="layout-preview-svg">
            <rect x="0" y="0" width={roomWidth * scale} height={roomHeight * scale} className="room-outline" />
            {layout.map(item => {
                const box = getBoundingBox(item);
                return <rect key={item.id} x={box.x} y={box.y} width={box.width} height={box.height} className="furniture-item-preview" />
            })}
        </svg>
    );
}
