const { filesToPrune, DEFAULT_RETENTION_DAYS } = require("./prune-snapshots");

const NOW = new Date("2026-09-15T00:00:00Z");
const daysAgo = (n) =>
  new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

describe("filesToPrune", () => {
  it("keeps everything within the retention window", () => {
    const objects = [
      { key: "v1.8.0.dump", lastModified: daysAgo(10) },
      { key: "v1.8.1.dump", lastModified: daysAgo(5) },
      { key: "v1.8.2.dump", lastModified: daysAgo(1) },
    ];
    expect(filesToPrune(objects, { now: NOW })).toEqual([]);
  });

  it("prunes objects older than the retention window", () => {
    const objects = [
      { key: "v1.8.0.dump", lastModified: daysAgo(90) }, // stale
      { key: "v1.8.1.dump", lastModified: daysAgo(70) }, // stale
      { key: "v1.8.2.dump", lastModified: daysAgo(10) }, // fresh
    ];
    expect(filesToPrune(objects, { now: NOW }).sort()).toEqual([
      "v1.8.0.dump",
      "v1.8.1.dump",
    ]);
  });

  it("never prunes the single most recent object, even if it's stale", () => {
    const objects = [
      { key: "v1.8.0.dump", lastModified: daysAgo(200) },
      { key: "v1.8.1.dump", lastModified: daysAgo(150) },
      { key: "v1.8.2.dump", lastModified: daysAgo(100) }, // newest, still stale - kept anyway
    ];
    const result = filesToPrune(objects, { now: NOW });
    expect(result).toContain("v1.8.0.dump");
    expect(result).toContain("v1.8.1.dump");
    expect(result).not.toContain("v1.8.2.dump");
  });

  it("keeps the only object even when it's the sole item and stale", () => {
    const objects = [{ key: "v1.0.0.dump", lastModified: daysAgo(500) }];
    expect(filesToPrune(objects, { now: NOW })).toEqual([]);
  });

  it("is unaffected by input order - always keeps the actual most recent by date", () => {
    const objects = [
      { key: "v1.8.2.dump", lastModified: daysAgo(10) },
      { key: "v1.8.0.dump", lastModified: daysAgo(90) },
      { key: "v1.8.1.dump", lastModified: daysAgo(70) },
    ];
    expect(filesToPrune(objects, { now: NOW }).sort()).toEqual([
      "v1.8.0.dump",
      "v1.8.1.dump",
    ]);
  });

  it("returns an empty array for an empty bucket", () => {
    expect(filesToPrune([], { now: NOW })).toEqual([]);
  });

  it("respects a custom retention window", () => {
    const objects = [
      { key: "v1.8.0.dump", lastModified: daysAgo(20) },
      { key: "v1.8.1.dump", lastModified: daysAgo(5) },
    ];
    expect(filesToPrune(objects, { olderThanDays: 10, now: NOW })).toEqual([
      "v1.8.0.dump",
    ]);
  });

  it("defaults to a 60-day (~2 month) retention window", () => {
    expect(DEFAULT_RETENTION_DAYS).toBe(60);
    const objects = [
      { key: "old.dump", lastModified: daysAgo(61) },
      { key: "new.dump", lastModified: daysAgo(1) },
    ];
    expect(filesToPrune(objects, { now: NOW })).toEqual(["old.dump"]);
  });

  it("does not mutate the input array", () => {
    const objects = [
      { key: "v1.8.2.dump", lastModified: daysAgo(10) },
      { key: "v1.8.0.dump", lastModified: daysAgo(90) },
    ];
    const copy = [...objects];
    filesToPrune(objects, { now: NOW });
    expect(objects).toEqual(copy);
  });

  it("throws for a negative retention window", () => {
    expect(() =>
      filesToPrune([{ key: "x", lastModified: daysAgo(1) }], {
        olderThanDays: -1,
      })
    ).toThrow("olderThanDays must be >= 0");
  });
});
