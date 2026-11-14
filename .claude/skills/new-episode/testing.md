# Tests for a new episode

Vitest + Testing Library, jsdom by default. TypeScript is strict (`noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`): index with `?.` or guard with `if (!x) throw …`.

## What already covers the new episode automatically

These loop over `EPISODES`, so they start testing the new episode as soon as it is registered:

| File | Checks |
| --- | --- |
| `src/test/deck.test.ts` | unique slide ids; every resource URL and the YouTube URL present as a link; every node inside 1920×1080 |
| `src/test/deck-pdf.test.ts` | one 1920×1080 PDF page per slide; link annotations equal the slide's link nodes |

`deck-pdf.test.ts` draws the cover artwork when the episode has no `presentationCover`. Without a JPEG
derivative in `src/assets/deck-pdf-images.json`, the PDF backend fetches the image from the published
site, so the test needs network access and the artwork must already be published.

## What you must update

### 1. `src/test/app-routing.test.tsx`

Add the slug to the route list:

```ts
it.each(["ep001", "ep002", "ep003", "epNNN"])(
```

### 2. `src/test/archive.test.ts`

These assertions name the newest episode and will fail once a newer one exists. Move them forward —
do not delete them:

- `"sorts newest first by default"` → `items[0]?.id` becomes `"epNNN"` (default sort = number desc).
- `"supports publication date newest first"` (`date-desc`) → `"epNNN"` when its date is the latest.
- `"sorts by title and searches by episode number"` → recompute `title-asc` / `title-desc` winners
  with the new title included (currently "From Prompt…" first, "The New Developer Playbook" last).
- `"filters before paginating"` (`audience: "Companies"`, `total` 1) → update if the new episode
  targets `Companies`.

### 3. New file `src/test/epNNN.test.ts`

Pin the facts and the layout safety that EP003's spec pins. Adapt ids and counts:

```ts
import { describe, expect, it } from "vitest";
import { EPISODES } from "@/content/episodes";
import { buildDeck } from "@/lib/deck-model";

const ep = EPISODES.find((e) => e.id === "epNNN");

describe("EPNNN episode", () => {
  it("has the scheduled date, recording link and slide order", () => {
    if (!ep) throw new Error("EPNNN missing");
    expect(ep.slug).toBe("epNNN");
    expect(ep.scheduledDate).toBe("YYYY-MM-DD");
    expect(ep.youtubeUrl).toBe("https://www.youtube.com/live/<id>");
    expect(EPISODES.filter((e) => e.slug === ep.slug)).toHaveLength(1);
    const deck = buildDeck(ep);
    expect(deck.map((s) => s.id)).toEqual([
      "cover",
      // …brief page ids in order…
      "resources-1",
      "references",
    ]);
    expect(deck.filter((s) => s.part === "resources")).toHaveLength(2);
  });

  it("keeps every slide readable: no overflow, no overlapping text", () => {
    if (!ep) throw new Error("EPNNN missing");
    for (const slide of buildDeck(ep)) {
      const texts = slide.nodes.filter((n) => n.kind === "text").filter((n) => n.lines.length > 0);
      for (const text of texts)
        if (text.y < 990)
          expect(
            text.y + text.lines.length * text.size * 1.3,
            `${slide.id}: ${text.lines.join(" ")}`,
          ).toBeLessThanOrEqual(966);
      for (let i = 0; i < texts.length; i++)
        for (let j = i + 1; j < texts.length; j++) {
          const a = texts[i]!,
            b = texts[j]!;
          const overlap =
            a.x < b.x + b.width &&
            b.x < a.x + a.width &&
            a.y < b.y + b.lines.length * b.size * 1.3 &&
            b.y < a.y + a.lines.length * a.size * 1.3;
          expect(overlap, `${slide.id}: ${a.lines.join(" ")} / ${b.lines.join(" ")}`).toBe(false);
        }
    }
  });
});
```

If the overflow test fails, shorten copy or move entries to another page (see `/episode-slides`) —
never change shared layout code to make one episode fit.

### 4. Poll episodes

If the episode adds a poll slide, follow the test notes in `/episode-poll` (QR destination, link
annotations, EP003 output unchanged).

## Run

```bash
npx vitest run src/test/epNNN.test.ts src/test/archive.test.ts src/test/app-routing.test.tsx
npx vitest run
```

The total number of passing tests should only grow from one episode to the next. If an existing test
fails, fix the content — do not delete or weaken the assertion — unless it is one of the "newest
episode" expectations listed above.
