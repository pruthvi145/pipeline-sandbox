/**
 * Reverts .release-please-manifest.json after a failed hotfix release, so
 * the retry proposes the same patch version instead of skipping ahead.
 * Manifest values have no "v" prefix (tag "v1.21.0" -> manifest "1.21.0").
 * Defensive: only reverts if the manifest still holds the failed version -
 * otherwise reports reverted:false instead of clobbering a newer change.
 */

/**
 * @param {object} manifest - the parsed .release-please-manifest.json object, e.g. { ".": "1.21.0" }
 * @param {{ path?: string, failedVersion: string, previousVersion: string }} params
 *   - path: the manifest key to revert, defaults to "." (this repo only ever uses ".")
 *   - failedVersion: the version string (no "v" prefix, e.g. "1.20.1") that the manifest currently holds and that failed
 *   - previousVersion: the version string (no "v" prefix, e.g. "1.20.0") to revert back to
 * @returns {{ manifest: object, reverted: boolean }} a NEW object (the input is never mutated), and whether the revert actually happened
 */
function revertManifestVersion(
  manifest,
  { path = ".", failedVersion, previousVersion }
) {
  if (manifest[path] === failedVersion) {
    return {
      manifest: { ...manifest, [path]: previousVersion },
      reverted: true,
    };
  }

  return { manifest: { ...manifest }, reverted: false };
}

/**
 * Strips a leading "v" from a git tag to get the bare version string the
 * manifest uses, e.g. "v1.20.1" -> "1.20.1". Returns the input unchanged
 * if it has no leading "v".
 * @param {string} tag
 * @returns {string}
 */
function tagToManifestVersion(tag) {
  return tag.startsWith("v") ? tag.slice(1) : tag;
}

module.exports = { revertManifestVersion, tagToManifestVersion };
