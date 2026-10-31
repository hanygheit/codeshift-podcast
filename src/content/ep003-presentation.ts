import qr from "@/assets/ep003-qr.json";
import { wrapText, type DeckSlide, type Primitive } from "@/lib/deck-model";

export const EP003_PRESENTATION_URL = qr.url;

function text(value: string, x: number, y: number, width: number, size: number): Primitive {
  const lines = wrapText(value, width, size, "body");
  return { kind: "text", x, y, width, size, font: "body", ink: "teal", lines };
}

// Static QR modules use existing vector primitives, so SVG and PDF remain identical.
function qrNodes(x: number, y: number, size: number, label: string, labelY: number): Primitive[] {
  const unit = size / qr.rows.length;
  const nodes: Primitive[] = [{ kind: "rect", x, y, width: size, height: size, ink: "foreground" }];
  qr.rows.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] === "1")
        nodes.push({
          kind: "rect",
          x: x + c * unit,
          y: y + r * unit,
          width: unit,
          height: unit,
          ink: "background",
        });
    }
  });
  nodes.push(text(label, x, labelY, size, 26));
  nodes.push({ kind: "link", x, y, width: size, height: size, url: qr.url, label });
  return nodes;
}

export function ep003PresentationNodes(slide: DeckSlide): Primitive[] {
  if (slide.id === "cover") {
    const nodes = slide.nodes
      .filter((n) => !(n.kind === "rect" && n.y === 566 && n.width === 16))
      .map((n): Primitive => {
        if (n.kind === "text" && n.x === 1240 && n.y >= 550)
          return {
            ...n,
            width: 300,
            ...(n.y === 604 ? { lines: ["Engineering", "Verification"] } : {}),
            ...(n.y === 892 ? { lines: ["Watch episode >"] } : {}),
          };
        if (n.kind === "link" && n.x === 1240) return { ...n, width: 300 };
        if (n.kind === "rect" && n.x === 1240 && n.y === 934) return { ...n, width: 300 };
        return n;
      });
    return [...nodes, ...qrNodes(1576, 640, 288, "Scan for Slides & Resources", 566)];
  }
  if (slide.id !== "references") return slide.nodes;

  // Keep every official resource at its original font size in a spacious left column.
  const nodes = slide.nodes.filter((n) => n.y < 290 || n.y >= 990);
  slide.entries.forEach((entry, i) => {
    const y = 300 + i * 110;
    nodes.push({
      kind: "text",
      x: 56,
      y,
      width: 1230,
      size: 44,
      font: "title",
      ink: "teal",
      lines: [`${entry.title} >`],
    });
    nodes.push({
      kind: "text",
      x: 56,
      y: y + 64,
      width: 1230,
      size: 32,
      font: "body",
      ink: "muted",
      lines: [[entry.body, entry.meta].filter(Boolean).join(" · ")],
    });
    if (entry.url)
      nodes.push({
        kind: "link",
        x: 56,
        y,
        width: 1230,
        height: 105,
        url: entry.url,
        label: entry.title,
      });
  });
  return [...nodes, ...qrNodes(1424, 490, 440, "Explore the Full Presentation", 410)];
}
