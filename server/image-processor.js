const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.join(__dirname, 'uploads');

/**
 * Sanitizes a filename by removing potentially dangerous characters.
 * @param {string} filename The original filename.
 * @returns {string} The sanitized filename.
 */
function sanitizeFilename(filename) {
  // Replace any character that is not a letter, number, dot, or underscore with an empty string.
  return filename.replace(/[^a-zA-Z0-9._-]/g, '');
}

/**
 * Saves the uploaded file to the designated uploads directory with a secure, unique name.
 * @param {object} file The file object from multiparty.
 * @returns {Promise<string>} A promise that resolves with the final file path.
 */
function processImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided.'));
    }

    const tempPath = file.path;
    const originalFilename = file.originalFilename;
    const sanitizedFilename = sanitizeFilename(originalFilename);
    const uniqueFilename = `${uuidv4()}-${sanitizedFilename}`;
    const finalPath = path.join(UPLOAD_DIR, uniqueFilename);

    fs.rename(tempPath, finalPath, (err) => {
      if (err) {
        return reject(new Error('Error saving the file.'));
      }
      resolve(finalPath);
    });
  });
}

module.exports = {
  processImage,
};
