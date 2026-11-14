# CodeShift Podcast — Claude Code guide

CodeShift is a weekly Arabic tech podcast (live on YouTube, Saturdays 7:00 PM Cairo time) with an
English companion site: episode pages, an executive-brief presentation per episode, a server-generated
PDF of that presentation, curated resources and optional live audience polls.

**The weekly job in this repo is adding the next episode.** The architecture for that already exists —
reuse it; do not build new routes, layouts or renderers for an episode.

@AGENTS.md

The imported AGENTS.md holds the binding architecture rules (Lovable sync, content model, deck model,
PDF pipeline, YouTube discovery). Everything below is how to apply them week to week.

## Weekly workflow (skills)

| When | Skill | What it does |
| --- | --- | --- |
| New topic arrives | `/new-episode` | End-to-end: intake → episode module → brief slides → resources → (poll) → tests → verify |
| Writing or reshaping slides | `/episode-slides` | Executive-brief pages, layout choice, capacity limits, live-session cover |
| Curating references | `/episode-resources` | Official/free-first resource groups, access labels, link verification |
| Episode needs an audience poll | `/episode-poll` | Reuse the poll system (`/poll`, `/admin/polls`) and add the poll slide |
| Before any PR | `/verify-episode` | Tests, lint, build, deck/PDF checks, browser walk-through |
| Ready to publish / after the live | `/ship-episode` | Branch, README table, roadmap, PR; post-broadcast updates |

Subagents in `.claude/agents/`: `resource-researcher` (finds official resources for a topic),
`link-checker` (verifies every URL), `episode-reviewer` (editorial + model-consistency review),
`deck-qa` (slide density, overflow, PDF parity).

## Where episode content lives

| File | Role |
| --- | --- |
| `src/content/types.ts` | `Episode`, `EpisodeBrief`, `BriefResource`, `Topic`, `Audience` shapes |
| `src/content/epNNN.ts` | One module per new episode exporting `EPNNN: Episode` (pattern: `ep003.ts`) |
| `src/content/episodes.ts` | `EPISODES` array — import the module and add it; routes, archive, sitemap, PDF all read this |
| `src/content/epNNN-slides.ts` | `EPNNN_BRIEF: BriefPage[]` — the episode's executive-brief pages, one module per episode |
| `src/content/executive-briefs.ts` | `EXECUTIVE_BRIEFS` map — register `epNNN: EPNNN_BRIEF`; EP001–EP003 pages are inline here |
| `src/content/resources.ts` | Shared reusable `RESOURCES` referenced by `resourceIds` (optional) |
| `src/content/epNNN-presentation.ts` | Only if an episode truly needs custom primitives (EP003 has one; avoid by default) |
| `src/assets/*.asset.json` | Lovable-hosted artwork manifests (`url` is `/__l5e/assets-v1/...`) |
| `src/assets/deck-pdf-images.json` | Base64 JPEG derivatives keyed by artwork URL, embedded by the PDF backend |

How a deck is assembled (`buildDeck` in `src/lib/deck-model.ts`):
1. `cover` slide — live-session layout if `presentationCover` is set, otherwise title + artwork + watch CTA.
2. Every page in `EXECUTIVE_BRIEFS[ep.id]`, in order (fallback: generated summary/actions slides).
3. Resource directory slides built from `brief.resourceGroups` + `resourceIds` + `caseStudy.links`,
   de-duplicated by URL. Without `brief.packages` they split into two slides, `resources-1` and
   `references`, titled by `resourceSlideTitles`.
Slide numbering, header, footer and links are automatic. SVG (browser) and PDF (pdf-lib) render the
same primitives, so a content change needs no PDF work.

## Polls (reusable, only when an episode needs one)

- `/poll` always shows whichever poll is `live` (the database allows one live poll at a time); the QR in
  `public/poll-qr.svg` / `src/assets/live-poll-qr.json` is permanent — never regenerate it per episode.
- Hosts create, open, close and reveal polls at `/admin/polls`; results at `/polls/<slug>/results`.
- Poll slugs follow `epNNN-<topic>`; 2–6 options; new polls start as `draft`.
- The `live-poll` slide renderer currently lives in `src/content/ep003-presentation.ts` with EP003
  values hard-coded. The first time another episode needs it, follow `/episode-poll` to extract it.

