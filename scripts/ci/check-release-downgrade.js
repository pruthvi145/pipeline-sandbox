/**
 * Guards against silently deploying an older version over a newer one
 * that's already live in production.
 *
 * "Currently live" is approximated as whatever GitHub currently calls the
 * latest (non-draft, non-prerelease) release. Extracted from the
 * validate-release job in .github/workflows/promote-to-production.yaml so
 * the comparison logic can be unit tested directly.
 *
 * Usage (from GitHub Actions):
 *   const { validateTagName, evaluatePromotion } = require('./check-release-downgrade');
 *   if (!validateTagName(tag)) { core.setFailed(...); return; }
 *   const result = evaluatePromotion({ tag, currentLatestTag, forceDowngrade });
 */

function validateTagName(tag) {
  return /^v\d+\.\d+\.\d+$/.test(tag);
}

function parseVersionTag(tag) {
  const m = tag.match(/^v(\d+)\.(\d+)\.(\d+)$/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function compareVersionParts(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function evaluatePromotion({ tag, currentLatestTag, forceDowngrade }) {
  if (currentLatestTag && currentLatestTag !== tag) {
    // Fail closed, not open: a malformed tag on either side (most likely a
    // pre-convention or manually-created release standing in as "latest")
    // means the comparison below can't be trusted - don't silently wave the
    // promotion through just because the numbers couldn't be compared.
    if (!validateTagName(tag) || !validateTagName(currentLatestTag)) {
      if (!forceDowngrade) {
        return {
          allowed: false,
          isNewerThanLatest: false,
          reason:
            `Refusing to promote ${tag}: can't safely compare it against the current latest release tag ` +
            `"${currentLatestTag}" - one of the two isn't strict v-prefixed semver. ` +
            `Re-run with "force_downgrade" enabled if this is intentional.`,
        };
      }
      return { allowed: true, isNewerThanLatest: false, reason: null };
    }

    const cmp = compareVersionParts(
      parseVersionTag(tag),
      parseVersionTag(currentLatestTag)
    );
    const isNewerThanLatest = cmp > 0;
    if (cmp < 0 && !forceDowngrade) {
      return {
        allowed: false,
        isNewerThanLatest: false,
        reason:
          `Refusing to promote ${tag}: production is currently on ${currentLatestTag}, which is newer. ` +
          `Promoting ${tag} now would downgrade production. Re-run with "force_downgrade" enabled if this is intentional.`,
      };
    }
    return { allowed: true, isNewerThanLatest, reason: null };
  }

  return { allowed: true, isNewerThanLatest: true, reason: null };
}

module.exports = {
  validateTagName,
  parseVersionTag,
  compareVersionParts,
  evaluatePromotion,
};
