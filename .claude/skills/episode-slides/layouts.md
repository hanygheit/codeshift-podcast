# Shared layouts and their capacity

Source of truth: `layoutSlide()` in `src/lib/deck-model.ts`. Canvas 1920×1080; content area x 56–1864;
body text must end by y = 966 (footer and page number sit at 1016). Text wraps with real font metrics
(`src/lib/deck-font-metrics.json`); line height is `size × 1.3`.

Character counts below are **approximate per line** (average glyph widths: title ≈ 0.6 em,
body ≈ 0.53 em). They are planning numbers — the overflow/overlap test is the final judge.

If `DeckSlide.layout` or `BriefPage.layout` lists a layout not described here, it was added after
this guide: read its branch in `layoutSlide()` (and any episode module that draws it) before using
it, then add its capacity to this file.

## Page chrome (all brief pages)

| Element | Font / size | Width | ≈ chars per line |
| --- | --- | --- | --- |
| `section` (uppercase mono) | mono 26 | 1808 | ~115 |
| `title` | title 68 | 1808 | ~44 (a 2nd line costs ~88 px of body space) |
| `subtitle` | body 34 | 1760 | ~98 |
| `takeaway` panel | title 34 | 1704 | ~83 (each line costs ~44 px + panel padding) |

Body space starts ≈ y 310 with a one-line title and no subtitle, and ends at 966, or ≈ 862 with a
one-line takeaway. Roughly **650 px** without takeaway, **550 px** with one.

## `statement` — numbered rows

Entries stacked vertically, numbered `01`, `02`…; a leading `"1 / "` in titles is stripped.

- Best for 3 entries (max 4 with one-line bodies).
- Title: title 48, ~56 chars/line. Body: body 40, ~76 chars/line.
- Use for: the three core messages, "what you need to know".

## `comparison` — two columns

Exactly **2 entries** (left, right). `body` is split on `\n`; each line becomes its own paragraph.

- Column width 852. Column title: title 52, ~27 chars/line.
- Body lines: body 44 (~36 chars/line) with 36 px gaps; with `cards: true` body 40 (~40 chars/line)
  and 16 px gaps.
- Capacity: ~4–5 single-line paragraphs per column (≈ 6–7 with `cards`). A long quoted paragraph
  (as in EP003 `task-definition`) counts by its wrapped lines.
- Use for: weak vs strong, before vs after, myth vs reality, human vs agent.

## `matrix` — grid (default layout)

Columns: **3 if exactly 3 entries, otherwise 2**. Rows fill the available height evenly.

| Entries | Grid | Cell width | Title ≈ chars/line | Body ≈ chars/line | Body lines that fit* |
| --- | --- | --- | --- | --- | --- |
| 3 | 3 × 1 | 571 | ~20 (46) | ~25 (40) | 8+ |
| 4 | 2 × 2 | 880 | ~31 | ~40 | ~3–4 |
| 6 | 2 × 3 | 880 | ~31 | ~40 | ~1–2 |

\* without a takeaway; subtract ~1 line per row with one. With `cards: true` subtract 48 px of width
(24 px inset each side) and the title drops to 44.

- `emphasis` highlights one cell's accent and title in teal.
- Use for: frameworks with 3–6 parts, audience-by-role guidance, option sets (poll page).

## `flow` — steps

Without `cards`: a horizontal timeline, one column per entry (best 3–5).
- Column width `(1808 − (n−1)·40) / n`; with 4 entries 422 → title ~15 chars, body ~20 chars/line.

With `cards: true`: numbered panels with `>` arrows between them.
- **1–4 entries → one row.** Card width for 4: 425 → title (46) ~13 chars/line, body (40) ~17 chars/
  line, ~6 body lines.
- **5–8 entries → two rows** (first row gets the extra one: 7 → 4 + 3). Title (40) ~13 chars beside the
  number, body (36) ~20 chars/line, ~3 lines with a takeaway.
- `emphasis` highlights one card.
- Use for: processes, roadmaps, the `journey` chapter list, the closing rules checklist.

## `map` — packages only

Entries are replaced by `brief.packages` (EP002 learning playbook). Do not use for other episodes.

## Generated resource slides (directory)

Built by `buildDeck()`; you control only the data (`brief.resourceGroups`) and `resourceSlideTitles`.

- Without `brief.packages`, all resources are de-duplicated by URL and split in half:
  `resources-1` gets the first ⌈n/2⌉, `references` the rest.
- Per slide: > 5 entries → 2 columns; > 8 entries → smaller type (32).
- If any brief page uses `cards: true`, directory entries use larger type (title 44, meta 32).
- Entry title renders as `"<ref> / <title> >"`; meta line is `provider · access`.
- **Plan 8–12 resources total (4–6 per slide).** Keep titles ≤ ~30 chars and provider labels
  ≤ ~45 chars so each entry stays two lines.

## Cover

- With `presentationCover`: short title (title 104, width 1000, ≤ 2 lines ≈ 32 chars), subtitle
  (body 46, ~40 chars/line), hook panel (one line per sentence, ≤ ~25 chars each), stage rail on the
  right (3–4 stages), "Watch the episode" link.
- Without it: short title (title 88, ≤ 3 lines), "Executive Episode Brief", date, hosts line
  (hard-coded "Hany Saad & Ahmed Mamdoh" — guests are not shown here), watch CTA, artwork 754×480.
