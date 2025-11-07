import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    setMessage(null);
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', selectedFile);

    xhr.open('POST', 'http://localhost:3001/upload', true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setUploadProgress(100);
      if (xhr.status === 200) {
        setMessage({ type: 'success', text: 'Floor plan uploaded successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
      }
    };

    xhr.onerror = () => {
      setUploadProgress(0);
      setMessage({ type: 'error', text: 'An error occurred during the upload.' });
    };

    xhr.send(formData);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="App">
      <div className="upload-card">
        <h1>Upload Your Floor Plan</h1>
        <p>Drag & drop or browse to select your 2D floor plan file.</p>
        <div
          className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
        >
          <p className="drop-zone-text">
            Drag your file here or <span className="browse-link">browse</span>
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="image/*"
          />
        </div>

        {selectedFile && (
          <div className="file-info">
            <span>{selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              &times;
            </button>
          </div>
        )}

        {uploadProgress > 0 && (
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={!selectedFile}
        >
          Generate VR Experience
        </button>
      </div>
    </div>
  );
}

export default App;
