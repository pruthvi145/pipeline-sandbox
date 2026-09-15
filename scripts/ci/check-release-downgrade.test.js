const {
  validateTagName,
  parseVersionTag,
  compareVersionParts,
  evaluatePromotion,
} = require("./check-release-downgrade");

describe("validateTagName", () => {
  it("accepts a strict v-prefixed semver tag", () => {
    expect(validateTagName("v1.20.1")).toBe(true);
    expect(validateTagName("v0.0.0")).toBe(true);
  });

  it("rejects anything that isn't strict v-prefixed semver", () => {
    expect(validateTagName("1.20.1")).toBe(false);
    expect(validateTagName("v1.20")).toBe(false);
    expect(validateTagName("v1.20.1.0")).toBe(false);
    expect(validateTagName("legacy-v1")).toBe(false);
    expect(validateTagName("")).toBe(false);
  });
});

describe("parseVersionTag", () => {
  it("parses a valid v-prefixed semver tag", () => {
    expect(parseVersionTag("v1.20.1")).toEqual([1, 20, 1]);
  });

  it("returns null for a tag that doesn't match strict v-prefixed semver", () => {
    expect(parseVersionTag("1.20.1")).toBeNull();
    expect(parseVersionTag("v1.20")).toBeNull();
    expect(parseVersionTag("not-a-tag")).toBeNull();
  });
});

describe("compareVersionParts", () => {
  it("returns positive when a is newer than b", () => {
    expect(compareVersionParts([1, 2, 1], [1, 2, 0])).toBeGreaterThan(0);
  });

  it("returns negative when a is older than b", () => {
    expect(compareVersionParts([1, 1, 0], [1, 2, 0])).toBeLessThan(0);
  });

  it("returns 0 when equal", () => {
    expect(compareVersionParts([1, 2, 3], [1, 2, 3])).toBe(0);
  });
});

describe("evaluatePromotion", () => {
  it("allows promoting a tag newer than current latest", () => {
    const result = evaluatePromotion({
      tag: "v1.3.0",
      currentLatestTag: "v1.2.0",
      forceDowngrade: false,
    });
    expect(result).toEqual({
      allowed: true,
      isNewerThanLatest: true,
      reason: null,
    });
  });

  it("allows redeploying the same tag that's already latest", () => {
    const result = evaluatePromotion({
      tag: "v1.2.0",
      currentLatestTag: "v1.2.0",
      forceDowngrade: false,
    });
    expect(result).toEqual({
      allowed: true,
      isNewerThanLatest: true,
      reason: null,
    });
  });

  it("allows the first-ever promotion when there's no current latest release", () => {
    const result = evaluatePromotion({
      tag: "v1.0.0",
      currentLatestTag: undefined,
      forceDowngrade: false,
    });
    expect(result).toEqual({
      allowed: true,
      isNewerThanLatest: true,
      reason: null,
    });
  });

  it("blocks an intentional downgrade without force_downgrade", () => {
    const result = evaluatePromotion({
      tag: "v1.1.0",
      currentLatestTag: "v1.2.0",
      forceDowngrade: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.isNewerThanLatest).toBe(false);
    expect(result.reason).toBe(
      "Refusing to promote v1.1.0: production is currently on v1.2.0, which is newer. " +
        'Promoting v1.1.0 now would downgrade production. Re-run with "force_downgrade" enabled if this is intentional.'
    );
  });

  it("allows the same downgrade when force_downgrade is enabled", () => {
    const result = evaluatePromotion({
      tag: "v1.1.0",
      currentLatestTag: "v1.2.0",
      forceDowngrade: true,
    });
    expect(result).toEqual({
      allowed: true,
      isNewerThanLatest: false,
      reason: null,
    });
  });

  it("fails closed when the incoming tag is unparseable", () => {
    const result = evaluatePromotion({
      tag: "not-a-tag",
      currentLatestTag: "v1.2.0",
      forceDowngrade: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.isNewerThanLatest).toBe(false);
    expect(result.reason).toMatch(/can't safely compare/);
  });

  it("fails closed when the current latest tag is unparseable", () => {
    // e.g. a pre-convention or manually-created release sitting as "latest"
    const result = evaluatePromotion({
      tag: "v1.2.0",
      currentLatestTag: "legacy-v1",
      forceDowngrade: false,
    });
    expect(result.allowed).toBe(false);
    expect(result.isNewerThanLatest).toBe(false);
    expect(result.reason).toMatch(/can't safely compare/);
  });

  it("allows an unparseable current latest tag when forced, but never claims it's newer", () => {
    const result = evaluatePromotion({
      tag: "v1.2.0",
      currentLatestTag: "legacy-v1",
      forceDowngrade: true,
    });
    expect(result).toEqual({
      allowed: true,
      isNewerThanLatest: false,
      reason: null,
    });
  });
});
