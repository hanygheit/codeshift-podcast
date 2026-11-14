import { describe, expect, it } from "vitest";
import { EPISODES } from "@/content/episodes";
import { buildDeck, wrapText } from "@/lib/deck-model";

describe("EP004 presentation", () => {
  const ep = EPISODES.find((e) => e.id === "ep004")!;
  it("registers EP004 with the live link and schedule", () => {
    expect(ep.slug).toBe("ep004");
    expect(ep.scheduledDate).toBe("2026-11-14");
    expect(ep.youtubeUrl).toBe("https://youtube.com/live/GnvFox330Sg");
    expect(ep.youtubeVideoId).toBe("GnvFox330Sg");
  });
  it("keeps every slide readable, inside the canvas and free of overlapping text", () => {
    const deck = buildDeck(ep);
    expect(deck.filter((s) => s.part === "resources")).toHaveLength(2);
    for (const slide of deck) {
      const texts = slide.nodes.filter((n) => n.kind === "text").filter((n) => n.lines.length > 0);
      for (const t of texts) {
        if (t.y < 990)
          expect
            .soft(t.y + t.lines.length * t.size * 1.3, `${slide.id}: ${t.lines.join(" ")}`)
            .toBeLessThanOrEqual(966);
        for (const line of t.lines) expect(wrapText(line, t.width, t.size, t.font)).toHaveLength(1);
      }
      for (let i = 0; i < texts.length; i++)
        for (let j = i + 1; j < texts.length; j++) {
          const a = texts[i]!,
            b = texts[j]!;
          const overlap =
            a.x < b.x + b.width &&
            b.x < a.x + a.width &&
            a.y < b.y + b.lines.length * b.size * 1.3 &&
            b.y < a.y + a.lines.length * a.size * 1.3;
          expect
            .soft(overlap, `${slide.id}: ${a.lines.join(" ")} / ${b.lines.join(" ")}`)
            .toBe(false);
        }
    }
  });
});
