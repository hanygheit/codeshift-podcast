---
name: episode-poll
description: Add a live audience poll to a CodeShift episode by reusing the existing poll system (/poll, /admin/polls, results page, permanent QR) and, if wanted, a live-poll slide in the deck. Use when an episode needs audience voting, when preparing poll questions/options, or when the host asks how to run the poll during the live show.
argument-hint: "[epNNN] [poll question]"
---

# Episode poll

The poll system is **finished and reusable** — an episode poll needs content, not new features.
Only build something if the episode needs the poll *slide* and it has not been generalized yet
(section 3).

## How the system works

| Piece | Where | Notes |
| --- | --- | --- |
| Tables | `supabase/migrations/20261031000000_live_polls.sql` | `polls`, `poll_votes`; at most **one `live` poll** (unique index) |
| Audience page | `/poll` | Always shows the current live poll — the permanent QR points here |
| Specific poll | `/polls/<slug>` | Archived/closed polls stay viewable |
| Results | `/polls/<slug>/results` (`?host=true` = host view) | Host reveals/hides results |
| Host console | `/admin/polls` | Create, duplicate, open, close, reveal, hide, edit (edit only before votes) |
| API | `src/routes/api/polls.ts` | Validation below; host actions need `POLL_ADMIN_TOKEN` |
| Permanent QR | `public/poll-qr.svg`, `src/assets/live-poll-qr.json` | **Never regenerate per episode** |

Validation: slug `^[a-z0-9]+(-[a-z0-9]+)*$` (convention `epNNN-<topic>`); title ≤ 160 chars;
question ≤ 500; **2–6 options**, each `{ id: /^[a-z0-9-]{1,32}$/, label ≤ 100, description ≤ 260 }`,
unique ids. Opening a poll closes any other live poll. Secrets (`SUPABASE_SERVICE_ROLE_KEY`,
`POLL_ADMIN_TOKEN`, `POLL_VOTE_SECRET`) live in the deployment environment — never in the repo.

## 1. Design the poll

- One question that splits the audience and feeds the conversation (EP003: how much autonomy would
  you give an AI coding agent?). Avoid questions with a "correct" answer.
- 3–4 options for the slide (the slide fits **max 4**; the web poll allows up to 6), ordered along one
  axis (least → most), ids `a`, `b`, `c`, `d`, labels `"A — …"` (≤ ~40 chars), one-line descriptions.
- Show the user the slug, title, question and options for approval.

## 2. Create the poll record — pick one

**A. Host console (default, no code):** give the host the exact values to enter at `/admin/polls`;
it is created as `draft`. Nothing to commit.

**B. Versioned seed (only if the user wants it in the repo):** add a new migration
`supabase/migrations/<YYYYMMDDHHMMSS>_epNNN_poll.sql` modelled on the EP003 insert, with
`status 'draft'`, `results_revealed false`, and `on conflict (slug) do nothing`. Never edit the
existing migration and never seed a poll as `live`. The migration must be applied to the connected
Supabase project before the show — tell the user; you cannot verify that from the repo.

## 3. Optional poll slide in the deck

Add a brief page with `id: "live-poll"`, `layout: "matrix"`, `section: "LIVE AUDIENCE POLL"`,
`title` (the invitation), `subtitle` (the exact question) and the options as `entries`
(`title` = label, `body` = description). Usually placed right after `journey`.

**Current limitation:** the poll slide's custom rendering (options list + `/poll` QR + host-results
link) lives in `src/content/ep003-presentation.ts` and is applied only when `ep.id === "ep003"`, with
EP003 values hard-coded (`"CodeShift / EP003"`, `"03 / 17"`, slug `ep003-agent-autonomy`, teal
highlight on option index 3). Without that override a new episode's `live-poll` page renders as a
plain matrix with no QR.

The first episode after EP003 that needs the slide must generalize it — ask the user first, then:
1. Snapshot EP003 before changing anything:
   `JSON.stringify(buildDeck(EP003).map((s) => s.nodes))` — save it in a temporary test.
2. Move the `live-poll` branch into a shared module (e.g. `src/content/live-poll-slide.ts`)
   parameterized by episode number, poll slug, slide index/total and highlighted option.
3. Add an optional `livePoll?: { slug: string; highlight?: number }` to `Episode` (existing episodes
   stay unchanged), call the shared renderer from `buildDeck()` for any slide with id `live-poll`
   when `ep.livePoll` is set, and have EP003 use the same renderer with its current values.
4. Prove EP003 is byte-identical against the snapshot, keep `src/test/ep003-qr.test.ts` green, then
   delete the temporary snapshot test.
5. Add tests for the new episode: its poll slide links to `https://codeshift-podcast.lovable.app/poll`
   and to `/polls/<slug>/results?host=true`, and no other slide links to `/poll`.
6. Mention in `AGENTS.md` (one line, same style) that poll slides use the shared renderer.

No slide needed? The host can show `public/poll-qr.svg` directly in the stream.

## 4. Run of show (tell the host)

1. Before the live: poll exists as `draft` (check `/admin/polls`).
2. At the poll moment: open it in `/admin/polls` → audience scans the QR → `/poll`.
3. Show `/polls/<slug>/results?host=true`; reveal results when ready.
4. After the segment: close the poll. It stays viewable at `/polls/<slug>`.
