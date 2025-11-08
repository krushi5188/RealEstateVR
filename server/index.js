require('dotenv').config();
const http = require('http');
const multiparty = require('multiparty');
const path = require('path');
const fs = require('fs');
const { saveFile, extractWallData } = require('./image-processor');
const { generateModel } = require('./model-generator');

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
      if (err || !files.file || files.file.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid or missing file upload.' }));
        return;
      }

      const file = files.file[0];

      try {
        const filePath = await saveFile(file);
        const wallData = await extractWallData(filePath);
        const model = generateModel(wallData);

        // Convert TypedArrays to regular arrays for JSON serialization
        const serializedModel = {
          vertices: Array.from(model.vertices),
          faces: Array.from(model.faces),
        };

        const modelFilename = `${path.basename(filePath, path.extname(filePath))}.json`;
        const modelPath = path.join(MODELS_DIR, modelFilename);

        await fs.promises.writeFile(modelPath, JSON.stringify(serializedModel, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Model generated and saved successfully',
          modelPath: `/models/${modelFilename}`,
          model: serializedModel
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
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
