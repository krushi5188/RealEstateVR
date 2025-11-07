const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Jimp = require('jimp');
const { parse } = require('svg-parser');

const UPLOAD_DIR = path.join(__dirname, 'uploads');

// --- Main Processing Logic ---

async function extractWallData(filePath) {
    const fileExtension = path.extname(filePath).toLowerCase();

    if (fileExtension === '.svg') {
        return extractWallsFromSVG(filePath);
    } else {
        return extractWallsFromBitmap(filePath);
    }
}

// --- SVG Processing Pipeline ---

async function extractWallsFromSVG(filePath) {
    const svgContent = await fs.readFile(filePath, 'utf-8');
    const parsed = parse(svgContent);
    const svgNode = parsed.children[0];

    const walls = [];
    let width = parseFloat(svgNode.properties.width);
    let height = parseFloat(svgNode.properties.height);

    function traverse(node) {
        if (!node.children) return;

        for (const child of node.children) {
            if (child.tagName === 'rect') {
                const x = parseFloat(child.properties.x);
                const y = parseFloat(child.properties.y);
                const w = parseFloat(child.properties.width);
                const h = parseFloat(child.properties.height);
                // Add the 4 walls of the rectangle
                walls.push({ x1: x, y1: y, x2: x + w, y2: y }); // Top
                walls.push({ x1: x, y1: y + h, x2: x + w, y2: y + h }); // Bottom
                walls.push({ x1: x, y1: y, x2: x, y2: y + h }); // Left
                walls.push({ x1: x + w, y1: y, x2: x + w, y2: y + h }); // Right
            }
            // Add logic for <line>, <path>, etc. in the future
            traverse(child);
        }
    }

    traverse(svgNode);

    return { width, height, walls };
}

// --- Bitmap (Jimp) Processing Pipeline ---

const THRESHOLD = 128;
const MIN_WALL_LENGTH = 10;

async function extractWallsFromBitmap(filePath) {
    const image = await Jimp.read(filePath);
    image.greyscale().contrast(1).binarize(THRESHOLD);

    const { width, height } = image.bitmap;
    const visited = Array(width * height).fill(false);
    const walls = [];

    // Horizontal scan
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (isBlack(image, x, y) && !isVisited(visited, x, y, width)) {
                const endX = traceLine(image, x, y, 1, 0, width, height);
                if ((endX - x) >= MIN_WALL_LENGTH) {
                    walls.push({ x1: x, y1: y, x2: endX, y2: y });
                    markVisited(visited, x, y, endX, y, 1, 0, width);
                }
            }
        }
    }

    // Vertical scan
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (isBlack(image, x, y) && !isVisited(visited, x, y, width)) {
                const endY = traceLine(image, x, y, 0, 1, width, height);
                if ((endY - y) >= MIN_WALL_LENGTH) {
                    walls.push({ x1: x, y1: y, x2: x, y2: endY });
                    markVisited(visited, x, y, x, endY, 0, 1, width);
                }
            }
        }
    }

    return { width, height, walls };
}

// Bitmap helper functions
const isBlack = (image, x, y) => (image.getPixelColor(x, y) & 0xff) === 0;
const isVisited = (visited, x, y, width) => visited[y * width + x];
function traceLine(image, x, y, dx, dy, w, h) { let cx=x, cy=y; while(cx>=0&&cx<w&&cy>=0&&cy<h&&isBlack(image,cx,cy)){cx+=dx;cy+=dy;} return dx===1?cx-1:cy-1; }
function markVisited(v,x1,y1,x2,y2,dx,dy,w) { let x=x1,y=y1;const e=dx===1?x2:y2;const p=()=>dx===1?x:y; while(p()<=e){v[y*w+x]=true;x+=dx;y+=dy;}}

// --- File Saving Logic (Unchanged) ---

function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '');
}

async function saveFile(file) {
    if (!file) throw new Error('No file provided.');
    const tempPath = file.path;
    const sanitized = sanitizeFilename(file.originalFilename);
    const uniqueFilename = `${uuidv4()}-${sanitized}`;
    const finalPath = path.join(UPLOAD_DIR, uniqueFilename);
    await fs.rename(tempPath, finalPath);
    return finalPath;
}

module.exports = {
  saveFile,
  extractWallData,
};
