const {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} = require("@aws-sdk/client-s3");

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const OBJECT_STORE_ENABLED = TRUE_VALUES.has(String(process.env.OBJECT_STORE_ENABLED || "false").toLowerCase());
const OBJECT_STORE_BUCKET = String(process.env.OBJECT_STORE_BUCKET || "innodeploy-artifacts");

let s3Client = null;
let objectStoreReady = false;

const getS3Client = () => {
  if (s3Client) {
    return s3Client;
  }

  s3Client = new S3Client({
    region: process.env.OBJECT_STORE_REGION || "us-east-1",
    endpoint: process.env.OBJECT_STORE_ENDPOINT || undefined,
    forcePathStyle: true,
    credentials:
      process.env.OBJECT_STORE_ACCESS_KEY && process.env.OBJECT_STORE_SECRET_KEY
        ? {
            accessKeyId: process.env.OBJECT_STORE_ACCESS_KEY,
            secretAccessKey: process.env.OBJECT_STORE_SECRET_KEY,
          }
        : undefined,
  });

  return s3Client;
};

const ensureObjectStore = async () => {
  if (!OBJECT_STORE_ENABLED || objectStoreReady) {
    return;
  }

  const client = getS3Client();

  try {
    await client.send(new HeadBucketCommand({ Bucket: OBJECT_STORE_BUCKET }));
    objectStoreReady = true;
    return;
  } catch (_missingBucketError) {
    // Try to create bucket below.
  }

  try {
    await client.send(new CreateBucketCommand({ Bucket: OBJECT_STORE_BUCKET }));
    objectStoreReady = true;
    console.log(`[object-store] Created bucket '${OBJECT_STORE_BUCKET}'`);
  } catch (error) {
    console.warn("[object-store] Object store unavailable", error.message);
  }
};

const uploadJsonArtifact = async ({ key, payload }) => {
  if (!OBJECT_STORE_ENABLED) {
    return { uploaded: false, key: null, reason: "disabled" };
  }

  await ensureObjectStore();

  if (!objectStoreReady) {
    return { uploaded: false, key: null, reason: "unavailable" };
  }

  const client = getS3Client();
  const objectKey = key.endsWith(".json") ? key : `${key}.json`;

  await client.send(
    new PutObjectCommand({
      Bucket: OBJECT_STORE_BUCKET,
      Key: objectKey,
      Body: JSON.stringify(payload),
      ContentType: "application/json",
    })
  );

  return { uploaded: true, key: objectKey, bucket: OBJECT_STORE_BUCKET };
};

module.exports = {
  ensureObjectStore,
  uploadJsonArtifact,
};
