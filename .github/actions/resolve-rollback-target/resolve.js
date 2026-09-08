function parseVersion(tag) {
  const match = /^v(\d+)\.(\d+)\.(\d+)$/.exec(tag);
  if (!match) {
    throw new Error(
      `Tag "${tag}" does not match strict v-prefixed semver (e.g. v1.7.3)`
    );
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function isOlderThan(tag, otherTag) {
  const [major, minor, patch] = parseVersion(tag);
  const [otherMajor, otherMinor, otherPatch] = parseVersion(otherTag);
  if (major !== otherMajor) return major < otherMajor;
  if (minor !== otherMinor) return minor < otherMinor;
  return patch < otherPatch;
}

function resolveRollbackTarget({ requestedTag, liveTag, releases }) {
  if (requestedTag) {
    const target = releases.find((r) => r.tag === requestedTag);
    if (!target) {
      throw new Error(`Tag "${requestedTag}" has no matching release`);
    }
    if (!isOlderThan(target.tag, liveTag)) {
      throw new Error(
        `${requestedTag} is not older than the live release (${liveTag}) - that's not a rollback`
      );
    }
    return { tag: target.tag, resolvedVia: "manual" };
  }

  const liveIndex = releases.findIndex((r) => r.tag === liveTag);
  if (liveIndex === -1 || liveIndex + 1 >= releases.length) {
    throw new Error(
      `No stable release exists before the current live release (${liveTag}) - nothing to roll back to`
    );
  }
  return { tag: releases[liveIndex + 1].tag, resolvedVia: "auto" };
}

function detectMigrationBoundary(changedFiles) {
  return changedFiles.some((f) => f.startsWith("supabase/migrations/"));
}

module.exports = {
  resolveRollbackTarget,
  detectMigrationBoundary,
  isOlderThan,
};
