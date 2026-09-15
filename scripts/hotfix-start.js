#!/usr/bin/env node
// Starts a hotfix locally - no CI automation creates a branch, this script
// does it on demand. See docs on the hotfix pipeline design for the full
// flow; this is step 1: `npm run hotfix:start -- <description>`.
//
// Usage:
//   npm run hotfix:start -- fix-login
//
// What it does:
//   1. Looks up the current production release tag (gh release view).
//   2. Creates release/<tag> from that tag, if it doesn't already exist on
//      origin (so a second hotfix on the same version reuses the same
//      branch instead of trying to recreate it).
//   3. Creates hotfix/<tag>-<description> off it and checks it out.

const { execFileSync } = require("node:child_process");
const {
  validateHotfixDescription,
  hotfixBranchName,
} = require("./lib/hotfix-branch-naming.js");
const { expectedReleaseBranch } = require("./ci/resolve-release-branch.js");

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", ...opts });
}

function runVisible(cmd, args) {
  execFileSync(cmd, args, { stdio: "inherit" });
}

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

function main() {
  const description = process.argv[2];

  if (!description) {
    fail(
      "Usage: npm run hotfix:start -- <description>\n" +
        "  description: lowercase kebab-case, 1-40 chars, e.g. fix-login\n" +
        "  (no ticket number, no version - those get added automatically)"
    );
  }

  if (!validateHotfixDescription(description)) {
    fail(
      `Invalid description "${description}" - must match [a-z0-9-]{1,40} ` +
        "(lowercase kebab-case, no spaces, no ticket number, no version)."
    );
  }

  const status = run("git", ["status", "--porcelain"]);
  if (status.trim()) {
    fail(
      "Working tree is not clean. Commit or stash your changes before starting a hotfix."
    );
  }

  console.log("Fetching latest tags from origin...");
  runVisible("git", ["fetch", "origin", "--tags"]);

  console.log("Looking up the current production release...");
  let latestTag;
  try {
    latestTag = run("gh", [
      "release",
      "view",
      "--json",
      "tagName",
      "--jq",
      ".tagName",
    ]).trim();
  } catch (err) {
    fail(
      `Could not look up the current release via 'gh release view'. Is gh authenticated?\n${err.message}`
    );
  }
  if (!latestTag) {
    fail("No production release found - nothing to branch a hotfix from yet.");
  }

  const releaseBranch = expectedReleaseBranch(latestTag);
  const hotfixBranch = hotfixBranchName(latestTag, description);

  const remoteRef = run("git", [
    "ls-remote",
    "--heads",
    "origin",
    releaseBranch,
  ]).trim();
  if (remoteRef) {
    console.log(`${releaseBranch} already exists on origin - reusing it.`);
    runVisible("git", [
      "fetch",
      "origin",
      `${releaseBranch}:refs/remotes/origin/${releaseBranch}`,
    ]);
  } else {
    console.log(`Creating ${releaseBranch} from tag ${latestTag}...`);
    // refs/tags/<tag> points at a tag OBJECT for an annotated tag, not a
    // commit - pushing that straight into refs/heads/<branch> would leave
    // the branch pointing at the tag object instead. rev-list dereferences
    // either kind of tag down to the actual commit first.
    const commitSha = run("git", ["rev-list", "-n", "1", latestTag]).trim();
    runVisible("git", [
      "push",
      "origin",
      `${commitSha}:refs/heads/${releaseBranch}`,
    ]);
    runVisible("git", [
      "fetch",
      "origin",
      `${releaseBranch}:refs/remotes/origin/${releaseBranch}`,
    ]);
  }

  console.log(`Creating ${hotfixBranch} off ${releaseBranch}...`);
  runVisible("git", [
    "checkout",
    "-b",
    hotfixBranch,
    `origin/${releaseBranch}`,
  ]);

  console.log(
    `\n✓ Ready. You're on ${hotfixBranch}, branched from ${releaseBranch} (tag ${latestTag}).`
  );
  console.log(
    "\nNext: make your fix, commit with a conventional-commit message (fix: ...), then:"
  );
  console.log(`  gh pr create --base ${releaseBranch} --head ${hotfixBranch}`);
}

main();
