-- Sandbox filler: exists purely to give a later release something to cross
-- when testing rollback.yaml's migration-boundary detection.
alter table public.todos add column priority smallint not null default 0;
