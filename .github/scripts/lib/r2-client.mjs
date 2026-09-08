import { S3Client } from "@aws-sdk/client-s3";

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
