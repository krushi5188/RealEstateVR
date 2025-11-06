const http = require('http');
const multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');
const serveStatic = require('serve-static');
const { processImage } = require('./image-processor');

const port = 5000;
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const BUILD_DIR = path.join(__dirname, '..', 'client', 'build');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const serve = serveStatic(BUILD_DIR, { 'index': ['index.html'] });

const server = http.createServer((req, res) => {
  const done = () => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    // Serve static files from the 'uploads' directory
    if (req.method === 'GET' && req.url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, req.url);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end('File not found');
          return;
        }
        res.statusCode = 200;
        res.end(data);
      });
      return;
    }

    if (req.url === '/upload' && req.method === 'POST') {
      const form = new multiparty.Form({ uploadDir: UPLOADS_DIR });

      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          res.end('Error parsing form data.');
          return;
        }

        const uploadedFile = files.floorPlan[0];
        const newFileName = uploadedFile.path.split(path.sep).pop();
        const fileUrl = `/uploads/${newFileName}`;

        console.log('File uploaded:', uploadedFile.originalFilename);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'File uploaded successfully!', fileUrl }));
      });
    } else if (req.url === '/calibrate' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
          body += chunk.toString();
      });
      req.on('end', async () => {
          try {
              const data = JSON.parse(body);
              console.log('Calibration data received:', data);

              const imageName = data.fileUrl.split('/').pop();
              const imagePath = path.join(UPLOADS_DIR, imageName);

              const processedData = await processImage(imagePath);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                message: 'Image processed successfully!',
                processedImageUrl: processedData.processedImageUrl.replace(UPLOADS_DIR, '/uploads')
              }));
          } catch (error) {
              console.error('Error processing image:', error);
              res.statusCode = 500;
              res.end('Error processing image.');
          }
      });
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  };

  serve(req, res, done);
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
