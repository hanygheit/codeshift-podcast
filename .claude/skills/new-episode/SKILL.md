---
name: new-episode
description: Add the next weekly CodeShift episode end to end — episode record, executive-brief slides, resources, optional live poll, tests and verification — using the existing content → buildDeck → SVG/PDF architecture. Use when the user gives a new podcast topic, outline, title or YouTube link, or says "add EP004", "new episode", "this week's episode".
argument-hint: "[EPNNN] [topic or path to notes]"
---

# Add a new CodeShift episode

The architecture is finished. An episode is **data**: one `Episode` module, one list of
executive-brief pages, verified resources, and (sometimes) a poll. Do not add routes, components,
layouts or PDF code. Read `CLAUDE.md` and `AGENTS.md` first if they are not already in context.

Arguments: `$ARGUMENTS` (episode number and/or topic, or a path to notes).

## 1. Intake — collect the facts, never invent them

Fill in [intake-template.md](intake-template.md) from what the user gave you (chat, notes file,
slide outline, YouTube link). Then ask **one** batched question for anything required that is missing.

Required before writing code:
- Episode number (next after the highest in `EPISODES`), title, short title (≤ ~32 chars so the
  cover title fits), scheduled date (a Saturday, `YYYY-MM-DD`).
- YouTube live/replay URL and its video ID. If not created yet, ask — do not leave a placeholder that
  could ship. (`youtubeVideoId` is how the library de-duplicates YouTube recordings.)
- Topic outline: the 4–8 ideas the hosts will cover, in conversation order.
- Cover artwork, or confirmation that the episode uses a live-session cover (`presentationCover`).
- Whether the episode needs a live audience poll.

Derive yourself (then show the user for approval in the plan): description, summary, overview,
topics, audiences, tags, takeaways, action items, lessons, brief pages.

## 2. Branch

`git switch -c epNNN/<short-slug>` from an up-to-date `main` (`git pull --ff-only` first).
Never force-push; the repo syncs with Lovable.

## 3. Episode module — `src/content/epNNN.ts`

Start from [templates/episode-module.md](templates/episode-module.md). Field rules:

| Field | Rule |
| --- | --- |
| `id`, `slug` | `epNNN` (zero-padded, lowercase) |
| `scheduledDate` | ISO date of the Saturday broadcast (19:00 Cairo) |
| `youtubeUrl` | Exactly the link the hosts publish (`https://www.youtube.com/live/<id>` or `https://youtube.com/live/<id>`) |
| `thumbnail` | `import cover from "@/assets/epNNN.<ext>.asset.json"` → `cover.url` (see artwork below) |
| `description` | 1–2 sentences, what the listener learns; used on cards, page, SEO |
| `summary` | One sharp line; shown under the description and in meta description |
| `topics` | 2–4 values from the existing `Topic` union. Adding a new topic changes site filters — ask first |
| `audienceLevels` | From `Audience`; only the levels the episode really serves |
| `takeaways` / `actionItems` | 4–5 each, imperative, ≤ ~70 chars each |
| `resourceIds` | Usually `[]`; put episode resources in `brief.resourceGroups` |
| `slides` | `[]` (legacy format; new episodes use executive briefs) |
| `presentationLabel` | `"Presentation & Resources"` (EP003 convention) unless the user wants otherwise |
| `presentationCover` | Optional live-session opening: `subtitle`, a provocative `question`, 3–4 `stages` |
| `resourceSlideTitles` | Titles for the two resource slides, e.g. `["Official Learning Resources", "Documentation & References"]` |
| `brief.lessons` | ≥ 4 — the episode page shows the first four under "What you'll learn" |
| `brief.watchLabel` | `"Watch Live / Replay"` until a replay is confirmed |

All `EpisodeBrief` fields typed as required must be filled (`summaryHeadline`, `summary`, `lessons`,
`actions`, `resourceGroups`, `finalMessage`), even if not all are rendered today.

**Artwork.** Lovable-hosted art arrives as `src/assets/epNNN.<ext>.asset.json` when the user uploads
it in the Lovable editor; ask them to do that and pull, or to give you the manifest. If the deck cover
draws the artwork (no `presentationCover`), the PDF backend needs a JPEG derivative in
`src/assets/deck-pdf-images.json` keyed by `cover.url` (base64, ≈1600 px wide, quality ≈85);
otherwise it fetches the image from the published site at request time, which also makes the PDF
test depend on the network. With `presentationCover`, the artwork is used on the site only.

## 4. Register — `src/content/episodes.ts`

```ts
import { EPNNN } from "./epNNN";
export const EPISODES: Episode[] = [EPNNN, EP003, /* … unchanged … */];
```

Change nothing else in that file.

## 5. Slides — `src/content/epNNN-slides.ts`

Use the `/episode-slides` skill. The pages live in their own module and are registered in the map:

```ts
// src/content/epNNN-slides.ts
import type { BriefPage } from "./executive-briefs";
export const EPNNN_BRIEF: BriefPage[] = [ /* … */ ];

// src/content/executive-briefs.ts — add the import and one map entry, nothing else
import { EPNNN_BRIEF } from "./epNNN-slides";
export const EXECUTIVE_BRIEFS: Record<string, BriefPage[]> = { epNNN: EPNNN_BRIEF, /* … */ };
```

Target **10–16 slides total** (cover + 7–13 brief pages + 2 resource slides). Brief page ids are
unique, kebab-case, and stable once published (slide URLs use them).

## 6. Resources

Use the `/episode-resources` skill. 8–12 entries split across two groups; every URL verified with the
`link-checker` agent before it is committed.

## 7. Poll (only if requested)

Use the `/episode-poll` skill.

## 8. Tests

Follow [testing.md](testing.md): add `src/test/epNNN.test.ts`, add the slug to the routing test, and
move the archive tests' "newest episode" expectations to the new episode. Do not loosen EP001–EP003
assertions.

## 9. Verify, review, ship

1. `/verify-episode epNNN` — tests, lint on touched files, build, browser walk-through, PDF.
2. Run the `episode-reviewer` and `deck-qa` agents in parallel on the change; fix what they confirm.
3. `/ship-episode epNNN` — README episode table, `roadmap.md`, commit, push, PR.

Report to the user: slide count, resource count, poll slug (if any), test results, what you could not
verify (e.g., Lovable-hosted artwork that is not published yet).
