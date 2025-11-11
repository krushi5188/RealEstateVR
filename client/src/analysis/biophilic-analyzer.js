// client/src/analysis/biophilic-analyzer.js

/**
 * Calls the server to analyze the biophilic design qualities of the space.
 * @param {object} modelData - The 3D model geometry.
 * @returns {Promise<object>} A promise that resolves with the analysis results from the server.
 */
async function analyzeBiophilicDesign(modelData) {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/analyze-biophilic-design`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // The server expects the raw model data to perform its own analysis
      body: JSON.stringify(modelData),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Biophilic design analysis failed on the server.");
    }

    const data = await response.json();
    return data.report; // The server now wraps the results in a 'report' object
  } catch (error) {
    console.error("Error calling biophilic analysis endpoint:", error);
    // Re-throw the error so the UI can catch it and display a message
    throw error;
  }
}

export { analyzeBiophilicDesign };
