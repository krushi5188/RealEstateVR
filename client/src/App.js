import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import VRScene from './components/VRScene';
import Dashboard from './components/Dashboard';
import MaterialLibrary from './components/MaterialLibrary';
import CirculationAnalysis from './components/CirculationAnalysis';
import NaturalLightAnalysis from './components/NaturalLightAnalysis';
import { analyzeNaturalLight } from './analysis/light-analyzer';
import AccessibilityReport from './components/AccessibilityReport';
import FurnitureLibrary from './components/FurnitureLibrary';
import AgentScheduler from './components/AgentScheduler';
import VirtualAgent from './components/VirtualAgent';
import DesignPhilosophyInput from './components/DesignPhilosophyInput';
import DesignPhilosophyReport from './components/DesignPhilosophyReport';
import BiophilicDesignReport from './components/BiophilicDesignReport';
import { analyzeBiophilicDesign } from './analysis/biophilic-analyzer';
import AcousticAnalysisReport from './components/AcousticAnalysisReport';
import LayoutSuggester from './components/LayoutSuggester';
import MoodBoardUploader from './components/MoodBoardUploader';
import StaircaseTool from './components/StaircaseTool';
import RoofTool from './components/RoofTool';
import EnvironmentTool from './components/EnvironmentTool';
import CostEstimator from './components/CostEstimator';
import PlanViewer from './components/PlanViewer';

// --- Floor Teleporter UI ---
function FloorTeleporter({ floorLabels, onTeleport }) {
  if (!floorLabels || floorLabels.length <= 1) return null;

  const buttonStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: '1px solid white',
    borderRadius: '5px',
    padding: '10px',
    cursor: 'pointer',
    margin: '5px',
  };

  return (
    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
      {floorLabels.map((label, index) => (
        <button key={index} style={buttonStyle} onClick={() => onTeleport(index)}>
          {label}
        </button>
      ))}
    </div>
  );
}


