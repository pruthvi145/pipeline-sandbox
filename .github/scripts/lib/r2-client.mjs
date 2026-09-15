import { S3Client } from "@aws-sdk/client-s3";

// R2 is S3-compatible; the endpoint is the account's R2 URL, not a region-based
// AWS endpoint. `region` is required by the SDK but unused by R2 - "auto" is
// Cloudflare's documented value.
export function createR2Client({ accountId, accessKeyId, secretAccessKey }) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`::error::${name} is required but not set`);
    process.exit(1);
  }
  return value;
}
