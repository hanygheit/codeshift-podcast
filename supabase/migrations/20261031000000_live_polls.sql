create extension if not exists pgcrypto;

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  episode_number integer check (episode_number is null or episode_number between 1 and 999),
  title text not null check (char_length(title) between 1 and 160),
  question text not null check (char_length(question) between 1 and 500),
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 6),
  status text not null default 'draft' check (status in ('draft', 'live', 'closed')),
  results_revealed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index polls_single_live_idx on public.polls ((status)) where status = 'live';

create table public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  participant_hash text not null,
  option_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (poll_id, participant_hash)
);

create index poll_votes_poll_id_idx on public.poll_votes (poll_id);

create function public.poll_result_counts(p_poll_id uuid)
returns table (option_id text, vote_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select v.option_id, count(*)::bigint
  from public.poll_votes as v
  where v.poll_id = p_poll_id
  group by v.option_id;
$$;

create function public.enforce_poll_vote_spacing()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.updated_at < old.updated_at + interval '1 second' then
    raise exception using errcode = 'P0001', message = 'poll_vote_rate_limited';
  end if;
  return new;
end;
$$;

create trigger poll_vote_spacing
before update on public.poll_votes
for each row execute function public.enforce_poll_vote_spacing();

revoke all on function public.enforce_poll_vote_spacing() from public, anon, authenticated;
revoke all on function public.poll_result_counts(uuid) from public, anon, authenticated;
grant execute on function public.poll_result_counts(uuid) to service_role;
grant all on public.polls, public.poll_votes to service_role;

alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;
revoke all on public.polls, public.poll_votes from anon, authenticated;

insert into public.polls (
  slug, episode_number, title, question, options, status, results_revealed
) values (
  'ep003-agent-autonomy',
  3,
  'How Much Autonomy Would You Give an AI Coding Agent?',
  'How much autonomy would you give an AI Coding Agent on a real project today?',
  '[
    {"id":"a","label":"A — Suggest code only","description":"I implement the changes myself."},
    {"id":"b","label":"B — Separate branch","description":"The agent writes code; I review the changes."},
    {"id":"c","label":"C — Test & open a PR","description":"The agent prepares the work; a human approves."},
    {"id":"d","label":"D — Auto-merge within limits","description":"The agent can merge after required checks pass, under an explicitly authorized team policy."}
  ]'::jsonb,
  'draft',
  false
);
