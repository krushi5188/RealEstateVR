import React from 'react';

export default function EnvironmentTool({ currentMode, onSetMode }) {
  const modes = ['Day', 'Sunset', 'Night'];

  const styles = {
    container: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '15px',
      borderRadius: '8px',
      color: 'white',
      marginBottom: '10px',
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      marginTop: '10px',
    },
    button: (isActive) => ({
      padding: '8px 12px',
      border: '1px solid #ccc',
      backgroundColor: isActive ? '#007bff' : '#444',
      color: 'white',
      cursor: 'pointer',
      borderRadius: '4px',
      flex: 1,
      borderColor: isActive ? '#007bff' : '#ccc',
    }),
  };

  return (
    <div style={styles.container}>
      <h4>Environment</h4>
      <div style={styles.buttonGroup}>
        {modes.map((mode) => (
          <button
            key={mode}
            style={styles.button(currentMode === mode)}
            onClick={() => onSetMode(mode)}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
}
