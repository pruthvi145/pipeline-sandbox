// Pure function - no R2/AWS SDK deps, and `now` is injectable - so it's
// unit-testable via jest without relying on the real clock.
//
// Time-based retention (keep ~2 months), not count-based: a fixed "keep the
// newest N" doesn't map to a real recovery requirement - what matters is
// having a snapshot from within the last couple of months to roll back to,
// not a specific count. Always keeps at least the single most recent
// snapshot regardless of its age - a quiet quarter with no promotions must
// never age every snapshot out and leave zero backups.

const DEFAULT_RETENTION_DAYS = 60;

function filesToPrune(
  objects,
  { olderThanDays = DEFAULT_RETENTION_DAYS, now = new Date() } = {}
) {
  if (olderThanDays < 0) {
    throw new Error(`olderThanDays must be >= 0, got ${olderThanDays}`);
  }
  if (objects.length === 0) return [];

  const cutoff = new Date(now.getTime() - olderThanDays * 24 * 60 * 60 * 1000);

  const sorted = [...objects].sort(
    (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
  );
  const [, ...rest] = sorted; // never prune the single newest, no matter its age

  return rest
    .filter((obj) => new Date(obj.lastModified) < cutoff)
    .map((obj) => obj.key);
}

module.exports = { filesToPrune, DEFAULT_RETENTION_DAYS };
