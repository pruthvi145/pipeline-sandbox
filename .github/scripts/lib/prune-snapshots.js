function parseVersion(filename) {
  const match = /^v(\d+)\.(\d+)\.(\d+)\.dump$/.exec(filename);
  if (!match) {
    throw new Error(
      `Snapshot filename "${filename}" does not match vX.Y.Z.dump`
    );
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareVersions(a, b) {
  const [aMajor, aMinor, aPatch] = parseVersion(a);
  const [bMajor, bMinor, bPatch] = parseVersion(b);
  if (aMajor !== bMajor) return aMajor - bMajor;
  if (aMinor !== bMinor) return aMinor - bMinor;
  return aPatch - bPatch;
}

function filesToPrune(existingFilenames, keep = 3) {
  if (keep < 0) {
    throw new Error(`keep must be >= 0, got ${keep}`);
  }
  const sorted = [...existingFilenames].sort(compareVersions);
  if (sorted.length <= keep) return [];
  return keep === 0 ? sorted : sorted.slice(0, sorted.length - keep);
}

module.exports = { filesToPrune, compareVersions };