## Commands

The project uses Bun (`bun.lock`). If `bun` is not installed, the `npx` forms work with the existing
`node_modules`.

| Task | Bun | Fallback |
| --- | --- | --- |
| Install | `bun install --frozen-lockfile` | — |
| Dev server | `bun run dev` | `npx vite dev` |
| Tests | `bun run test` | `npx vitest run` |
| One test file | `bun run test src/test/deck.test.ts` | `npx vitest run src/test/deck.test.ts` |
| Typecheck (clean at baseline; `vite build` does not type-check) | `bunx tsc --noEmit` | `node node_modules/typescript/bin/tsc --noEmit` |
| Lint touched files | — | see below |
| Format touched files | — | `npx prettier --write <files>` |
| Build | `bun run build` | `npx vite build` |

**Lint baseline is not clean.** `eslint .` reports thousands of errors: on a Windows checkout
(`core.autocrlf=true`) nearly all are `Delete ␍` line-ending noise, and ~34 legacy files (including
`src/content/episodes.ts`) also have pre-existing Prettier/React-hooks findings. Do not "fix" them as
part of an episode. Lint only the files you created or edited, ignoring line endings:

```bash
npx eslint src/content/epNNN.ts src/content/epNNN-slides.ts src/test/epNNN.test.ts --rule '{"prettier/prettier":["error",{"endOfLine":"auto"}]}'
```

New files must be clean. In a legacy file such as `episodes.ts`, add no new findings and do not
reformat existing lines. Prettier: 100 columns, double quotes, trailing commas.
An `Insert ␍` finding on a line you just added to an existing file means that line got LF in a CRLF
working copy; git normalizes it on commit (`core.autocrlf=true`), so it is not a real finding.

## Rules that are easy to break

- **Never edit route components to add an episode.** Add records; `src/routes/*` render from content.
- **Never touch `src/routeTree.gen.ts`** — it is generated. `vite build`/`vite dev` may rewrite it with
  line-ending-only changes; restore those with `git checkout -- src/routeTree.gen.ts`.
- **Never hardcode the upcoming episode.** The home page reads it from YouTube (`getUpcomingLive`).
- **`youtubeVideoId` must be the real YouTube ID** — the library de-duplicates YouTube recordings
  against editorial records by this ID.
- **Do not change earlier episodes' content or output** while adding a new one. Their tests pin slide
  counts, ids, copy and links on purpose (only the archive "newest episode" assertions move forward).
- **Bump `DECK_DESIGN_VERSION`** in `src/lib/pdf.ts` only when shared layout, fonts or palette change.
  Content changes already invalidate the PDF cache through `contentVersion`.
- **Never invent facts, quotes, statistics or URLs.** Notes are editorial summaries, never transcripts.
  Every resource URL must be verified live before it ships.
- **Site copy is English**; the spoken podcast is Egyptian Arabic. Do not add Arabic copy unless asked.
- **Git:** the repo syncs with Lovable. Work on a branch (`epNNN/<short-slug>`), open a PR to `main`,
  never force-push, rebase or amend pushed commits, and never commit secrets (`.env` holds only
  publishable Supabase values; poll and YouTube secrets live in the deployment environment).
- **Institutional artwork** (ITI badge) stays in the footer via `SupportBadge` only.

## Definition of done for a weekly episode

- [ ] `src/content/epNNN.ts` exists, typed as `Episode`, registered in `EPISODES`.
- [ ] `src/content/epNNN-slides.ts` registered in `EXECUTIVE_BRIEFS`; shared layouts only; no overflow.
- [ ] Every resource URL verified; access labels honest (`Free` / `Free tier` / `Subscription`).
- [ ] Tests updated: new episode spec file, routing slug list, archive "newest episode" expectations.
- [ ] Tests, typecheck and build pass; new/edited files lint clean (see Commands).
- [ ] `/episodes/epNNN`, `/episodes/epNNN/slides` and the PDF download checked in the browser.
- [ ] README episode table and `roadmap.md` updated; PR opened against `main`.
