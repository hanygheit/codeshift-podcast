---
name: episode-slides
description: Write or revise a CodeShift episode's executive-brief presentation (EXECUTIVE_BRIEFS pages, live-session cover, resource slide titles) using only the shared deck layouts, within their text capacity. Use when creating slides for a new episode, restructuring an episode's slide story, or fixing slide overflow/density.
argument-hint: "[epNNN]"
---

# Episode slides (executive brief)

Slides are data: `EPNNN_BRIEF: BriefPage[]` in `src/content/epNNN-slides.ts`, registered as
`epNNN: EPNNN_BRIEF` in `EXECUTIVE_BRIEFS` (`src/content/executive-briefs.ts`, which also holds the
`BriefPage` type and the inline EP001–EP003 pages). Import the type with `import type` to avoid a
runtime import cycle. `buildDeck()` wraps the pages with a cover and resource slides, and the same
primitives render as SVG on the site and as vector PDF. **Never add a layout, change `layoutSlide()`, or write custom
primitives for content that a shared layout can express.** Layout capacities: [layouts.md](layouts.md).

## Story structure (proven by EP003, a 17-slide live session)

| # | Page | Layout | Purpose |
| --- | --- | --- | --- |
| 1 | `cover` (automatic) | — | Live-session cover via `presentationCover`, or artwork cover |
| 2 | `journey` | `flow` + `cards` | Roadmap of the 4–6 conversation chapters, numbered `01 / Name` |
| 3 | `live-poll` (optional) | `matrix` | Audience poll — only via `/episode-poll` |
| 4…n-1 | chapter pages | any | 1–3 pages per chapter; one idea per slide |
| n | `rules` / `actions` | `flow` + `cards` | Practical checklist / next steps; `takeaway` holds the final message |
| auto | `resources-1`, `references` | directory | Generated from `brief.resourceGroups`; titled by `resourceSlideTitles` |

Aim for **10–16 slides total**. The summary part (cover + brief pages) carries the teaching; the
episode page is discovery-only, so the deck must stand alone for someone who missed the live.

## Page fields (`BriefPage`)

```ts
{
  id: "task-to-pr",                       // unique, kebab-case, stable once published (?slide= links)
  title: "From Bounded Task to Reviewable Pull Request",   // ≤ ~44 chars stays on one line
  section: "04 / FROM TASK TO PR · ILLUSTRATIVE SCENARIO", // "NN / CHAPTER · hook" — rendered uppercase
  layout: "flow",                          // statement | comparison | matrix | flow   (map = packages only)
  cards: true,                             // panel style; also makes resource slides use larger type
  emphasis: 2,                             // optional: 0-based entry highlighted in teal
  subtitle: "…",                           // optional single line under the title
  takeaway: "…",                           // optional teal panel at the bottom — the slide's one-liner
  entries: [{ title: "Define", body: "Engineer sets scope and acceptance criteria." }],
}
```

`id` values `summary`, `actions`, `packages`, `adoption`, `career-levels`, `case-study`, `references`
carry legacy URL aliases in `legacyAliases()`; reuse them only for that meaning.

## Writing rules

- Editorial condensation of the hosts' material — never a transcript, never invented quotes,
  statistics, company names or results. Label illustrative examples as illustrative.
- English, plain and direct; sentence case for bodies, title case for slide titles (EP003 style).
- One idea per slide; parallel grammar inside a slide (all imperatives, or all noun phrases).
- Bodies are one sentence. If you need a second sentence, you need a second slide.
- Keep the conversation order of the outline; the `journey` slide must list the same chapters that
  the `section` prefixes use (`01 / …`, `02 / …`).
- Use `takeaway` for the sentence you want people to screenshot; at most one line (~80 chars).

## Live-session cover (`presentationCover` on the episode)

- `subtitle`: two short lines separated by `\n` (≤ ~40 chars each).
- `question`: split on sentence ends; **each sentence must fit one line (≤ ~25 chars)** because
  sentences are spaced at a fixed 78 px — a wrapped sentence collides with the next one.
- `stages`: 3–4 (a fifth collides with the watch link). Mark the delegated/automated stage with
  `agent: true`; its title must fit ~12 chars per line, other stage titles ~22.

## Process

1. Draft the page list (id, layout, title, one-line purpose) and show it to the user before writing
   all copy when the outline is new.
2. Write the pages; keep every count and length inside [layouts.md](layouts.md).
3. Run `npx vitest run src/test/epNNN.test.ts` (overflow + overlap checks, see `/new-episode`
   testing notes). Fix by shortening copy or splitting a slide — never by changing shared layout.
4. Look at every slide in the browser at `/episodes/epNNN/slides?slide=<id>` (desktop and a portrait
   phone width) or ask the `deck-qa` agent to review density.

## Custom primitives (last resort)

EP003 has `src/content/ep003-presentation.ts`, hooked in `buildDeck()` by `ep.id === "ep003"`, for its
QR codes and poll slide. Add an `epNNN-presentation.ts` only for something no layout can express, ask
the user first, and:
- use only the kinds in the `Primitive` union and the inks in `Ink` (`src/lib/deck-model.ts`) — both
  the SVG renderer (`src/components/deck/deck-slides.tsx`) and the PDF backend
  (`src/lib/deck-pdf.server.ts`) must draw every kind you use; adding a kind means updating both;
- prove earlier episodes are unchanged: snapshot `buildDeck(ep).map((s) => s.nodes)` for EP001–EP003
  before the change and compare after;
- bump `DECK_DESIGN_VERSION` if shared rendering changed;
- add tests for the new slides' links and bounds.
