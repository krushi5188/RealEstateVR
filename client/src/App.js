import React, { useState, useRef } from 'react';
import './App.css';
import VRScene from './components/VRScene';
import Dashboard from './components/Dashboard';
import MaterialLibrary from './components/MaterialLibrary';

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'uploader', or 'vr'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
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
    xhr.open('POST', `${process.env.REACT_APP_API_URL}/generate-model`, true);

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
          const vertices = new Float32Array(response.model.vertices);
          const faces = new Uint32Array(response.model.faces);
          setModelData({ vertices, faces });
          setMessage({ type: 'success', text: 'Model generated successfully!' });

          // Update localStorage with the new model
          const modelFilename = response.modelPath.split('/').pop();
          const cachedModels = JSON.parse(localStorage.getItem('models') || '[]');
          cachedModels.push(modelFilename);
          localStorage.setItem('models', JSON.stringify(cachedModels));

          setView('vr'); // Switch to VR view on success
        } catch (e) {
          setMessage({ type: 'error', text: 'Failed to parse model data.' });
        }
      } else {
        setMessage({ type: 'error', text: 'Model generation failed. Please try again.' });
      }
    };

    xhr.onerror = () => {
      setUploadProgress(0);
      setMessage({ type: 'error', text: 'An error occurred during the request.' });
    };

    xhr.send(formData);
  };

  const triggerFileSelect = () => fileInputRef.current.click();
  const resetToDashboard = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setMessage(null);
    setModelData(null);
    setView('dashboard');
  };

  const renderUploader = () => (
    <div className="upload-card">
      <button className="back-btn" onClick={() => setView('dashboard')}>← Back to Projects</button>
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
      {selectedFile && <div className="file-info"><span>{selectedFile.name}</span></div>}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}
      {message && <div className={`message ${message.type}`}>{message.text}</div>}
      <button className="upload-button" onClick={handleGenerate} disabled={!selectedFile}>
        Generate VR Experience
      </button>
    </div>
  );

  const renderVRScene = () => (
    <div className="upload-card">
       <h1>Your VR Experience is Ready</h1>
       <p>Select a material below to change the appearance of the model.</p>
       <VRScene modelData={modelData} material={selectedMaterial} />
       <MaterialLibrary onMaterialSelect={setSelectedMaterial} />
       <button className="upload-button" onClick={resetToDashboard} style={{marginTop: '1.5rem'}}>
         Back to Dashboard
       </button>
    </div>
  );

  const handleViewModel = (data) => {
    // Ensure the data is in the correct format (TypedArrays) for the VRScene
    const vertices = new Float32Array(data.vertices);
    const faces = new Uint32Array(data.faces);
    setModelData({ vertices, faces });
    setView('vr');
  };

  const renderContent = () => {
    switch (view) {
      case 'uploader':
        return renderUploader();
      case 'vr':
        return renderVRScene();
      case 'dashboard':
      default:
        return <Dashboard onViewChange={setView} onViewModel={handleViewModel} />;
    }
  };

  return (
    <div className="App">
      {renderContent()}
    </div>
  );
}

export default App;
