-- Post-restore reconciliation, run once after a database restore.
--
-- The real app's version of this script re-links invited-but-unlinked auth
-- accounts against user_profiles rows the restore may have erased. This
-- sandbox has no auth/profile system at all - todos aren't owned by anyone -
-- so there's nothing to reconcile. Kept as a no-op step (rather than deleted)
-- so the workflow step itself, and its job-summary wiring, still gets
-- exercised: only the SQL's content differs from production's.
--
-- :snapshot_ts is bound by the caller via `psql -v snapshot_ts="'<iso8601>'"`.

DO $$
DECLARE
  v_snapshot_ts timestamptz := :snapshot_ts;
  v_todos_since_snapshot int;
BEGIN
  SELECT count(*) INTO v_todos_since_snapshot
  FROM public.todos
  WHERE created_at > v_snapshot_ts;

  RAISE NOTICE 'RECONCILE_RELINKED_COUNT=0';
  RAISE NOTICE 'RECONCILE_SELF_SIGNUP_NO_ACTION_COUNT=%', v_todos_since_snapshot;
END $$;
