import { describe, expect, it } from "vitest";
import { EPISODES } from "@/content/episodes";
import { EP004_ART } from "@/content/ep004-slides";
import { buildDeck, slideIndex, wrapText } from "@/lib/deck-model";
import metrics from "@/lib/deck-font-metrics.json";
import pdfImages from "@/assets/deck-pdf-images.json";

describe("EP004 presentation", () => {
  const ep = EPISODES.find((e) => e.id === "ep004")!;
  it("registers EP004 with the live link and schedule", () => {
    expect(ep.slug).toBe("ep004");
    expect(ep.scheduledDate).toBe("2026-11-14");
    expect(ep.youtubeUrl).toBe("https://youtube.com/live/GnvFox330Sg");
    expect(ep.youtubeVideoId).toBe("GnvFox330Sg");
  });
  it("tells the story in order and ends on the inventory case after the resources", () => {
    const deck = buildDeck(ep);
    expect(deck.map((s) => s.id)).toEqual([
      "cover",
      "journey",
      "previously",
      "developer-journey",
      "three-boxes",
      "architecture-vs-design",
      "questions",
      "case-study",
      "stage-1",
      "stack-hosting",
      "stage-4",
      "stage-5",
      "stage-6",
      "stage-7",
      "stage-8",
      "stage-9",
      "architecture-styles",
      "code-structure",
      "production",
      "deployment",
      "reference-architecture",
      "reference-detail",
      "order-flow",
      "same-product",
      "trade-offs",
      "takeaways",
      "resources-1",
      "references",
      "last-item",
    ]);
    expect(deck.filter((s) => s.part === "resources")).toHaveLength(2);
    expect(deck[slideIndex(deck, "stages-4-6")]?.id).toBe("stage-4");
  });
  it("embeds the three supplied diagrams on the web and in the PDF", () => {
    const deck = buildDeck(ep);
    const placed = (id: string) =>
      deck
        .find((s) => s.id === id)
        ?.nodes.filter((n) => n.kind === "image" && n.width > 1400)
        .map((n) => (n.kind === "image" ? n.src : ""));
    expect(placed("code-structure")).toEqual([EP004_ART.styles]);
    expect(placed("reference-architecture")).toEqual([EP004_ART.system]);
    expect(placed("reference-detail")).toEqual([EP004_ART.reference]);
    for (const src of Object.values(EP004_ART))
      expect((pdfImages as Record<string, string>)[src]?.length).toBeGreaterThan(10_000);
  });
  it("grows one diagram: each stage keeps earlier components and adds its own", () => {
    const deck = buildDeck(ep);
    const labels = (id: string) =>
      deck
        .find((s) => s.id === id)
        ?.nodes.flatMap((n) => (n.kind === "text" ? n.lines : []))
        .join(" | ") ?? "";
    const added: [string, string][] = [
      ["stage-1", "SQL database"],
      ["stage-4", "Load balancer"],
      ["stage-6", "Redis cache"],
      ["stage-7", "Object storage"],
      ["stage-8", "Message broker"],
      ["stage-9", "Payment provider"],
    ];
    added.forEach(([id, component], i) => {
      for (const [, earlier] of added.slice(0, i + 1)) expect(labels(id)).toContain(earlier);
      for (const [, later] of added.slice(i + 1)) expect(labels(id)).not.toContain(later);
      expect(labels(id), `${id} highlights ${component}`).toContain("NEW");
    });
  });
  it("keeps every slide readable, inside the canvas and free of overlapping text", () => {
    const glyphs = metrics as Record<string, Record<string, number>>;
    for (const slide of buildDeck(ep)) {
      const texts = slide.nodes.filter((n) => n.kind === "text").filter((n) => n.lines.length > 0);
      for (const t of texts) {
        if (t.y < 1000)
          expect
            .soft(t.y + t.lines.length * t.size * 1.3, `${slide.id}: ${t.lines.join(" ")}`)
            .toBeLessThanOrEqual(1004);
        for (const line of t.lines) {
          expect
            .soft(wrapText(line, t.width, t.size, t.font), `${slide.id}: ${line}`)
            .toHaveLength(1);
          for (const char of line)
            expect
              .soft(glyphs[t.font]?.[char], `${slide.id}: “${char}” missing in ${t.font} font`)
              .toBeDefined();
        }
      }
      const gap = 0.5;
      for (let i = 0; i < texts.length; i++)
        for (let j = i + 1; j < texts.length; j++) {
          const a = texts[i]!,
            b = texts[j]!;
          const overlap =
            a.x + gap < b.x + b.width &&
            b.x + gap < a.x + a.width &&
            a.y + gap < b.y + b.lines.length * b.size * 1.3 &&
            b.y + gap < a.y + a.lines.length * a.size * 1.3;
          expect
            .soft(overlap, `${slide.id}: ${a.lines.join(" ")} / ${b.lines.join(" ")}`)
            .toBe(false);
        }
    }
  });
});
