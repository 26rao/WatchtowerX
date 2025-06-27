// WatchtowerX/backend/utils/upload.js

/**
 * A temporary stub for snapshot uploads.
 * Later you can replace this with real Supabase/S3 upload logic.
 *
 * @param {string} base64Image  – The image data in base64 (if sent).
 * @returns {Promise<string>}   – A public URL to the uploaded snapshot.
 */
module.exports.uploadSnapshot = async (base64Image) => {
  // TODO: implement real upload here
  return 'https://via.placeholder.com/300x200.png?text=Snapshot';
};
