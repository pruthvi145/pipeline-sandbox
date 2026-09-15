const {
  buildPayload,
  STATUS_COLORS,
  STATUS_EMOJI,
} = require("./build-payload");

const base = {
  title: "v1.20.1 deployed",
  status: "success",
  message: "E2E passed · backport PR open",
  url: "https://github.com/totalfamily/app/actions/runs/42",
};

describe("discord-notify-outcome build-payload", () => {
  it("builds a success embed with title, message, and url", () => {
    const payload = buildPayload(base);
    const embed = payload.embeds[0];

    expect(embed.title).toBe(`${STATUS_EMOJI.success} v1.20.1 deployed`);
    expect(embed.description).toBe(base.message);
    expect(embed.url).toBe(base.url);
    expect(embed.color).toBe(STATUS_COLORS.success);
    expect(payload.username).toBe("TF Release Bot");
  });

  it("colors failure red and defaults unknown/missing status to info gray", () => {
    expect(buildPayload({ ...base, status: "failure" }).embeds[0].color).toBe(
      STATUS_COLORS.failure
    );
    expect(buildPayload({ title: "no status given" }).embeds[0].color).toBe(
      STATUS_COLORS.info
    );
    expect(
      buildPayload({ title: "x", status: "unknown" }).embeds[0].color
    ).toBe(STATUS_COLORS.info);
  });

  it("prefixes the title with the right emoji per status", () => {
    expect(
      buildPayload({ ...base, status: "success" }).embeds[0].title
    ).toMatch(/^✅/);
    expect(
      buildPayload({ ...base, status: "failure" }).embeds[0].title
    ).toMatch(/^❌/);
    expect(buildPayload({ ...base, status: "info" }).embeds[0].title).toMatch(
      /^ℹ️/
    );
  });

  it("omits description when no message is given", () => {
    const embed = buildPayload({ title: "no message" }).embeds[0];
    expect(embed.description).toBeUndefined();
    expect(JSON.stringify(embed)).not.toContain('"description"');
  });

  it("omits url when none is given", () => {
    const embed = buildPayload({ title: "no url" }).embeds[0];
    expect(embed.url).toBeUndefined();
    expect(JSON.stringify(embed)).not.toContain('"url"');
  });

  it("throws when title is missing", () => {
    expect(() => buildPayload({ status: "success" })).toThrow(/title/);
    expect(() => buildPayload()).toThrow(/title/);
  });

  it("produces a body Discord accepts (title <= 256 chars, description <= 4096 chars)", () => {
    const payload = buildPayload({
      title: "x".repeat(400),
      message: "y".repeat(5000),
    });
    expect(payload.embeds).toHaveLength(1);
    expect(payload.embeds[0].title.length).toBeLessThanOrEqual(256);
    expect(payload.embeds[0].description.length).toBeLessThanOrEqual(4096);
  });
});
