import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { createR2Client, requireEnv } from "./lib/r2-client.mjs";
import { filesToPrune } from "./lib/prune-snapshots.js";

// Trimmed from the real app's schema list (public/stripe/audit/supabase_migrations)
// to just what this sandbox actually has - no Stripe or audit schema here.
const SNAPSHOT_SCHEMAS = ["public", "supabase_migrations"];

function dumpSchemas({ extraArgs = [], outFile }) {
  const args = ["supabase", "db", "dump", "--linked"];
  for (const schema of SNAPSHOT_SCHEMAS) args.push("-s", schema);
  args.push(...extraArgs, "-f", outFile);
  // eslint-disable-next-line sonarjs/no-os-command-from-path -- npx must resolve from PATH in CI shells; args are fixed literals
  execFileSync("npx", args, { stdio: "inherit" });
}

async function main() {
  const releaseTag = requireEnv("RELEASE_TAG");
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const bucket = requireEnv("R2_DB_BACKUP_BUCKET");
  const accessKeyId = requireEnv("R2_DB_BACKUP_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_DB_BACKUP_SECRET_ACCESS_KEY");

  const workDir = mkdtempSync(join(tmpdir(), "db-snapshot-"));
  const schemaFile = join(workDir, "schema.sql");
  const dataFile = join(workDir, "data.sql");
  const dumpFile = join(workDir, `${releaseTag}.dump`);

  console.log(
    `📦 Dumping schema for ${SNAPSHOT_SCHEMAS.join(", ")} (${releaseTag})...`
  );
  dumpSchemas({ outFile: schemaFile });

  console.log(`📦 Dumping data for ${SNAPSHOT_SCHEMAS.join(", ")}...`);
  dumpSchemas({ extraArgs: ["--data-only", "--use-copy"], outFile: dataFile });

  writeFileSync(dumpFile, readFileSync(schemaFile));
  appendFileSync(dumpFile, "\n");
  appendFileSync(dumpFile, readFileSync(dataFile));

  const takenAt = new Date().toISOString();
  const objectKey = `${releaseTag}.dump`;
  const client = createR2Client({ accountId, accessKeyId, secretAccessKey });

  console.log(`☁️  Uploading ${objectKey} to R2 bucket ${bucket}...`);
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: readFileSync(dumpFile),
      Metadata: { "snapshot-taken-at": takenAt },
    })
  );
  console.log(`✅ Uploaded ${objectKey} (snapshot-taken-at=${takenAt})`);

  const listing = await client.send(
    new ListObjectsV2Command({ Bucket: bucket })
  );
  const existing = (listing.Contents || []).map((obj) => obj.Key);
  const toDelete = filesToPrune(existing, 3);

  if (toDelete.length > 0) {
    console.log(`🗑️  Pruning ${toDelete.length} old snapshot(s): ${toDelete.join(", ")}`);
    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: toDelete.map((Key) => ({ Key })) },
      })
    );
  } else {
    console.log("🗑️  Nothing to prune - retention window not exceeded");
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      [
        "## 📦 Database Snapshot",
        "",
        `**Object:** ${objectKey}`,
        `**Taken at:** ${takenAt}`,
        `**Schemas:** ${SNAPSHOT_SCHEMAS.join(", ")}`,
        `**Pruned:** ${toDelete.length > 0 ? toDelete.join(", ") : "none"}`,
        "",
      ].join("\n")
    );
  }
}

main().catch((err) => {
  console.error("::error::Database snapshot failed:", err);
  process.exit(1);
});
