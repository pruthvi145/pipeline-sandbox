const { filesToPrune } = require("./prune-snapshots");

describe("filesToPrune", () => {
  it("keeps everything when fewer files than the retention count exist", () => {
    expect(filesToPrune(["v1.8.0.dump", "v1.8.1.dump"], 3)).toEqual([]);
  });

  it("keeps everything when exactly the retention count exists", () => {
    expect(
      filesToPrune(["v1.8.0.dump", "v1.8.1.dump", "v1.8.2.dump"], 3)
    ).toEqual([]);
  });

  it("prunes the oldest files beyond the retention count", () => {
    expect(
      filesToPrune(
        ["v1.8.0.dump", "v1.8.1.dump", "v1.8.2.dump", "v1.8.3.dump"],
        3
      )
    ).toEqual(["v1.8.0.dump"]);
  });

  it("prunes multiple oldest files when far over the retention count", () => {
    expect(
      filesToPrune(
        [
          "v1.6.0.dump",
          "v1.7.0.dump",
          "v1.8.0.dump",
          "v1.8.1.dump",
          "v1.8.2.dump",
        ],
        3
      )
    ).toEqual(["v1.6.0.dump", "v1.7.0.dump"]);
  });

  it("is unaffected by input order - always keeps the numerically newest", () => {
    expect(
      filesToPrune(
        ["v1.8.2.dump", "v1.8.0.dump", "v1.9.0.dump", "v1.8.1.dump"],
        3
      )
    ).toEqual(["v1.8.0.dump"]);
  });

  it("compares version numbers, not filename strings, across a double-digit boundary", () => {
    expect(
      filesToPrune(
        ["v1.9.0.dump", "v1.10.0.dump", "v1.11.0.dump", "v1.12.0.dump"],
        3
      )
    ).toEqual(["v1.9.0.dump"]);
  });

  it("returns an empty array for an empty bucket", () => {
    expect(filesToPrune([], 3)).toEqual([]);
  });

  it("defaults to keeping 3 when keep is omitted", () => {
    expect(
      filesToPrune(["v1.8.0.dump", "v1.8.1.dump", "v1.8.2.dump", "v1.8.3.dump"])
    ).toEqual(["v1.8.0.dump"]);
  });

  it("prunes everything when keep is 0", () => {
    expect(filesToPrune(["v1.8.0.dump", "v1.8.1.dump"], 0)).toEqual([
      "v1.8.0.dump",
      "v1.8.1.dump",
    ]);
  });

  it("does not mutate the input array", () => {
    const input = ["v1.8.2.dump", "v1.8.0.dump", "v1.8.1.dump", "v1.8.3.dump"];
    const copy = [...input];
    filesToPrune(input, 3);
    expect(input).toEqual(copy);
  });

  it("throws for a negative keep count", () => {
    expect(() => filesToPrune(["v1.8.0.dump"], -1)).toThrow(
      "keep must be >= 0"
    );
  });
});
