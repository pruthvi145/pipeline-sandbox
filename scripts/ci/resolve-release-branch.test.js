const {
  expectedReleaseBranch,
  isCurrentReleaseBranch,
} = require("./resolve-release-branch");

describe("expectedReleaseBranch", () => {
  it("builds the release branch name for a normal tag", () => {
    expect(expectedReleaseBranch("v1.20.1")).toBe("release/v1.20.1");
  });

  it("returns null for a falsy latestTag", () => {
    expect(expectedReleaseBranch(undefined)).toBeNull();
    expect(expectedReleaseBranch(null)).toBeNull();
    expect(expectedReleaseBranch("")).toBeNull();
  });
});

describe("isCurrentReleaseBranch", () => {
  it("returns true when branchName matches the current release branch", () => {
    expect(isCurrentReleaseBranch("release/v1.20.1", "v1.20.1")).toBe(true);
  });

  it("returns false when branchName does not match", () => {
    expect(isCurrentReleaseBranch("release/v1.19.0", "v1.20.1")).toBe(false);
  });

  it("returns false when branchName is not a release branch at all", () => {
    expect(isCurrentReleaseBranch("main", "v1.20.1")).toBe(false);
  });

  it("returns false when latestTag is falsy", () => {
    expect(isCurrentReleaseBranch("release/v1.20.1", "")).toBe(false);
    expect(isCurrentReleaseBranch("release/v1.20.1", null)).toBe(false);
  });
});
