import React, { useState } from 'react';

function MoodBoardUploader({ onPaletteExtracted }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image file first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/analyze-mood-board`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Mood board analysis failed.");
      }

      const data = await response.json();
      onPaletteExtracted(data.palette);
      setSelectedFile(null); // Reset after successful upload

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mood-board-uploader">
      <h3>Analyze Mood Board</h3>
      <p>Upload an image to extract a color palette.</p>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={isLoading || !selectedFile}>
        {isLoading ? 'Analyzing...' : 'Extract Palette'}
      </button>
      {error && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
    </div>
  );
}

export default MoodBoardUploader;
