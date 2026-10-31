import qr from "@/assets/ep003-qr.json";
import pollQr from "@/assets/live-poll-qr.json";
import logo from "@/assets/codeshift-logo.png.asset.json";
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
  if (slide.id === "live-poll") {
    const nodes: Primitive[] = [
      { kind: "rect", x: 0, y: 0, width: 1920, height: 1080, ink: "background" },
      { kind: "image", x: 56, y: 26, width: 54, height: 54, src: logo.url },
      {
        kind: "text",
        x: 130,
        y: 36,
        width: 850,
        size: 26,
        font: "mono",
        ink: "muted",
        lines: ["CodeShift / EP003"],
      },
      {
        kind: "text",
        x: 1230,
        y: 36,
        width: 634,
        size: 26,
        font: "mono",
        ink: "teal",
        lines: ["LIVE AUDIENCE POLL"],
      },
      { kind: "rect", x: 56, y: 100, width: 1808, height: 2, ink: "border" },
      {
        kind: "text",
        x: 56,
        y: 142,
        width: 1240,
        size: 54,
        font: "title",
        ink: "foreground",
        lines: wrapText(slide.title, 1240, 54, "title"),
      },
      {
        kind: "text",
        x: 56,
        y: 290,
        width: 1190,
        size: 42,
        font: "title",
        ink: "teal",
        lines: wrapText(slide.subtitle ?? "", 1190, 42, "title"),
      },
    ];
    slide.entries.forEach((entry, index) => {
      const y = 420 + index * 128;
      nodes.push(
        { kind: "rect", x: 56, y, width: 1120, height: 1, ink: "border" },
        {
          kind: "text",
          x: 56,
          y: y + 14,
          width: 1120,
          size: 32,
          font: "title",
          ink: index === 3 ? "teal" : "foreground",
          lines: wrapText(entry.title, 1120, 32, "title"),
        },
        {
          kind: "text",
          x: 56,
          y: y + 60,
          width: 1120,
          size: 25,
          font: "body",
          ink: "muted",
          lines: wrapText(entry.body, 1120, 25, "body"),
        },
      );
    });
    const qrSize = 440;
    const qrX = 1376;
    const qrY = 374;
    const unit = qrSize / pollQr.rows.length;
    nodes.push({ kind: "rect", x: qrX, y: qrY, width: qrSize, height: qrSize, ink: "foreground" });
    pollQr.rows.forEach((row, r) => {
      for (let c = 0; c < row.length; c++)
        if (row[c] === "1")
          nodes.push({
            kind: "rect",
            x: qrX + c * unit,
            y: qrY + r * unit,
            width: unit,
            height: unit,
            ink: "background",
          });
    });
    nodes.push(
      {
        kind: "text",
        x: 1360,
        y: 838,
        width: 472,
        size: 30,
        font: "title",
        ink: "teal",
        lines: ["Scan to Vote Live"],
      },
      {
        kind: "link",
        x: qrX,
        y: qrY,
        width: qrSize,
        height: qrSize,
        url: pollQr.url,
        label: "Scan to Vote Live",
      },
      {
        kind: "text",
        x: 56,
        y: 908,
        width: 1120,
        size: 34,
        font: "title",
        ink: "teal",
        lines: ["Scan. Vote. Let's Discuss."],
      },
      {
        kind: "text",
        x: 56,
        y: 1002,
        width: 1120,
        size: 24,
        font: "mono",
        ink: "muted",
        lines: ["Host results →"],
      },
      {
        kind: "link",
        x: 56,
        y: 990,
        width: 350,
        height: 48,
        url: "https://codeshift-podcast.lovable.app/polls/ep003-agent-autonomy/results?host=true",
        label: "Host results",
      },
      {
        kind: "text",
        x: 56,
        y: 1050,
        width: 1200,
        size: 18,
        font: "mono",
        ink: "muted",
        lines: ["Think Beyond the Code."],
      },
      {
        kind: "text",
        x: 1640,
        y: 1050,
        width: 224,
        size: 18,
        font: "mono",
        ink: "muted",
        lines: ["03 / 17"],
      },
      { kind: "rect", x: 0, y: 1074, width: 1920, height: 6, ink: "primary" },
    );
    return nodes;
  }
  if (slide.id === "cover") {
    const nodes = slide.nodes
      .filter((n) => !(n.kind === "rect" && n.y === 566 && n.width === 16))
      .map((n): Primitive => {
        if (n.kind === "text" && n.x === 1240 && n.y >= 550)
          return {
            ...n,
            width: 300,
            lines: wrapText(n.lines.join(" "), 300, n.size, n.font),
            ...(n.y === 560 ? { lines: ["03 · SECURITY / UX"] } : {}),
            ...(n.y === 728 ? { lines: ["04 · MERGE DECISION"] } : {}),
            ...(n.y === 892 ? { y: 936, size: 22, lines: ["Watch episode >"] } : {}),
          };
        if (n.kind === "link" && n.x === 1240) return { ...n, y: 932, width: 300, height: 42 };
        if (n.kind === "rect" && n.x === 1240 && n.y === 934) return { ...n, y: 974, width: 300 };
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
