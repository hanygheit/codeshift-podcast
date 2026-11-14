---
name: episode-resources
description: Curate, verify and add the learning resources and references for a CodeShift episode (brief.resourceGroups → the two generated resource slides). Use when building an episode's resource list, adding/replacing a link, checking that resource URLs still work, or when the user asks for "resources", "references" or "learning links" for a topic.
argument-hint: "[epNNN] [topic]"
---

# Episode resources

Resources are the most reused part of each episode — people come back to the deck for them.
Every link must be real, current, and honestly labelled.

## Where they go

- **Per-episode resources:** `brief.resourceGroups` in `src/content/epNNN.ts` (type `BriefResource`).
  This is the default for new episodes (EP003 pattern).
- **Shared catalogue:** `src/content/resources.ts` (`RESOURCES`, type `Resource`) referenced by
  `resourceIds`. Use only for a resource you expect several episodes to reuse; otherwise keep
  `resourceIds: []`.
- `buildDeck()` merges groups → `resourceIds` → `caseStudy.links`, removes duplicate URLs, and splits
  them across `resources-1` and `references` (titles from `resourceSlideTitles`). Group labels do
  not appear on the slides (only the unused `EpisodeResources` component reads them), so order the
  groups so that the first half of the combined list belongs on the first slide.

```ts
{
  title: "Claude Code 101",                              // the provider's own name for it, ≤ ~30 chars
  provider: "Claude Academy · Setup & core workflows",   // "Provider · what it is for", ≤ ~45 chars
  url: "https://academy.claude.com/courses/claude-code-101",
  access: "Free",                                        // "Free" | "Free tier" | "Subscription"
  ref: "R3",                                             // optional curriculum label; renders "R3 / title"
}
```

## Selection rules

1. **Hosts' picks first.** Resources the hosts named are included as given (verify the URL).
2. **Official and primary sources** over blog roundups: vendor docs, official courses (Microsoft
   Learn, GitHub Skills, Claude Academy, Google, AWS), standards bodies (OWASP, NIST, W3C), recognised
   books/papers, well-maintained open-source repos.
3. **Free first.** Paid tools are fine when the episode is about them; label them `Subscription` or
   `Free tier`. If a course is free but the tool it teaches is paid, say so in `brief.resourcesNote`.
4. **8–12 resources** in two coherent groups (e.g. "learn" vs "reference"); 4–6 per slide.
5. **No duplicates** across groups (duplicates are silently dropped from slides, which hides mistakes).
6. Stable, canonical URLs: no tracking parameters, no URL shorteners, no locale-forced paths unless
   needed (`/en-us/` is fine for Microsoft Learn).

## Research

To propose resources for a topic, spawn the `resource-researcher` agent with the episode topic,
outline and audience levels. Treat its output as candidates: present them to the user, then verify.

## Verification (mandatory before commit)

Spawn the `link-checker` agent with every URL in the episode (resource groups, case-study links,
YouTube URL, any `url` in brief pages). Fix or drop anything it reports as broken, redirected to an
unrelated page, paywalled-but-labelled-Free, or mismatched with its title/provider. Never ship a URL
you have not seen resolve to the expected page.

## After editing

- Run `npx vitest run src/test/deck.test.ts` — it asserts every resource URL appears as a link.
- Check the two resource slides in the browser (`?slide=resources-1`, `?slide=references`) for
  wrapping titles.
- Changing resources changes the PDF content hash, so cached PDFs refresh automatically — no
  `DECK_DESIGN_VERSION` bump.
