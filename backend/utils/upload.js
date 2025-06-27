// WatchtowerX/backend/utils/upload.js

/**
 * Temporary stub for snapshot uploads.
 * Replace with real logic (Supabase, S3, etc.) in production.
 *
 * @param {string} base64Image – The image data in base64.
 * @returns {Promise<string>}  – A public URL or null.
 */
module.exports.uploadSnapshot = async (base64Image) => {
  if (!base64Image) {
    throw new Error("Missing base64Image");
  }
  // Return mocked URL
  return process.env.PLACEHOLDER_SNAPSHOT_URL || "https://dummy.url/image.png";
};

