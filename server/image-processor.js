const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createCanvas, loadImage } = require('canvas');
const { parse } = require('svg-parser');
const Tesseract = require('tesseract.js');

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

// --- Bitmap (Canvas) Processing Pipeline ---

const THRESHOLD = 128;
const MIN_WALL_LENGTH = 10;

async function extractWallsFromBitmap(filePath) {
    const image = await loadImage(filePath);
    const { width, height } = image;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    // Binarize the image data in-place
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const color = avg > THRESHOLD ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = color;
    }

    const visited = new Array(width * height).fill(false);
    const walls = [];

    const isBlack = (x, y) => data[(y * width + x) * 4] === 0;

    // Horizontal scan
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (isBlack(x, y) && !visited[y * width + x]) {
                let endX = x;
                while (endX + 1 < width && isBlack(endX + 1, y)) {
                    endX++;
                }
                if (endX - x >= MIN_WALL_LENGTH) {
                    walls.push({ x1: x, y1: y, x2: endX, y2: y });
                    for (let i = x; i <= endX; i++) {
                        visited[y * width + i] = true;
                    }
                }
            }
        }
    }

    // Vertical scan
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (isBlack(x, y) && !visited[y * width + x]) {
                let endY = y;
                while (endY + 1 < height && isBlack(x, endY + 1)) {
                    endY++;
                }
                if (endY - y >= MIN_WALL_LENGTH) {
                    walls.push({ x1: x, y1: y, x2: x, y2: endY });
                    for (let i = y; i <= endY; i++) {
                        visited[i * width + x] = true;
                    }
                }
            }
        }
    }
    let { rooms, windows, doors } = identifyRoomsAndWindows(walls, width, height);
    rooms = await labelRoomsWithOCR(rooms, filePath);

    const detectedNorthVector = await detectNorthArrow(filePath);

    return { width, height, walls, rooms, windows, doors, detectedNorthVector };
}

// --- North Arrow Detection ---

async function detectNorthArrow(imagePath) {
    console.log("Attempting to detect North arrow...");
    try {
        const { data: { words } } = await Tesseract.recognize(imagePath, 'eng', {
            tessedit_char_whitelist: 'N',
        });

        const northWord = words.find(w => w.text.trim() === 'N');
        if (!northWord) {
            console.log("No 'N' character found for North arrow detection.");
            return null;
        }

        const { bbox } = northWord;
        const roiX = bbox.x0 - 50;
        const roiY = bbox.y0 - 50;
        const roiWidth = 100;
        const roiHeight = 100;

        const image = await loadImage(imagePath);
        const canvas = createCanvas(roiWidth, roiHeight);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, roiX, roiY, roiWidth, roiHeight, 0, 0, roiWidth, roiHeight);

        // Simple shape detection: look for a triangle
        // This is a simplified heuristic.
        // A real implementation would use more advanced techniques.
        const imageData = ctx.getImageData(0, 0, roiWidth, roiHeight);
        const { data } = imageData;
        let blackPixels = 0;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (avg < 128) {
                blackPixels++;
            }
        }

        // If there are a significant number of black pixels in the ROI
        // assume it's an arrow and default to pointing North (up).
        if (blackPixels > 100) { // Arbitrary threshold
             console.log("Found a shape near 'N', assuming North is up.");
            return { x: 0, y: -1, z: 0 }; // North is 'up' in 2D image space
        }

    } catch (err) {
        console.error("Error during North arrow detection:", err);
    }

    return null;
}

// --- OCR for Room Labeling ---

