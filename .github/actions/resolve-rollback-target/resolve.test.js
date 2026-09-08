const { resolveRollbackTarget, detectMigrationBoundary } = require("./resolve");

const RELEASES = [
  { tag: "v1.8.2", publishedAt: "2026-09-01" },
  { tag: "v1.8.1", publishedAt: "2026-08-28" },
  { tag: "v1.8.0", publishedAt: "2026-08-20" },
  { tag: "v1.7.4", publishedAt: "2026-08-10" },
];

describe("resolveRollbackTarget: manual (explicit tag)", () => {
  it("resolves an explicit tag older than live", () => {
    expect(
      resolveRollbackTarget({
        requestedTag: "v1.7.4",
        liveTag: "v1.8.2",
        releases: RELEASES,
      })
    ).toEqual({ tag: "v1.7.4", resolvedVia: "manual" });
  });

  it("rejects a requested tag equal to the live release", () => {
    expect(() =>
      resolveRollbackTarget({
        requestedTag: "v1.8.2",
        liveTag: "v1.8.2",
        releases: RELEASES,
      })
    ).toThrow(/not older than the live release/);
  });

  it("rejects a requested tag newer than the live release", () => {
    expect(() =>
      resolveRollbackTarget({
        requestedTag: "v1.8.2",
        liveTag: "v1.8.1",
        releases: RELEASES,
      })
    ).toThrow(/not older than the live release/);
  });

  it("throws when the requested tag has no matching release", () => {
    expect(() =>
      resolveRollbackTarget({
        requestedTag: "v1.9.9",
        liveTag: "v1.8.2",
        releases: RELEASES,
      })
    ).toThrow(/has no matching release/);
  });

  it("throws when the requested tag is not strict v-prefixed semver", () => {
    expect(() =>
      resolveRollbackTarget({
        requestedTag: "1.7.4",
        liveTag: "v1.8.2",
        releases: [...RELEASES, { tag: "1.7.4", publishedAt: "2026-08-01" }],
      })
    ).toThrow(/does not match strict v-prefixed semver/);
  });

  it("throws when the live tag is not strict v-prefixed semver", () => {
    expect(() =>
      resolveRollbackTarget({
        requestedTag: "v1.7.4",
        liveTag: "v1.8.2-hotfix.1",
        releases: RELEASES,
      })
    ).toThrow(/does not match strict v-prefixed semver/);
  });
});

describe("resolveRollbackTarget: auto (blank tag)", () => {
  it("picks the next-oldest stable release before live", () => {
    expect(
      resolveRollbackTarget({
        requestedTag: "",
        liveTag: "v1.8.2",
        releases: RELEASES,
      })
    ).toEqual({ tag: "v1.8.1", resolvedVia: "auto" });
  });

  it("throws when there is no release before the live one (first-ever rollback)", () => {
    expect(() =>
      resolveRollbackTarget({
        requestedTag: "",
        liveTag: "v1.7.4",
        releases: RELEASES,
      })
    ).toThrow(/nothing to roll back to/);
  });

  it("throws when the live tag itself is not in the releases list", () => {
    expect(() =>
      resolveRollbackTarget({
        requestedTag: "",
        liveTag: "v2.0.0",
        releases: RELEASES,
      })
    ).toThrow(/nothing to roll back to/);
  });
});

describe("detectMigrationBoundary", () => {
  it("is true when a supabase/migrations path is present", () => {
    expect(
      detectMigrationBoundary([
        "app/page.tsx",
        "supabase/migrations/20260901120000_add_column.sql",
      ])
    ).toBe(true);
  });

  it("is false when no supabase/migrations path is present", () => {
    expect(
      detectMigrationBoundary(["app/page.tsx", "lib/services/foo.ts"])
    ).toBe(false);
  });

  it("is false for an empty array", () => {
    expect(detectMigrationBoundary([])).toBe(false);
  });
});
