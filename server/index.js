const http = require('http');
const multiparty = require('multiparty');
const path = require('path');
const fs = require('fs');
const { saveFile, extractWallData } = require('./image-processor');
const { generateModel } = require('./model-generator');
const THREE = require('three');
const { GLTFExporter } = require('three/examples/jsm/exporters/GLTFExporter.js');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const MODELS_DIR = path.join(__dirname, 'models');
if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR);
}

// A simple in-memory store for generated model metadata
const modelStore = new Map();

// --- Authentication Middleware (Placeholder) ---
// In a real app, this would involve token validation, session checks, etc.
function isAdmin(req) {
    // For now, we'll use a simple query parameter for demonstration
    // e.g., /download-model?file=...&apiKey=ADMIN_SECRET
    const url = new URL(req.url, `http://${req.headers.host}`);
    return url.searchParams.get('apiKey') === 'ADMIN_SECRET';
}


const server = http.createServer(async (req, res) => {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- Model Generation Endpoint ---
  if (req.url === '/generate-model' && req.method === 'POST') {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err || !files.file || files.file.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid or missing file upload.' }));
        return;
      }

      const file = files.file[0];
      let savedFilePath;

      try {
        const { finalPath, uniqueFilename } = await saveFile(file);
        savedFilePath = finalPath;

        const wallData = await extractWallData(savedFilePath);
        const { vertices, faces } = generateModel(wallData);

        // --- Create a Three.js Scene ---
        const scene = new THREE.Scene();
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(new THREE.BufferAttribute(faces, 1));
        geometry.computeVertexNormals(); // Ensure the model has proper lighting

        const material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // --- Export the Scene to GLB ---
        const exporter = new GLTFExporter();
        exporter.parse(
          scene,
          (glb) => {
            const modelFilename = `${path.parse(uniqueFilename).name}.glb`;
            const modelPath = path.join(MODELS_DIR, modelFilename);
            fs.writeFileSync(modelPath, Buffer.from(glb));

            // Store metadata
            modelStore.set(modelFilename, { path: modelPath, uploadedFile: uniqueFilename });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'Model generated successfully',
                modelFile: modelFilename // Send the filename to the client
            }));
          },
          (error) => {
            console.error('GLTFExporter error:', error);
            throw new Error('Failed to export GLB file.');
          },
          { binary: true }
        );

      } catch (processErr) {
        console.error('Processing failed:', processErr);
        // Clean up the uploaded file if processing fails
        if (savedFilePath && fs.existsSync(savedFilePath)) {
          fs.unlinkSync(savedFilePath);
        }
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: processErr.message }));
      }
    });
  }
  // --- Secure Download Endpoint ---
  else if (req.url.startsWith('/download-model') && req.method === 'GET') {
    if (!isAdmin(req)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Forbidden: Admin access required.' }));
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const filename = url.searchParams.get('file');

    if (!filename || !modelStore.has(filename)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found: Invalid model file.' }));
        return;
    }

    const modelData = modelStore.get(filename);
    const modelPath = modelData.path;

    // Stream the file to the client
    const stream = fs.createReadStream(modelPath);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'model/gltf-binary');
    stream.pipe(res);

  }
  // --- Public View Endpoint ---
  // Serves the model for the client-side viewer.
  // NOTE: In a production environment, this should be secured (e.g., with temporary signed URLs)
  // to ensure only the user who generated the model can view it.
  else if (req.url.startsWith('/view-model') && req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const filename = url.searchParams.get('file');

    if (!filename || !modelStore.has(filename)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found: Invalid model file.' }));
        return;
    }

    const modelData = modelStore.get(filename);
    const modelPath = modelData.path;

    // Stream the file to the client for viewing
    const stream = fs.createReadStream(modelPath);
    res.setHeader('Content-Type', 'model/gltf-binary');
    stream.pipe(res);
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