async function labelRoomsWithOCR(rooms, imagePath) {
    if (!rooms || rooms.length === 0) {
        return [];
    }
    console.log(`Labeling ${rooms.length} rooms with OCR...`);

    const labeledRooms = [];
    for (const room of rooms) {
        const { minX, minY, maxX, maxY } = room.bounds;
        const width = maxX - minX;
        const height = maxY - minY;

        // Create a temporary canvas for the cropped image
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        const image = await loadImage(imagePath);
        ctx.drawImage(image, minX, minY, width, height, 0, 0, width, height);
        const croppedImageBuffer = canvas.toBuffer('image/png');

        const { data: { text } } = await Tesseract.recognize(croppedImageBuffer, 'eng');
        const label = text.trim().split('\n')[0]; // Take the first line of recognized text

        let type = 'room';
        let scale = null;

        if (label) {
            const upperLabel = label.toUpperCase();
            if (upperLabel.includes('STAIR') || upperLabel.includes('STR')) {
                type = 'staircase';
            } else if (upperLabel.includes('LIFT') || upperLabel.includes('ELEV')) {
                type = 'elevator';
            }

            // Attempt to parse dimensions (e.g., "12x14", "10'6\" x 12'0\"")
            // Simplified regex for XxY pattern
            const dimMatch = label.match(/(\d+(?:'\d+")?)\s*[xX]\s*(\d+(?:'\d+")?)/);
            if (dimMatch) {
                const widthText = dimMatch[1];
                const heightText = dimMatch[2];

                // Helper to convert text string to feet
                const parseDim = (str) => {
                    if (str.includes("'")) {
                        const parts = str.split("'");
                        const feet = parseInt(parts[0], 10);
                        const inches = parts[1] ? parseInt(parts[1].replace('"', ''), 10) : 0;
                        return feet + inches / 12;
                    }
                    return parseFloat(str); // Assume feet if just number
                };

                const realWidth = parseDim(widthText);
                const realHeight = parseDim(heightText);

                // Compare with pixel dimensions to calculate scale (pixels per foot)
                const pixelWidth = room.bounds.maxX - room.bounds.minX;
                const pixelHeight = room.bounds.maxY - room.bounds.minY;

                // Average the scale from both dimensions
                const scaleX = pixelWidth / realWidth;
                const scaleY = pixelHeight / realHeight;
                scale = (scaleX + scaleY) / 2;
            }
        }

        labeledRooms.push({
            ...room,
            label: label || `Room ${room.id}`, // Default label if OCR fails
            type: type,
            detectedScale: scale
        });
    }

    console.log("OCR labeling complete.");
    return labeledRooms;
}


// --- Room and Window Identification ---

function identifyRoomsAndWindows(walls, width, height) {
    const rooms = [];
    const windows = [];
    const grid = new Array(height).fill(null).map(() => new Array(width).fill(0));

    // Create a grid representation of the walls
    for (const wall of walls) {
        for (let y = wall.y1; y <= wall.y2; y++) {
            for (let x = wall.x1; x <= wall.x2; x++) {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    grid[y][x] = 1; // Mark wall
                }
            }
        }
    }

    // Flood fill to find rooms
    const visited = new Array(height).fill(null).map(() => new Array(width).fill(false));
    let roomCounter = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (grid[y][x] === 0 && !visited[y][x]) {
                const roomPixels = [];
                const queue = [[x, y]];
                visited[y][x] = true;
                let minX = width, minY = height, maxX = 0, maxY = 0;

                while (queue.length > 0) {
                    const [cx, cy] = queue.shift();
                    roomPixels.push({ x: cx, y: cy });
                    minX = Math.min(minX, cx);
                    minY = Math.min(minY, cy);
                    maxX = Math.max(maxX, cx);
                    maxY = Math.max(maxY, cy);

                    const neighbors = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                    for (const [dx, dy] of neighbors) {
                        const nx = cx + dx;
                        const ny = cy + dy;
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny][nx] === 0 && !visited[ny][nx]) {
                            visited[ny][nx] = true;
                            queue.push([nx, ny]);
                        }
                    }
                }
                if (roomPixels.length > 100) { // Filter out small noise
                    rooms.push({
                        id: roomCounter++,
                        center: { x: Math.round((minX + maxX) / 2), y: Math.round((minY + maxY) / 2) },
                        bounds: { minX, minY, maxX, maxY },
                        pixels: roomPixels,
                    });
                }
            }
        }
    }

    // Identify windows (gaps in exterior walls) and doors (gaps in interior walls)
    const exteriorWalls = [];
    const interiorWalls = [];

    walls.forEach(wall => {
        if (wall.x1 === 0 || wall.x2 === width - 1 || wall.y1 === 0 || wall.y2 === height - 1) {
            exteriorWalls.push(wall);
        } else {
            interiorWalls.push(wall);
        }
    });

    const doors = [];

    // Helper to find gaps
    const findGaps = (wallList, type) => {
        for(const wall of wallList) {
            if(wall.x1 === wall.x2) { //vertical wall
                let lastY = wall.y1;
                for(let y = wall.y1; y <= wall.y2; y++) {
                    if(grid[y][wall.x1] === 0) {
                        if(y - lastY > 5) { //gap of at least 5 pixels
                            if (type === 'window') {
                                windows.push({ x1: wall.x1, y1: lastY, x2: wall.x1, y2: y, type: 'vertical' });
                            } else {
                                doors.push({ x1: wall.x1, y1: lastY, x2: wall.x1, y2: y, type: 'vertical' });
                            }
                        }
                        lastY = y;
                    }
                }
            } else { //horizontal wall
                let lastX = wall.x1;
                for(let x = wall.x1; x <= wall.x2; x++) {
                    if(grid[wall.y1][x] === 0) {
                        if(x - lastX > 5) { //gap of at least 5 pixels
                             if (type === 'window') {
                                windows.push({ x1: lastX, y1: wall.y1, x2: x, y2: wall.y1, type: 'horizontal' });
                            } else {
                                doors.push({ x1: lastX, y1: wall.y1, x2: x, y2: wall.y1, type: 'horizontal' });
                            }
                        }
                        lastX = x;
                    }
                }
            }
        }
    };

    findGaps(exteriorWalls, 'window');
    findGaps(interiorWalls, 'door');

    return { rooms, windows, doors };
}


// --- File Saving Logic (Unchanged) ---

function sanitizeFilename(filename) {
    // Prevent directory traversal attacks.
    if (filename.includes('..')) {
        throw new Error('Invalid filename.');
    }
    // Allow a restricted set of characters.
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
