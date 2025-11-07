const Jimp = require('jimp');
const path = require('path');

console.log('Starting debug script...');

async function testImageProcessing() {
  try {
    const imagePath = path.join(__dirname, 'test-data', 'simple-floor-plan.png');
    console.log(`Attempting to read image at: ${imagePath}`);

    // CORRECTED: Using the proper syntax from the documentation
    const image = await Jimp.read(imagePath);
    console.log('Jimp successfully read the image.');

    image.greyscale();
    console.log('Jimp successfully converted image to greyscale.');

    const { width, height } = image.bitmap;
    console.log(`Image dimensions: ${width}x${height}`);

    console.log('---');
    console.log('SUCCESS: The core image processing logic with Jimp is working correctly.');
    console.log('---');

  } catch (error) {
    console.error('---');
    console.error('ERROR: The debug script failed.');
    console.error(error);
    console.error('---');
    process.exit(1);
  }
}

testImageProcessing();
