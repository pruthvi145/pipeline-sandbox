// Pure function - no GitHub Actions deps - so it's unit-testable via jest.
// Builds the Discord webhook payload for a pipeline OUTCOME notification
// (e.g. "v1.20.1 deployed, E2E passed, backport PR open"), as opposed to
// discord-notify's build-payload.js which builds a non-PR workflow CRASH
// alert from raw run metadata. Takes a title/status/message/url shape so any
// composed-notification caller (compose-notification's output) can feed it
// directly.

const STATUS_COLORS = {
  success: 0x2eb67d,
  failure: 0xe01e5a,
  info: 0x6b7280,
};
const STATUS_EMOJI = {
  success: "✅",
  failure: "❌",
  info: "ℹ️",
};

function buildPayload({ title, status = "info", message = "", url = "" } = {}) {
  if (!title) {
    throw new Error("buildPayload requires a title");
  }

  const color = STATUS_COLORS[status] ?? STATUS_COLORS.info;
  const emoji = STATUS_EMOJI[status] ?? STATUS_EMOJI.info;

  return {
    username: "TF Release Bot",
    embeds: [
      {
        title: `${emoji} ${title}`.slice(0, 256),
        description: message ? String(message).slice(0, 4096) : undefined,
        url: url || undefined,
        color,
      },
    ],
  };
}

module.exports = { buildPayload, STATUS_COLORS, STATUS_EMOJI };
