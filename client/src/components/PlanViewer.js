import React, { useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';

export default function PlanViewer({ wallData, width = 800, height = 600 }) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1.0); // Default scale if none detected

  useEffect(() => {
    if (!wallData) return;

    // Determine best scale from detected rooms
    let detectedScale = 0;
    let count = 0;
    const floors = Array.isArray(wallData) ? wallData : [wallData];

    floors.forEach(floor => {
        if (floor.rooms) {
            floor.rooms.forEach(room => {
                if (room.detectedScale) {
                    detectedScale += room.detectedScale;
                    count++;
                }
            });
        }
    });

    if (count > 0) {
        setScale(detectedScale / count); // Average PPF
    } else {
        setScale(10); // Fallback: 10 pixels per foot (approx)
    }

  }, [wallData]);

  useEffect(() => {
    if (!wallData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const floors = Array.isArray(wallData) ? wallData : [wallData];

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render first floor for now (or stack them if complex)
    // Just taking the first one for the "Plan View"
    const floor = floors[0];
    if (!floor) return;

    // Draw Grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for(let x=0; x<canvas.width; x+=scale) {
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for(let y=0; y<canvas.height; y+=scale) {
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw Walls
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    floor.walls.forEach(wall => {
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);

        // Dimension Line Logic
        // Only draw for walls longer than 5 feet to avoid clutter
        const lengthPx = Math.sqrt(Math.pow(wall.x2-wall.x1, 2) + Math.pow(wall.y2-wall.y1, 2));
        const lengthFt = lengthPx / scale;

        if (lengthFt > 5) {
             // Draw dimension text
             const midX = (wall.x1 + wall.x2) / 2;
             const midY = (wall.y1 + wall.y2) / 2;
             ctx.fillStyle = 'blue';
             ctx.font = '12px Arial';
             ctx.fillText(`${lengthFt.toFixed(1)}'`, midX + 5, midY - 5);
        }
    });
    ctx.stroke();

    // Draw Features
    if (floor.rooms) {
        floor.rooms.forEach(room => {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
            const w = room.bounds.maxX - room.bounds.minX;
            const h = room.bounds.maxY - room.bounds.minY;
            ctx.fillRect(room.bounds.minX, room.bounds.minY, w, h);

            ctx.fillStyle = '#333';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(room.label || `Room ${room.id}`, room.center.x, room.center.y);
        });
    }

  }, [wallData, scale]);

  const handleExportPDF = () => {
      const canvas = canvasRef.current;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
          orientation: 'landscape',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Title Block
      pdf.setFontSize(20);
      pdf.text("Architectural Plan", 20, 20);
      pdf.setFontSize(12);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);
      pdf.text(`Scale: 1 inch = ${(scale * 10).toFixed(0)} px approx`, 20, 36); // Rough approximation

      // Image
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      const renderWidth = pdfWidth - 40;
      const renderHeight = renderWidth / ratio;

      pdf.addImage(imgData, 'PNG', 20, 40, renderWidth, renderHeight);
      pdf.save("floor_plan_export.pdf");
  };

  return (
    <div className="plan-viewer tool-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h4>2D Blueprint View</h4>
          <button onClick={handleExportPDF} style={{ backgroundColor: '#dc3545' }}>Export PDF</button>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ border: '1px solid #ccc', backgroundColor: 'white', maxWidth: '100%' }}
      />
      <p style={{ fontSize: '0.8em', color: '#ccc' }}>
        Detected Scale: {scale.toFixed(2)} pixels/foot based on room labels.
      </p>
    </div>
  );
}
