import { writeFileSync, appendFileSync } from "node:fs";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { createR2Client, requireEnv } from "./lib/r2-client.mjs";

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function main() {
  const releaseTag = requireEnv("SNAPSHOT_TAG");
  const outFile = requireEnv("SNAPSHOT_OUT_FILE");
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const bucket = requireEnv("R2_DB_BACKUP_BUCKET");
  const accessKeyId = requireEnv("R2_DB_BACKUP_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_DB_BACKUP_SECRET_ACCESS_KEY");

  const objectKey = `${releaseTag}.dump`;
  const client = createR2Client({ accountId, accessKeyId, secretAccessKey });

  console.log(`☁️  Downloading ${objectKey} from R2 bucket ${bucket}...`);
  let result;
  try {
    result = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: objectKey })
    );
  } catch (err) {
    if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
      console.error(
        `::error::No snapshot found in R2 for "${objectKey}". This live release predates ` +
          "the retention window (only the newest 3 snapshots are kept), or a snapshot was " +
          "never taken for it (e.g. it deployed with take-snapshot disabled). A restore " +
          "cannot proceed without this snapshot."
      );
      process.exit(1);
    }
    throw err;
  }

  const body = await streamToBuffer(result.Body);
  writeFileSync(outFile, body);

  const takenAt = result.Metadata?.["snapshot-taken-at"] ?? result.LastModified?.toISOString();
  if (!takenAt) {
    console.error(
      `::error::Downloaded ${objectKey} but it carries no snapshot-taken-at metadata and no ` +
        "LastModified timestamp - cannot determine the reconciliation cutoff."
    );
    process.exit(1);
  }

  console.log(`✅ Downloaded ${objectKey} to ${outFile} (snapshot-taken-at=${takenAt})`);

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `snapshot_taken_at=${takenAt}\n`);
  }
}

main().catch((err) => {
  console.error("::error::Database snapshot download failed:", err);
  process.exit(1);
});
