import { describe, expect, it } from "vitest";
import { EPISODES } from "@/content/episodes";
import { buildDeck, wrapText } from "@/lib/deck-model";
import { ep003PresentationNodes } from "@/content/ep003-presentation";
import qr from "@/assets/ep003-qr.json";

const url = "https://codeshift-podcast.lovable.app/episodes/ep003/slides?slide=cover";

describe("EP003 live presentation QR", () => {
  it("reuses the exact destination on only the cover and final resources slides", () => {
    expect(qr.url).toBe(url);
    const ep = EPISODES.find((e) => e.id === "ep003")!;
    const deck = buildDeck(ep);
    expect(
      deck.filter((s) => s.nodes.some((n) => n.kind === "link" && n.url === url)).map((s) => s.id),
    ).toEqual(["cover", "references"]);
    for (const slide of deck)
      for (const node of slide.nodes.filter((n) => n.kind === "text"))
        for (const line of node.lines)
          expect(wrapText(line, node.width, node.size, node.font)).toHaveLength(1);
  });

  it("preserves a four-module quiet zone around the static square matrix", () => {
    expect(qr.rows).toHaveLength(45);
    qr.rows.forEach((row, i) => {
      expect(row).toMatch(/^[01]{45}$/);
      expect(row.slice(0, 4)).toBe("0000");
      expect(row.slice(-4)).toBe("0000");
      if (i < 4 || i >= 41) expect(row).toBe("0".repeat(45));
    });
  });

  it("leaves unselected EP003 slides untouched and QR areas clear of text and controls", () => {
    const ep = EPISODES.find((e) => e.id === "ep003")!;
    for (const slide of buildDeck(ep)) {
      const links = slide.nodes.filter((n) => n.kind === "link" && n.url === url);
      if (!links.length) {
        expect(ep003PresentationNodes(slide)).toBe(slide.nodes);
        continue;
      }
      for (const link of links) {
        if (link.kind !== "link") throw new Error("Expected QR link");
        for (const node of slide.nodes) {
          if (node === link || (node.kind !== "text" && node.kind !== "link")) continue;
          const height = node.kind === "text" ? node.lines.length * node.size * 1.3 : node.height;
          expect(
            node.x < link.x + link.width &&
              link.x < node.x + node.width &&
              node.y < link.y + link.height &&
              link.y < node.y + height,
            `${slide.id}: QR overlaps ${node.kind}`,
          ).toBe(false);
        }
      }
    }
    for (const ep of EPISODES.filter((e) => e.id !== "ep003"))
      expect(
        buildDeck(ep)
          .flatMap((s) => s.nodes)
          .some((n) => n.kind === "link" && n.url === url),
      ).toBe(false);
  });
});
