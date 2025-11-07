import React, { useState, useRef } from 'react';
import './App.css';
import VRScene from './components/VRScene'; // Import the new VR component

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [modelData, setModelData] = useState(null); // State to hold the 3D model data
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleGenerate = () => {
    if (!selectedFile) return;

    setMessage(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3001/generate-model', true); // Use the new endpoint

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setUploadProgress(100);
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          // Reconstruct TypedArrays from the plain array
          // The server now sends back a filename instead of raw data
          if (response.modelFile) {
            setModelData({ file: response.modelFile }); // Store the filename
            setMessage({ type: 'success', text: 'Model generated successfully!' });
          } else {
            throw new Error('Invalid response from server.');
          }
        } catch (e) {
          setMessage({ type: 'error', text: `An error occurred: ${e.message}` });
        }
      } else {
        try {
            const response = JSON.parse(xhr.responseText);
            setMessage({ type: 'error', text: response.error || 'Model generation failed. Please try again.' });
        } catch (e) {
            setMessage({ type: 'error', text: 'Model generation failed. Please try again.' });
        }
      }
    };

    xhr.onerror = () => {
      setUploadProgress(0);
      setMessage({ type: 'error', text: 'An error occurred during the request.' });
    };

    xhr.send(formData);
  };

  const triggerFileSelect = () => fileInputRef.current.click();
  const resetState = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setMessage(null);
    setModelData(null);
  };

  // If we have model data, show the VR scene. Otherwise, show the upload UI.
  if (modelData) {
    return (
      <div className="App">
        <div className="upload-card">
           <h1>Your VR Experience is Ready</h1>
           <p>Click the "Enter VR" button to immerse yourself in the floor plan.</p>
           <VRScene modelData={modelData} />
           <button className="upload-button" onClick={resetState} style={{marginTop: '1.5rem'}}>
             Upload Another Plan
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="upload-card">
        <h1>Upload Your Floor Plan</h1>
        <p>Drag & drop or browse to select a 2D floor plan file.</p>
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
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
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
          onClick={handleGenerate}
          disabled={!selectedFile}
        >
          Generate VR Experience
        </button>
      </div>
    </div>
  );
}

export default App;
