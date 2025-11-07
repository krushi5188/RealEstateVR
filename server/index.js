const http = require('http');
const multiparty = require('multiparty');
const path = require('path');
const fs = require('fs');
const { saveFile, extractWallData } = require('./image-processor');
const { generateModel } = require('./model-generator');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const server = http.createServer((req, res) => {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Model generated successfully', model: serializedModel }));

      } catch (processErr) {
        console.error('Processing failed:', processErr);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: processErr.message }));
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
