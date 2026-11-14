-- Always-open episode polls, embedded on an episode page (first use: EP004 #architecture-poll).
--
-- 'open' is a new poll status next to draft/live/closed:
--   * it accepts votes independently of the single host-controlled 'live' poll shown on /poll;
--   * a voter sees the aggregate results right after voting (the API enforces this);
--   * each browser gets one final vote (unique (poll_id, participant_hash), insert-only in the API);
--   * votes from one network are capped per poll, using a keyed, day-scoped hash of the client IP
--     (network_hash) computed server-side — raw IP addresses are never stored.

alter table public.polls drop constraint if exists polls_status_check;
alter table public.polls
  add constraint polls_status_check check (status in ('draft', 'live', 'open', 'closed'));

alter table public.poll_votes add column network_hash text;

create index poll_votes_network_idx
  on public.poll_votes (poll_id, network_hash, created_at)
  where network_hash is not null;

create function public.enforce_poll_vote_network_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.network_hash is null then
    return new;
  end if;

  -- Serialize concurrent votes from the same network for this poll so the caps hold under bursts.
  perform pg_advisory_xact_lock(hashtextextended(new.poll_id::text || ':' || new.network_hash, 0));

  -- Burst cap: 15 votes per network per poll in 10 minutes (shared office/mobile networks stay usable).
  if (
    select count(*)
    from public.poll_votes as v
    where v.poll_id = new.poll_id
      and v.network_hash = new.network_hash
      and v.created_at > now() - interval '10 minutes'
  ) >= 15 then
    raise exception using errcode = 'P0001', message = 'poll_network_rate_limited';
  end if;

  -- Daily cap: network_hash is keyed per UTC day, so this counts one network's votes for the day.
  if (
    select count(*)
    from public.poll_votes as v
    where v.poll_id = new.poll_id
      and v.network_hash = new.network_hash
  ) >= 100 then
    raise exception using errcode = 'P0001', message = 'poll_network_rate_limited';
  end if;

  return new;
end;
$$;

create trigger poll_vote_network_limit
before insert on public.poll_votes
for each row execute function public.enforce_poll_vote_network_limit();

revoke all on function public.enforce_poll_vote_network_limit() from public, anon, authenticated;

insert into public.polls (
  slug, episode_number, title, question, options, status, results_revealed
) values (
  'ep004-first-architecture-decision',
  4,
  'You''re the Architect. What Would YOU Build?',
  'Your team is building a new E-Commerce platform. The CEO says: "We''re starting with 1,000 users, but we might reach 1 million. I want the system scalable, reliable, and ready for growth!" What''s your FIRST architectural decision?',
  '[
    {"id":"a","label":"A — Microservices first","description":"Start with Microservices for maximum scalability."},
    {"id":"b","label":"B — Modular Monolith","description":"Start with a Modular Monolith and evolve when needed."},
    {"id":"c","label":"C — Kubernetes from day one","description":"Build on Kubernetes from day one."},
    {"id":"d","label":"D — Ask more questions","description":"Ask more questions before choosing the architecture."}
  ]'::jsonb,
  'open',
  false
)
on conflict (slug) do nothing;
