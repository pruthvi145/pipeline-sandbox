/**
 * Decides whether a previous release branch has been superseded and should
 * be deleted.
 *
 * .github/workflows/promote-to-production.yaml creates a permanent-looking
 * release/vX.Y.Z branch for whatever tag is being promoted (job
 * create-release-branch). Once a newer tag is promoted and gets its own
 * release branch, the previous one has done its job - it existed only so
 * hotfix PRs had something to target - and should be deleted. It must NOT
 * be deleted on a same-tag redeploy, a forced downgrade, or a first-ever
 * promotion (no previous tag).
 *
 * Usage (from GitHub Actions):
 *   const { branchToDelete } = require('./cleanup-superseded-release-branch');
 *   const branch = branchToDelete({ tag, currentLatestTag, isNewerThanLatest });
 */

/**
 * @param {{tag: string, currentLatestTag: string|null, isNewerThanLatest: boolean}} params
 *   isNewerThanLatest is already computed by evaluatePromotion() - don't recompute it here
 * @returns {string|null} branch to delete, e.g. "release/v1.20.0", or null
 */
function branchToDelete({ tag, currentLatestTag, isNewerThanLatest }) {
  if (!currentLatestTag) return null;
  if (currentLatestTag === tag) return null;
  if (!isNewerThanLatest) return null;

  return `release/${currentLatestTag}`;
}

module.exports = { branchToDelete };
