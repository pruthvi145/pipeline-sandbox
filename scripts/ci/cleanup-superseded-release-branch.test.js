const { branchToDelete } = require("./cleanup-superseded-release-branch");

describe("branchToDelete", () => {
  it("returns the old release branch when superseded by a newer tag", () => {
    const result = branchToDelete({
      tag: "v1.20.1",
      currentLatestTag: "v1.20.0",
      isNewerThanLatest: true,
    });
    expect(result).toBe("release/v1.20.0");
  });

  it("returns null on a same-tag redeploy", () => {
    const result = branchToDelete({
      tag: "v1.20.1",
      currentLatestTag: "v1.20.1",
      isNewerThanLatest: true,
    });
    expect(result).toBeNull();
  });

  it("returns null on a forced downgrade (not newer than latest)", () => {
    const result = branchToDelete({
      tag: "v1.19.0",
      currentLatestTag: "v1.20.0",
      isNewerThanLatest: false,
    });
    expect(result).toBeNull();
  });

  it("returns null when there was no previous tag (first-ever promotion)", () => {
    const result = branchToDelete({
      tag: "v1.0.0",
      currentLatestTag: null,
      isNewerThanLatest: true,
    });
    expect(result).toBeNull();
  });

  it("returns null when currentLatestTag is undefined", () => {
    const result = branchToDelete({
      tag: "v1.0.0",
      currentLatestTag: undefined,
      isNewerThanLatest: true,
    });
    expect(result).toBeNull();
  });
});
