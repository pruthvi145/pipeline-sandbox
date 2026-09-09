-- Sandbox filler: third dummy migration, gives a real second release something
-- to cross so rollback.yaml's restore path has an actual migration boundary
-- to undo, rather than crossing zero migrations.
alter table public.todos add column notes text;
