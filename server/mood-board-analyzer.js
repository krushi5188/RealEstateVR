const { createCanvas, loadImage } = require('canvas');

// --- K-Means Clustering ---
// A simple implementation to find dominant colors in an image.

/**
 * Gets the Euclidean distance between two colors.
 */
const colorDistance = (a, b) => {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow(a[2] - b[2], 2)
  );
};

/**
 * Assigns each pixel to the closest centroid.
 */
const assignToCentroids = (pixels, centroids) => {
  const assignments = new Array(pixels.length).fill(0);
  for (let i = 0; i < pixels.length; i++) {
    let minDistance = Infinity;
    let bestCentroid = 0;
    for (let j = 0; j < centroids.length; j++) {
      const distance = colorDistance(pixels[i], centroids[j]);
      if (distance < minDistance) {
        minDistance = distance;
        bestCentroid = j;
      }
    }
    assignments[i] = bestCentroid;
  }
  return assignments;
};

/**
 * Calculates the new centroids based on the mean color of assigned pixels.
 */
const updateCentroids = (pixels, assignments, k) => {
  const newCentroids = new Array(k).fill(0).map(() => [0, 0, 0]);
  const counts = new Array(k).fill(0);

  for (let i = 0; i < pixels.length; i++) {
    const centroidIndex = assignments[i];
    newCentroids[centroidIndex][0] += pixels[i][0];
    newCentroids[centroidIndex][1] += pixels[i][1];
    newCentroids[centroidIndex][2] += pixels[i][2];
    counts[centroidIndex]++;
  }

  for (let i = 0; i < k; i++) {
    if (counts[i] > 0) {
      newCentroids[i][0] = Math.round(newCentroids[i][0] / counts[i]);
      newCentroids[i][1] = Math.round(newCentroids[i][1] / counts[i]);
      newCentroids[i][2] = Math.round(newCentroids[i][2] / counts[i]);
    } else {
      // Re-initialize centroid if it has no pixels
      newCentroids[i] = [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
      ];
    }
  }
  return newCentroids;
};


/**
 * Extracts a color palette from an image buffer using K-Means clustering.
 * @param {Buffer} imageBuffer - The image data.
 * @param {number} k - The number of colors to extract.
 * @returns {Promise<string[]>} - A promise that resolves to an array of hex color strings.
 */
async function extractColorPalette(imageBuffer, k = 5) {
  try {
    const image = await loadImage(imageBuffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const pixels = [];
    // We only sample a subset of pixels for performance
    const step = 4 * 5; // Every 5th pixel
    for (let i = 0; i < imageData.data.length; i += step) {
      pixels.push([
        imageData.data[i],
        imageData.data[i + 1],
        imageData.data[i + 2],
      ]);
    }

    // Initialize centroids randomly
    let centroids = [];
    for (let i = 0; i < k; i++) {
      centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
    }

    // Iterate to find the best centroids
    const maxIterations = 20;
    for (let i = 0; i < maxIterations; i++) {
      const assignments = assignToCentroids(pixels, centroids);
      const newCentroids = updateCentroids(pixels, assignments, k);
      // If centroids stop changing, we've converged
      if (JSON.stringify(newCentroids) === JSON.stringify(centroids)) break;
      centroids = newCentroids;
    }

    // Convert RGB centroids to hex strings
    const palette = centroids.map(c =>
      `#${c[0].toString(16).padStart(2, '0')}${c[1].toString(16).padStart(2, '0')}${c[2].toString(16).padStart(2, '0')}`
    );

    return palette;
  } catch (error) {
    console.error("Error extracting color palette:", error);
    throw new Error("Failed to process the mood board image.");
  }
}

module.exports = { extractColorPalette };
