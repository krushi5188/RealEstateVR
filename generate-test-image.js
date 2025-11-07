const { Jimp } = require('jimp');

async function createTestImage() {
  const width = 200;
  const height = 200;
  // Use the destructured Jimp class directly
  const image = new Jimp(width, height, 'white');

  // Define the rectangle for the walls
  const x = 20;
  const y = 20;
  const rectWidth = 160;
  const rectHeight = 160;
  const black = 0x000000ff; // Black color

  // Draw the rectangle (walls)
  for (let i = x; i < x + rectWidth; i++) {
    image.setPixelColor(black, i, y); // Top
    image.setPixelColor(black, i, y + rectHeight - 1); // Bottom
  }
  for (let j = y; j < y + rectHeight; j++) {
    image.setPixelColor(black, x, j); // Left
    image.setPixelColor(black, x + rectWidth - 1, j); // Right
  }

  await image.writeAsync('test-data/simple-room.png');
  console.log('Test image created successfully!');
}

createTestImage();
