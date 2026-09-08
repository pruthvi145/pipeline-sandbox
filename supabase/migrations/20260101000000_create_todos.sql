create table public.todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  is_complete boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS intentionally left off: this is a disposable CI pipeline testbed with
-- no real user data, not a pattern to copy into a real app.
grant select, insert, update, delete on public.todos to anon, authenticated;
