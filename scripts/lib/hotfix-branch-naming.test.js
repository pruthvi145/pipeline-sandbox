const {
  validateHotfixDescription,
  hotfixBranchName,
} = require("./hotfix-branch-naming");

describe("validateHotfixDescription", () => {
  it("accepts lowercase kebab-case descriptions", () => {
    expect(validateHotfixDescription("fix-login")).toBe(true);
    expect(validateHotfixDescription("gate-premium-routes")).toBe(true);
    expect(validateHotfixDescription("onboarding-profile-id-lookup")).toBe(
      true
    );
    expect(validateHotfixDescription("a")).toBe(true);
  });

  it("rejects uppercase, spaces, ticket numbers, and version numbers", () => {
    expect(validateHotfixDescription("Fix-Login")).toBe(false);
    expect(validateHotfixDescription("fix login")).toBe(false);
    expect(validateHotfixDescription("AP-1234-fix-login")).toBe(false);
    expect(validateHotfixDescription("v1.20.1-fix-login")).toBe(false);
  });

  it("rejects empty, non-string, and overly long descriptions", () => {
    expect(validateHotfixDescription("")).toBe(false);
    expect(validateHotfixDescription(undefined)).toBe(false);
    expect(validateHotfixDescription("a".repeat(41))).toBe(false);
    expect(validateHotfixDescription("a".repeat(40))).toBe(true);
  });
});

describe("hotfixBranchName", () => {
  it("builds hotfix/<tag>-<description>", () => {
    expect(hotfixBranchName("v1.20.0", "fix-login")).toBe(
      "hotfix/v1.20.0-fix-login"
    );
  });
});
