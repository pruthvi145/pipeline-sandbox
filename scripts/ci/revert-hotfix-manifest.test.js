const {
  revertManifestVersion,
  tagToManifestVersion,
} = require("./revert-hotfix-manifest");

describe("revertManifestVersion", () => {
  it("reverts the manifest to the previous version", () => {
    const manifest = { ".": "1.21.0" };
    const result = revertManifestVersion(manifest, {
      failedVersion: "1.21.0",
      previousVersion: "1.20.0",
    });
    expect(result.reverted).toBe(true);
    expect(result.manifest).toEqual({ ".": "1.20.0" });
  });

  it("does not revert when the manifest no longer holds the failed version", () => {
    const manifest = { ".": "1.22.0" };
    const result = revertManifestVersion(manifest, {
      failedVersion: "1.21.0",
      previousVersion: "1.20.0",
    });
    expect(result.reverted).toBe(false);
    expect(result.manifest).toEqual({ ".": "1.22.0" });
  });

  it("never mutates the input object", () => {
    const manifest = { ".": "1.21.0" };
    const original = manifest;
    revertManifestVersion(manifest, {
      failedVersion: "1.21.0",
      previousVersion: "1.20.0",
    });
    expect(original).toEqual({ ".": "1.21.0" });
    expect(manifest).toBe(original);
  });

  it("never mutates the input object on the no-op path either", () => {
    const manifest = { ".": "1.22.0" };
    const original = manifest;
    revertManifestVersion(manifest, {
      failedVersion: "1.21.0",
      previousVersion: "1.20.0",
    });
    expect(original).toEqual({ ".": "1.22.0" });
    expect(manifest).toBe(original);
  });

  it("supports a non-default path", () => {
    const manifest = { ".": "1.21.0", "packages/foo": "0.5.0" };
    const result = revertManifestVersion(manifest, {
      path: "packages/foo",
      failedVersion: "0.5.0",
      previousVersion: "0.4.0",
    });
    expect(result.reverted).toBe(true);
    expect(result.manifest).toEqual({
      ".": "1.21.0",
      "packages/foo": "0.4.0",
    });
  });
});

describe("tagToManifestVersion", () => {
  it("strips a leading v prefix", () => {
    expect(tagToManifestVersion("v1.20.1")).toBe("1.20.1");
  });

  it("leaves an already-bare version string unchanged", () => {
    expect(tagToManifestVersion("1.20.1")).toBe("1.20.1");
  });

  it("leaves a tag with no leading v unchanged", () => {
    expect(tagToManifestVersion("1.20.1")).toBe("1.20.1");
  });
});
