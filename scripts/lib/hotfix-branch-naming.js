// Pure functions - no git/gh deps - so they're unit-testable via jest.
// Used by scripts/hotfix-start.js.

// Matches the pattern hotfix-pr-checks.yaml's ancestor-check already expects
// for hotfix branch names: lowercase kebab-case, 1-40 chars, no ticket
// number or version - those get added separately (the hotfix/<tag>- prefix).
const HOTFIX_DESCRIPTION_RE = /^[a-z0-9-]{1,40}$/;

function validateHotfixDescription(description) {
  return (
    typeof description === "string" && HOTFIX_DESCRIPTION_RE.test(description)
  );
}

function hotfixBranchName(tag, description) {
  return `hotfix/${tag}-${description}`;
}

module.exports = { validateHotfixDescription, hotfixBranchName };
