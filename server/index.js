require('dotenv').config();
const http = require('http');
const multiparty = require('multiparty');
const path = require('path');
const fs = require('fs');
const { saveFile, extractWallData } = require('./image-processor');
const { generateModel } = require('./model-generator');
const { analyzeCirculation, createGrid, findPath } = require('./path-analyzer');
const { auditAccessibility } = require('./accessibility-auditor');
const { analyzeDesignPhilosophy } = require('./design-philosophy-analyzer');
const { analyzeAcousticSeparation } = require('./acoustic-separation-analyzer');
const { generateLayouts } = require('./layout-generator');
const { extractColorPalette } = require('./mood-board-analyzer');
const { analyzeBiophilicDesign } = require('./biophilic-analyzer');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const MODELS_DIR = path.join(__dirname, 'models');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(MODELS_DIR)) fs.mkdirSync(MODELS_DIR);

const server = http.createServer((req, res) => {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/generate-model' && req.method === 'POST') {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err || !files.floors || files.floors.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid or missing floor plan uploads.' }));
        return;
      }

      const floorFiles = files.floors;
      const floorLabels = JSON.parse(fields.floorLabels[0]); // Labels sent as a JSON string

      try {
        const floorData = [];
        for (let i = 0; i < floorFiles.length; i++) {
            const file = floorFiles[i];
            const filePath = await saveFile(file);
            const wallData = await extractWallData(filePath);
            wallData.label = floorLabels[i] || `Floor ${i + 1}`;
            floorData.push(wallData);
        }

        // The model generator will now take an array of wall data objects
        const model = generateModel(floorData);

        // Convert TypedArrays to regular arrays for JSON serialization
        const finalOutput = {
          model: {
            vertices: Array.from(model.vertices),
            faces: Array.from(model.faces),
          },
          wallData: floorData // Save all floors' 2D data
        };

        const modelFilename = `${path.basename(floorFiles[0].path, path.extname(floorFiles[0].path))}.json`;
        const modelPath = path.join(MODELS_DIR, modelFilename);

        await fs.promises.writeFile(modelPath, JSON.stringify(finalOutput, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Model generated and saved successfully',
          modelPath: `/models/${modelFilename}`,
          model: finalOutput.model
        }));

      } catch (processErr) {
        console.error('Processing failed:', processErr);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: processErr.message }));
      }
    });
  } else if (req.url === '/models' && req.method === 'GET') {
    fs.readdir(MODELS_DIR, (err, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read models directory.' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(files));
    });
  } else if (req.url.startsWith('/models/') && req.method === 'GET') {
    const filename = req.url.split('/')[2];
    if (!filename) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Filename is required.' }));
        return;
    }

    const authToken = req.headers['authorization'];
    if (authToken !== process.env.ADMIN_SECRET_TOKEN) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Forbidden' }));
        return;
    }

    const filePath = path.join(MODELS_DIR, filename);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Model not found.' }));
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
    });
  } else if (req.url.startsWith('/models/') && req.method === 'DELETE') {
    const filename = req.url.split('/')[2];
    if (!filename) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Filename is required.' }));
        return;
    }

    const authToken = req.headers['authorization'];
    if (authToken !== process.env.ADMIN_SECRET_TOKEN) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Forbidden' }));
        return;
    }

    const filePath = path.join(MODELS_DIR, filename);
    fs.unlink(filePath, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Model not found.' }));
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to delete the model.' }));
            }
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Model deleted successfully.' }));
    });
  } else if (req.url.startsWith('/analyze-circulation/') && req.method === 'GET') {
    const filename = req.url.split('/')[2];
    if (!filename) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Filename is required for analysis.' }));
        return;
    }

    const modelPath = path.join(MODELS_DIR, filename);

    fs.readFile(modelPath, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Model not found.' }));
            return;
        }

        try {
            const modelData = JSON.parse(data);
            if (!modelData.wallData) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Wall data not found in model file.' }));
                return;
            }

            const analysisResults = analyzeCirculation({ wallData: modelData.wallData });

            // The result can be large, so we simplify it for the client.
        const simplifiedResults = {
            paths: analysisResults.paths.map(path => path.map(node => ({ x: node.x, y: node.y }))),
            keyNodes: analysisResults.keyNodes.map(node => ({ x: node.x, y: node.y })),
            gridWidth: analysisResults.grid.length > 0 ? analysisResults.grid[0].length : 0,
            gridHeight: analysisResults.grid.length
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(simplifiedResults));
        } catch (parseErr) {
            console.error('Failed to parse model data for circulation analysis:', parseErr);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to parse model data.' }));
        }
    });
  } else if (req.url.startsWith('/audit-accessibility/') && req.method === 'GET') {
    const filename = req.url.split('/')[2];
    if (!filename) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Filename is required for audit.' }));
        return;
    }
    const modelPath = path.join(MODELS_DIR, filename);

    fs.readFile(modelPath, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Model not found.' }));
            return;
        }

        try {
            const modelData = JSON.parse(data);
            if (!modelData.wallData) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Wall data not found in model file.' }));
                return;
            }
            const auditReport = auditAccessibility(modelData.wallData);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(auditReport));
        } catch (auditErr) {
            console.error('Audit failed:', auditErr);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to run accessibility audit.' }));
        }
    });
  } else if (req.url === '/find-path' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const { start, end, wallData } = JSON.parse(body);
            if (!start || !end || !wallData) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Start, end, and wallData are required.' }));
                return;
            }

            const grid = createGrid(wallData);
            const startNode = grid[start.y][start.x];
            const endNode = grid[end.y][end.x];

            const path = findPath(grid, startNode, endNode);

            const simplifiedPath = path.map(node => ({ x: node.x, y: node.y }));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ path: simplifiedPath }));

        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to find path.' }));
        }
    });
  } else if (req.url.startsWith('/analyze-design-philosophy/') && req.method === 'GET') {
    const filename = req.url.split('/')[2];
    if (!filename) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Filename is required for analysis.' }));
        return;
    }
    const modelPath = path.join(MODELS_DIR, filename);

    fs.readFile(modelPath, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Model not found.' }));
            return;
        }

        try {
            const modelData = JSON.parse(data);
            if (!modelData.wallData) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Wall data not found in model file.' }));
                return;
            }

            // The client will handle the North override; the server uses what's in the file.
            const report = analyzeDesignPhilosophy({
                philosophy: 'Vastu', // Hardcoded for now
                rooms: modelData.wallData.rooms,
                northAngle: modelData.wallData.detectedNorthVector ? 0 : 90 // Simplified logic
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(report));
        } catch (e) {
            console.error('Design philosophy analysis failed:', e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to run design philosophy analysis.' }));
        }
    });
  } else if (req.url === '/analyze-acoustic-separation' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const layoutData = JSON.parse(body);
            // A more robust implementation would fetch this from the saved model data
            if (!layoutData || !layoutData.rooms || !layoutData.adjacencies) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Room and adjacency data are required.' }));
                return;
            }
            const report = analyzeAcousticSeparation(layoutData);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(report));
        } catch (e) {
            console.error('Acoustic separation analysis failed:', e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to run acoustic separation analysis.' }));
        }
    });
  } else if (req.url === '/generate-layouts' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const layoutRequest = JSON.parse(body);
            if (!layoutRequest || !layoutRequest.room || !layoutRequest.furniture) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Room and furniture data are required.' }));
                return;
            }
            const layouts = generateLayouts(layoutRequest);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(layouts));
        } catch (e) {
            console.error('Layout generation failed:', e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to generate layouts.' }));
        }
    });
  } else if (req.url === '/analyze-mood-board' && req.method === 'POST') {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err || !files.file || files.file.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid or missing file upload.' }));
        return;
      }

      const file = files.file[0];
      const imageBuffer = await fs.promises.readFile(file.path);

      try {
        const palette = await extractColorPalette(imageBuffer, 5);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ palette }));
      } catch (analysisErr) {
        console.error('Mood board analysis failed:', analysisErr);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: analysisErr.message }));
      }
    });
  } else if (req.url.startsWith('/analyze-biophilic-design/') && req.method === 'GET') {
    const filename = req.url.split('/')[2];
    if (!filename) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Filename is required for analysis.' }));
        return;
    }
    const modelPath = path.join(MODELS_DIR, filename);

    fs.readFile(modelPath, 'utf8', async (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Model not found.' }));
            return;
        }

        try {
            const modelData = JSON.parse(data);
            if (!modelData.wallData || !modelData.model) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Required data not found in model file.' }));
                return;
            }

            const report = await analyzeBiophilicDesign(modelData);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(report));
        } catch (e) {
            console.error('Biophilic design analysis failed:', e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to run biophilic design analysis.' }));
        }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
