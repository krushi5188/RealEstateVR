import React, { useState, useRef, useEffect } from 'react';
import VRPlayer from './VRPlayer';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [lineStart, setLineStart] = useState(null);
  const [lineEnd, setLineEnd] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [realLength, setRealLength] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (uploadedImageUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = uploadedImageUrl;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [uploadedImageUrl, drawLine]);

  const drawLine = () => {
    if (!lineStart || !lineEnd || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = uploadedImageUrl;
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        ctx.beginPath();
        ctx.moveTo(lineStart.x, lineStart.y);
        ctx.lineTo(lineEnd.x, lineEnd.y);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
    };
  };

  const handleMouseDown = (e) => {
    if (!uploadedImageUrl) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLineStart({ x, y });
    setLineEnd({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLineEnd({ x, y });
    drawLine();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('floorPlan', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedImageUrl(`http://localhost:5000${data.fileUrl}`);
        alert('File uploaded successfully!');
      } else {
        alert('File upload failed.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred during file upload.');
    }
  };

  const handleCalibrate = async () => {
    if (!lineStart || !lineEnd || !realLength) {
        alert('Please draw a line and enter its real-world length.');
        return;
    }

    const pixelLength = Math.sqrt(Math.pow(lineEnd.x - lineStart.x, 2) + Math.pow(lineEnd.y - lineStart.y, 2));

    try {
        const response = await fetch('http://localhost:5000/calibrate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileUrl: uploadedImageUrl.replace('http://localhost:5000', ''),
                pixelLength,
                realLength,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            setProcessedImageUrl(`http://localhost:5000${data.processedImageUrl}`);
            alert('Calibration data sent successfully!');
        } else {
            alert('Failed to send calibration data.');
        }
    } catch (error) {
        console.error('Error sending calibration data:', error);
        alert('An error occurred while sending calibration data.');
    }
  };

  return (
    <div>
      {!processedImageUrl ? (
        <>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>Upload</button>
          {uploadedImageUrl && (
            <div>
              <h3>Draw a line on the floor plan to set the scale:</h3>
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ cursor: 'crosshair', border: '1px solid black' }}
              />
              <div>
                <input
                  type="text"
                  placeholder="Enter real-world length (e.g., 10m)"
                  value={realLength}
                  onChange={(e) => setRealLength(e.target.value)}
                />
                <button onClick={handleCalibrate}>Calibrate</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <VRPlayer processedImageUrl={processedImageUrl} />
      )}
    </div>
  );
};

export default FileUpload;
