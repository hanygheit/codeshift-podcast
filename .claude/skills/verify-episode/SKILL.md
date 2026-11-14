---
name: verify-episode
description: Verify a CodeShift episode change before a PR — tests, typecheck, lint on touched files, production build, slide-by-slide browser check, PDF download, and unchanged earlier episodes. Use after adding or editing an episode, its slides, resources or poll, or when the user asks to check, test or QA an episode.
argument-hint: "[epNNN]"
---

# Verify an episode

Report each check as passed / failed (with output) / not run (with reason). Never claim a check you
did not run.

## 1. Scope check

```bash
git status --short
git diff --stat main...HEAD
```

Expected for a content-only episode: `src/content/epNNN.ts`, `src/content/epNNN-slides.ts`,
one-line registrations in `src/content/episodes.ts` and `src/content/executive-briefs.ts`, tests,
maybe `src/assets/*`, `README.md`, `roadmap.md`.
Anything in `src/routes/`, `src/components/`, `src/lib/` needs a reason. Uncommitted files that are
not part of this episode (another session's work, temp files) must not be committed with it.

`vite build`/`vite dev` rewrite `src/routeTree.gen.ts`. If `git diff src/routeTree.gen.ts` shows no
content change (line endings only), restore it with `git checkout -- src/routeTree.gen.ts`.

## 2. Automated checks

Use `bun run …` if Bun is installed; otherwise:

```bash
npx vitest run
node node_modules/typescript/bin/tsc --noEmit
npx eslint <files you created or edited> --rule '{"prettier/prettier":["error",{"endOfLine":"auto"}]}'
npx vite build
```

- Tests: all pass. The count should be ≥ the count before the change.
- Typecheck: no errors (clean at baseline; `vite build` does not type-check).
- Lint: new files clean; legacy files (e.g. `episodes.ts`) gain no new findings. Repo-wide
  `eslint .` is known to fail at baseline — do not use it as the gate.
- Build: completes; then apply the `routeTree.gen.ts` rule above.

## 3. Deck facts

Print the deck to compare with the plan:

```bash
npx vitest run src/test/epNNN.test.ts
```

and check: slide count in 10–16 (or what the user approved), ids in the planned order, two resource
slides, every resource URL linked, YouTube URL linked from the cover. Spawn the `deck-qa` agent for a
density/overflow review of all slides.

## 4. Browser walk-through

Start the dev server (`.claude/launch.json` → preview `dev`, or `npx vite dev`; it listens on
http://localhost:8080) and open the built-in browser:

- `/` — the new episode appears first in Explore Episodes; Upcoming Episode still comes from YouTube.
- `/episodes` — search by `EPNNN`, a tag and a topic finds it.
- `/episodes/epNNN` — title, date, description, four "What you'll learn" items, Watch link,
  presentation button label, previous/next navigation, artwork loads.
- `/episodes/epNNN/slides` — step through every slide (→ key, buttons, slider); check
  `?slide=<id>` deep links and browser Back; check fullscreen; resize to a portrait phone (375×812)
  and check the reading view.
- Download PDF — page count equals slide count; links clickable; text selectable. The PDF route is
  `/api/public/pdf/epNNN`.
- Spot-check `/episodes/ep003/slides` still renders as before.

Lovable-hosted artwork (`/__l5e/assets-v1/...`) is not in the repo. Locally it loads only if the dev
server proxies it: start Vite with `LOVABLE_PREVIEW_HOST=codeshift-podcast.lovable.app` to fetch
published artwork. A brand-new upload that is not published yet will still be missing — say so
rather than "fixing" it.

## 5. Earlier episodes unchanged

If anything outside `src/content/epNNN*.ts`, the two registrations, or tests changed, prove
EP001–EP003 are identical: run the existing tests and compare
`JSON.stringify(buildDeck(ep).map((s) => s.nodes))` for each against `main` (a throwaway script or
temporary test; delete it afterwards). If shared rendering intentionally changed, bump
`DECK_DESIGN_VERSION` in `src/lib/pdf.ts`.

## 6. Review agents

Run `episode-reviewer` (content/model consistency) and `link-checker` (all URLs) in parallel if they
have not run on the final content. Fix confirmed findings; list the rest for the user.
