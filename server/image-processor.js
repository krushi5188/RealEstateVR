const Jimp = require('jimp');

async function processImage(imagePath) {
  try {
    const image = await Jimp.read(imagePath);

    // 1. Convert to grayscale
    image.grayscale();

    // 2. Apply Sobel edge detection
    const edgeDetectedImage = sobel(image);

    // For now, save the processed image to a file for debugging
    const outputPath = imagePath.replace(/(\.[\w\d_-]+)$/i, '_processed$1');
    await edgeDetectedImage.writeAsync(outputPath);

    // In the future, this function will return the 3D model data
    return {
      processedImageUrl: outputPath,
      // ... 3D model data will go here
    };

  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

// Simple Sobel operator implementation
function sobel(image) {
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const newImage = new Jimp(width, height);

    const kernelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];

    const kernelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let pixelX = 0;
            let pixelY = 0;

            for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                    const pixel = Jimp.intToRGBA(image.getPixelColor(x + i, y + j));
                    pixelX += pixel.r * kernelX[j + 1][i + 1];
                    pixelY += pixel.r * kernelY[j + 1][i + 1];
                }
            }

            const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
            const color = Jimp.rgbaToInt(magnitude, magnitude, magnitude, 255);
            newImage.setPixelColor(color, x, y);
        }
    }

    return newImage;
}


module.exports = {
  processImage,
};