function VRView({
  modelData,
  selectedMaterial,
  setSelectedMaterial,
  isSunCycling,
  heldFurniture,
  setHeldFurniture,
  placedFurniture,
  setPlacedFurniture,
  floorFiles,
  agentPath,
  circulationData,
  lightAnalysisResult,
  handleNaturalLightAnalysis,
  accessibilityReport,
  handleAccessibilityAudit,
  designPhilosophyReport,
  biophilicReport,
  handleBiophilicAnalysis,
  acousticReport,
  handleAcousticAnalysis,
  wallData,
  furnitureLibrary,
  handleRunSimulation,
  handleDesignPhilosophyAnalysis,
  moodBoardPalette,
  handlePaletteExtracted,
  handleAnalyzeCirculation,
  resetToDashboard,
  handleActivateStaircaseMode,
  isStaircaseMode,
  roofType,
  handleSetRoofType,
  environmentMode,
  setEnvironmentMode,
  handleSaveSnapshot
}) {
  const teleportRef = useRef(null);

  // Gather all project data for the cost estimator
  const projectData = {
      wallData: wallData,
      material: selectedMaterial,
      roofType: roofType
  };
  return (
    <div className="upload-card">
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <h1>Your VR Experience is Ready</h1>
         <button
           onClick={handleSaveSnapshot}
           style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
         >
           Save Snapshot
         </button>
       </div>
       <p>Select a material, run an analysis, or simulate a day in the life.</p>
       <div className="vr-scene-container">
         <VRScene
            modelData={modelData}
            material={selectedMaterial}
            sunCycle={isSunCycling}
            heldFurniture={heldFurniture}
            setHeldFurniture={setHeldFurniture}
            placedFurniture={placedFurniture}
            floorLabels={floorFiles.map(f => f.label)}
            isStaircaseMode={isStaircaseMode}
            onTeleportReady={(teleportFn) => { teleportRef.current = teleportFn; }}
            wallData={wallData}
            roofType={roofType}
            environmentMode={environmentMode}
         >
           <VirtualAgent path={agentPath} />
         </VRScene>
         <FloorTeleporter floorLabels={floorFiles.map(f => f.label)} onTeleport={(index) => teleportRef.current && teleportRef.current(index)} />
         <CirculationAnalysis analysisData={circulationData} width={500} height={500} />
       <NaturalLightAnalysis analysisResult={lightAnalysisResult} onStartAnalysis={handleNaturalLightAnalysis} />
       <AccessibilityReport report={accessibilityReport} onRunAudit={handleAccessibilityAudit} />
       <DesignPhilosophyReport report={designPhilosophyReport} />
       <BiophilicDesignReport report={biophilicReport} onRunAnalysis={handleBiophilicAnalysis} />
       <AcousticAnalysisReport report={acousticReport} onRunAnalysis={handleAcousticAnalysis} />
     </div>
     <MaterialLibrary onMaterialSelect={setSelectedMaterial} />
     <FurnitureLibrary onFurnitureSelect={setHeldFurniture} />
     <LayoutSuggester wallData={wallData} furnitureLibrary={furnitureLibrary} onLayoutSelect={setPlacedFurniture} />
     <AgentScheduler onScheduleRun={handleRunSimulation} />
     <DesignPhilosophyInput wallData={wallData} onAnalyze={handleDesignPhilosophyAnalysis} />
     <EnvironmentTool currentMode={environmentMode} onSetMode={setEnvironmentMode} />
     <StaircaseTool onActivate={handleActivateStaircaseMode} />
     <RoofTool currentType={roofType} onSetType={handleSetRoofType} />
     <PlanViewer wallData={wallData} />
     <CostEstimator projectData={projectData} />
     <MoodBoardUploader onPaletteExtracted={handlePaletteExtracted} />
     {moodBoardPalette && (
       <div className="palette-display">
         <h4>Extracted Palette:</h4>
         <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
           {moodBoardPalette.map((color, index) => (
             <div
               key={index}
               style={{
                 backgroundColor: color,
                 width: '40px',
                 height: '40px',
                 borderRadius: '50%',
                 border: '2px solid white'
               }}
               title={color}
             />
           ))}
         </div>
       </div>
     )}
     <div className="button-container">
       <button className="analysis-button" onClick={handleAnalyzeCirculation}>
         Analyze Circulation
       </button>
       <button className="analysis-button" onClick={handleAccessibilityAudit} style={{backgroundColor: '#6c757d'}}>
         Run Accessibility Audit
       </button>
       <button className="upload-button" onClick={resetToDashboard} style={{marginTop: '1.5rem'}}>
         Back to Dashboard
       </button>
     </div>
  </div>
  );
}

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'uploader', 'or 'vr'
  const [floorFiles, setFloorFiles] = useState([]); // { file: File, label: string }
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [wallData, setWallData] = useState(null);
  const [modelFilename, setModelFilename] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [circulationData, setCirculationData] = useState(null);
  const [lightAnalysisResult, setLightAnalysisResult] = useState(null);
  const [isSunCycling, setIsSunCycling] = useState(false);
  const [accessibilityReport, setAccessibilityReport] = useState(null);
  const [heldFurniture, setHeldFurniture] = useState(null); // The furniture item being placed
  const [agentPath, setAgentPath] = useState([]); // Path for the virtual agent
  const [designPhilosophyReport, setDesignPhilosophyReport] = useState(null);
  const [biophilicReport, setBiophilicReport] = useState(null);
  const [acousticReport, setAcousticReport] = useState(null);
  const [furnitureLibrary, setFurnitureLibrary] = useState([]);
  const [placedFurniture, setPlacedFurniture] = useState([]); // New state for placed items
  const [moodBoardPalette, setMoodBoardPalette] = useState(null);
  const [isStaircaseMode, setIsStaircaseMode] = useState(false);
  const [roofType, setRoofType] = useState(null);
  const [environmentMode, setEnvironmentMode] = useState('Day');
  const fileInputRef = useRef(null);

  const handleSaveSnapshot = async () => {
    if (!modelData || !modelFilename) return;
    const name = prompt("Enter a name for this snapshot (optional):");

    const snapshotData = {
      model: modelData, // We might need to serialize TypedArrays back to arrays if we want pure JSON
      wallData: wallData,
      // Include other state like furniture, roof, environment if needed for full restore
    };

    // Convert TypedArrays to regular arrays for JSON serialization
    const serializedModel = {
        vertices: Array.from(modelData.vertices),
        faces: Array.from(modelData.faces)
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/save-snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            modelData: { model: serializedModel, wallData },
            name,
            baseModelFilename: modelFilename
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: `Snapshot saved: ${data.filename}` });
      } else {
        throw new Error('Failed to save snapshot');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleActivateStaircaseMode = () => {
    setIsStaircaseMode(true);
    // You might want to provide feedback to the user, e.g., a message
    setMessage({ type: 'info', text: 'Staircase Mode Activated: Select start and end points.' });
  };

  const handlePaletteExtracted = (palette) => {
    setMoodBoardPalette(palette);
    // Here, you could also trigger filtering the material library
    // based on the extracted palette.
    console.log("Extracted Palette:", palette);
  };

  useEffect(() => {
    // Fetch the furniture library on component mount
    const fetchFurniture = async () => {
      try {
        const response = await fetch('/furniture.json');
        const data = await response.json();
        setFurnitureLibrary(data);
      } catch (err) {
        console.error("Failed to fetch furniture library:", err);
      }
    };
    fetchFurniture();
  }, []);

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({ file, label: `Floor ${floorFiles.length + 1}` }));
      setFloorFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ file, label: `Floor ${floorFiles.length + 1}` }));
      setFloorFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const handleLabelChange = (index, newLabel) => {
    setFloorFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      updatedFiles[index].label = newLabel;
      return updatedFiles;
    });
  };

  const handleRemoveFile = (index) => {
    setFloorFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    if (floorFiles.length === 0) return;

    setMessage(null);
    setUploadProgress(0);

    const formData = new FormData();
    const labels = floorFiles.map(f => f.label);
    formData.append('floorLabels', JSON.stringify(labels));
    floorFiles.forEach((floorFile, index) => {
        formData.append('floors', floorFile.file, floorFile.file.name);
    });

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
          const modelFilename = response.modelPath.split('/').pop();
          setModelData({ vertices, faces });
          setModelFilename(modelFilename);
          setMessage({ type: 'success', text: 'Model generated successfully!' });

          // Update localStorage with the new model
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
    setFloorFiles([]);
    setUploadProgress(0);
    setMessage(null);
    setModelData(null);
    setView('dashboard');
  };

  const renderUploader = () => (
    <div className="upload-card">
      <button className="back-btn" onClick={() => setView('dashboard')}>← Back to Projects</button>
      <h1>Upload Floor Plans</h1>
      <p>Drag & drop or browse to select one or more files. Label each floor in order from bottom to top.</p>
      <div
        className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
      >
        <p className="drop-zone-text">
          Drag files here or <span className="browse-link">browse</span>
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*"
          multiple
        />
      </div>
      <div className="file-list">
        <h4>Selected Floors:</h4>
        {floorFiles.map((floor, index) => (
          <div key={index} className="file-item">
            <span>{floor.file.name}</span>
            <input
              type="text"
              value={floor.label}
              onChange={(e) => handleLabelChange(index, e.target.value)}
              className="floor-label-input"
            />
            <button onClick={() => handleRemoveFile(index)} className="remove-file-btn">×</button>
          </div>
        ))}
      </div>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}
      {message && <div className={`message ${message.type}`}>{message.text}</div>}
      <button className="upload-button" onClick={handleGenerate} disabled={floorFiles.length === 0}>
        Generate Multi-Floor VR Experience
      </button>
    </div>
  );

  const handleAnalyzeCirculation = async () => {
    if (!modelFilename) {
      setMessage({ type: 'error', text: 'No model is loaded for analysis.' });
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/analyze-circulation/${modelFilename}`);
      if (!response.ok) {
        throw new Error('Analysis request failed.');
      }
      const data = await response.json();
      setCirculationData(data);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleNaturalLightAnalysis = async () => {
    if (!wallData) return;

    setIsSunCycling(true); // Start the sun animation

    // Run the analysis
    const results = await analyzeNaturalLight(wallData);
    setLightAnalysisResult(results);

    // Stop the animation after a brief period to show the cycle
    setTimeout(() => {
      setIsSunCycling(false);
    }, 2000); // Let it run for 2 seconds for visual effect
  };

  const handleAccessibilityAudit = async () => {
    if (!modelFilename) {
      setMessage({ type: 'error', text: 'No model is loaded for analysis.' });
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/audit-accessibility/${modelFilename}`);
      if (!response.ok) {
        throw new Error('Accessibility audit failed.');
      }
      const data = await response.json();
      setAccessibilityReport(data.report);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleRunSimulation = async () => {
    if (!wallData || !wallData.rooms || wallData.rooms.length < 2) {
      setMessage({ type: 'error', text: 'Not enough rooms to simulate a path.' });
      return;
    }

    // For demonstration, we'll find a path between the centers of the first two rooms.
    const start = wallData.rooms[0].center;
    const end = wallData.rooms[1].center;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/find-path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end, wallData }),
      });

      if (!response.ok) {
        throw new Error('Failed to find a path from the server.');
      }

      const { path: path2D } = await response.json();

      if (!path2D || path2D.length === 0) {
        setMessage({ type: 'info', text: 'No path could be found between the two points.' });
        return;
      }

      // Convert the 2D path from the server into a 3D path for the agent
      const offsetX = wallData.width / 2;
      const offsetY = wallData.height / 2;
      const path3D = path2D.map(p => ({
        x: (p.x - offsetX) * 0.1,
        y: 0.5, // Agent's height above the floor
        z: (p.y - offsetY) * 0.1,
      }));

      setAgentPath(path3D);

    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDesignPhilosophyAnalysis = async (analysisData) => {
    if (!modelFilename) {
        setMessage({ type: 'error', text: 'No model is loaded for analysis.' });
        return;
    }
    try {
      // The server can now get everything from the model file, but we pass the
      // user-confirmed angle as a query parameter for override.
      const url = new URL(`${process.env.REACT_APP_API_URL}/analyze-design-philosophy/${modelFilename}`);
      url.searchParams.append('northAngle', analysisData.northAngle);
      url.searchParams.append('philosophy', analysisData.philosophy);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Design philosophy analysis failed.');
      }
      const data = await response.json();
      setDesignPhilosophyReport(data.report);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleBiophilicAnalysis = async () => {
    if (!modelFilename) {
      setMessage({ type: 'error', text: 'No model is loaded for analysis.' });
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/analyze-biophilic-design/${modelFilename}`);
      if (!response.ok) {
        throw new Error('Biophilic design analysis failed.');
      }
      const data = await response.json();
      setBiophilicReport(data.report);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleAcousticAnalysis = async () => {
    if (!wallData) {
      setMessage({ type: 'error', text: 'No wall data available for analysis.' });
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/analyze-acoustic-separation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wallData),
      });
      if (!response.ok) {
        throw new Error('Acoustic analysis failed.');
      }
      const data = await response.json();
      setAcousticReport(data.report);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleViewModel = (data) => {
    if (!data.model || !data.wallData) {
      setMessage({ type: 'error', text: 'Loaded model file is missing required data.' });
      return;
    }
    // Ensure the data is in the correct format (TypedArrays) for the VRScene
    const vertices = new Float32Array(data.model.vertices);
    const faces = new Uint32Array(data.model.faces);
    setModelData({ vertices, faces });
    setWallData(data.wallData);
    // It's a bit redundant, but we need the filename for other functions
    const cachedModels = JSON.parse(localStorage.getItem('models') || '[]');
    // This is a simplistic way to find the model; a better way would be passing it from Dashboard
    if (cachedModels.length > 0) setModelFilename(cachedModels[cachedModels.length - 1]);

    setView('vr');
  };

  const renderContent = () => {
    switch (view) {
      case 'uploader':
        return renderUploader();
      case 'vr':
        return <VRView
          modelData={modelData}
          selectedMaterial={selectedMaterial}
          setSelectedMaterial={setSelectedMaterial}
          isSunCycling={isSunCycling}
          heldFurniture={heldFurniture}
          setHeldFurniture={setHeldFurniture}
          placedFurniture={placedFurniture}
          setPlacedFurniture={setPlacedFurniture}
          floorFiles={floorFiles}
          agentPath={agentPath}
          circulationData={circulationData}
          lightAnalysisResult={lightAnalysisResult}
          handleNaturalLightAnalysis={handleNaturalLightAnalysis}
          accessibilityReport={accessibilityReport}
          handleAccessibilityAudit={handleAccessibilityAudit}
          designPhilosophyReport={designPhilosophyReport}
          biophilicReport={biophilicReport}
          handleBiophilicAnalysis={handleBiophilicAnalysis}
          acousticReport={acousticReport}
          handleAcousticAnalysis={handleAcousticAnalysis}
          wallData={wallData}
          furnitureLibrary={furnitureLibrary}
          handleRunSimulation={handleRunSimulation}
          handleDesignPhilosophyAnalysis={handleDesignPhilosophyAnalysis}
          moodBoardPalette={moodBoardPalette}
          handlePaletteExtracted={handlePaletteExtracted}
          handleAnalyzeCirculation={handleAnalyzeCirculation}
          resetToDashboard={resetToDashboard}
          handleActivateStaircaseMode={handleActivateStaircaseMode}
          isStaircaseMode={isStaircaseMode}
          roofType={roofType}
          handleSetRoofType={setRoofType}
          environmentMode={environmentMode}
          setEnvironmentMode={setEnvironmentMode}
          handleSaveSnapshot={handleSaveSnapshot}
        />;
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
