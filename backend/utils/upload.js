// WatchtowerX/backend/utils/upload.js

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// Enforce env vars in non-test mode
if (process.env.NODE_ENV !== "test") {
  const required = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "S3_BUCKET"];
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`❌ Missing required S3 config: ${key}`);
      process.exit(1);
    }
  }
}

// S3 instance
const s3 = new AWS.S3({ region: process.env.AWS_REGION });

function decodeBase64Image(dataUri) {
  const match = dataUri.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("❌ Invalid data URI format");
  return {
    buffer: Buffer.from(match[2], "base64"),
    contentType: match[1]
  };
}

module.exports.uploadSnapshot = async (dataUri) => {
  if (!dataUri) throw new Error("Missing snapshot data");

  // Bypass for tests
  if (process.env.NODE_ENV === "test") {
    return process.env.PLACEHOLDER_SNAPSHOT_URL;
  }

  const { buffer, contentType } = decodeBase64Image(dataUri);
  const key = `snapshots/${uuidv4()}`;

  await s3.putObject({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType
    // ❌ DO NOT include ACL here!
  }).promise();

  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
