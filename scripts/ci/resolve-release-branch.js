/**
 * Resolves and checks the release/vX.Y.Z branch name for the current
 * production release - used by hotfix-pr-checks.yaml's ancestor-check and
 * release-please.yaml's verify-current-release-branch to confirm a hotfix
 * PR or push targets the branch matching the live tag, not a superseded one.
 */

/**
 * Computes the release branch name for a given tag, e.g. "v1.20.1" -> "release/v1.20.1".
 *
 * Returns null for a falsy/empty latestTag instead of throwing, since both
 * call sites already branch on "no release found yet" (a 404 from
 * getLatestRelease) before ever calling this - there's no tag to compute a
 * branch name from in that case.
 *
 * @param {string} latestTag
 * @returns {string | null}
 */
function expectedReleaseBranch(latestTag) {
  if (!latestTag) {
    return null;
  }
  return `release/${latestTag}`;
}

/**
 * Checks whether branchName is the current production release branch for latestTag.
 *
 * @param {string} branchName
 * @param {string} latestTag
 * @returns {boolean}
 */
function isCurrentReleaseBranch(branchName, latestTag) {
  return branchName === expectedReleaseBranch(latestTag);
}

module.exports = { expectedReleaseBranch, isCurrentReleaseBranch };
