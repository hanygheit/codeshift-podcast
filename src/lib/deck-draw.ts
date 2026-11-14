import icons from "@/assets/deck-icons.json";
import { measureText, wrapText, type FontRole, type Ink, type Primitive } from "./deck-model";

/**
 * Small drawing kit for diagram slides. Coordinates are inches on a 13.333 × 7.5 in slide
 * (144 px per inch on the 1920 × 1080 canvas) and font sizes are points (2 px per point),
 * so diagrams can share geometry with the offline PowerPoint deck. Everything is emitted as
 * the deck's declarative primitives, so SVG and PDF stay identical.
 */
const IN = 144;
const PT = 2;
const LINE = 1.3;
const f = (n: number) => Math.round(n * 100) / 100;
const ICONS = icons as Record<string, string[]>;

export type Point = [number, number];
export interface TextOptions {
  x: number;
  y: number;
  w: number;
  h?: number;
  size?: number;
  color?: Ink;
  bold?: boolean;
  mono?: boolean;
  align?: "left" | "center" | "right";
  valign?: "top" | "middle";
  nowrap?: boolean;
}
export interface BoxOptions {
  fill?: Ink | null;
  /** Fill transparency, 0–100. */
  ft?: number;
  line?: Ink | null;
  lw?: number;
  dash?: boolean;
  r?: number;
}
export interface LineOptions {
  color?: Ink;
  width?: number;
  dash?: boolean;
  arrow?: boolean;
}

function roundRect(x: number, y: number, w: number, h: number, radius: number) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  if (!r)
    return `M${f(x)} ${f(y)}L${f(x + w)} ${f(y)}L${f(x + w)} ${f(y + h)}L${f(x)} ${f(y + h)}Z`;
  const k = r * 0.5523;
  const [l, t, rt, b] = [x, y, x + w, y + h];
  return (
    `M${f(l + r)} ${f(t)}L${f(rt - r)} ${f(t)}C${f(rt - r + k)} ${f(t)} ${f(rt)} ${f(t + r - k)} ${f(rt)} ${f(t + r)}` +
    `L${f(rt)} ${f(b - r)}C${f(rt)} ${f(b - r + k)} ${f(rt - r + k)} ${f(b)} ${f(rt - r)} ${f(b)}` +
    `L${f(l + r)} ${f(b)}C${f(l + r - k)} ${f(b)} ${f(l)} ${f(b - r + k)} ${f(l)} ${f(b - r)}` +
    `L${f(l)} ${f(t + r)}C${f(l)} ${f(t + r - k)} ${f(l + r - k)} ${f(t)} ${f(l + r)} ${f(t)}Z`
  );
}

export class Draw {
  readonly nodes: Primitive[] = [];

  /** Wrapped text that shrinks (to 60%) until it fits its box. Returns the height used, in inches. */
  text(value: string, o: TextOptions): number {
    const font: FontRole = o.mono ? "mono" : o.bold ? "title" : "body";
    const width = o.w * IN;
    const height = o.h === undefined ? undefined : o.h * IN;
    let size = Math.round((o.size ?? 14) * PT);
    const min = Math.ceil(size * 0.6);
    let lines: string[] = [];
    let widest = 0;
    for (; ; size--) {
      lines = o.nowrap ? value.split("\n") : wrapText(value, width, size, font);
      widest = Math.max(0, ...lines.map((line) => measureText(line, size, font)));
      const tall = (lines.length - 1) * size * LINE + size;
      if ((widest <= width && (height === undefined || tall <= height + 1)) || size <= min) break;
    }
    const block = (lines.length - 1) * size * LINE + size * 0.74;
    const top = Math.round(
      o.y * IN + (o.valign === "middle" && height !== undefined ? (height - block) / 2 : 0),
    );
    const ink = o.color ?? "foreground";
    if (!o.align || o.align === "left")
      this.nodes.push({
        kind: "text",
        x: Math.round(o.x * IN),
        y: top,
        width: Math.ceil(widest) + 2,
        size,
        font,
        ink,
        lines,
      });
    else
      lines.forEach((line, i) => {
        const w = measureText(line, size, font);
        const x = o.x * IN + (o.align === "center" ? (width - w) / 2 : width - w);
        this.nodes.push({
          kind: "text",
          x: Math.round(x),
          y: f(top + i * size * LINE),
          width: Math.ceil(w) + 2,
          size,
          font,
          ink,
          lines: [line],
        });
      });
    return (lines.length * size * LINE) / IN;
  }

  private shape(d: string, x: number, y: number, w: number, h: number, o: BoxOptions) {
    const bounds = { x: f(x * IN), y: f(y * IN), width: f(w * IN), height: f(h * IN) };
    const fill = o.fill === undefined ? "panel" : o.fill;
    const opacity = 1 - (o.ft ?? 0) / 100;
    if (fill && opacity > 0)
      this.nodes.push({ kind: "path", ...bounds, d, fill, ...(opacity < 1 ? { opacity } : {}) });
    const line = o.line === undefined ? "border" : o.line;
    if (line)
      this.nodes.push({
        kind: "path",
        ...bounds,
        d,
        stroke: line,
        strokeWidth: (o.lw ?? 1) * PT,
        ...(o.dash ? { dash: [10, 7] } : {}),
      });
  }

  box(x: number, y: number, w: number, h: number, o: BoxOptions = {}) {
    this.shape(roundRect(x * IN, y * IN, w * IN, h * IN, (o.r ?? 0.08) * IN), x, y, w, h, o);
  }

  ellipse(x: number, y: number, w: number, h: number, o: BoxOptions = {}) {
    const [rx, ry] = [(w * IN) / 2, (h * IN) / 2];
    const [cx, cy] = [x * IN + rx, y * IN + ry];
    const [kx, ky] = [rx * 0.5523, ry * 0.5523];
    const d =
      `M${f(cx - rx)} ${f(cy)}C${f(cx - rx)} ${f(cy - ky)} ${f(cx - kx)} ${f(cy - ry)} ${f(cx)} ${f(cy - ry)}` +
      `C${f(cx + kx)} ${f(cy - ry)} ${f(cx + rx)} ${f(cy - ky)} ${f(cx + rx)} ${f(cy)}` +
      `C${f(cx + rx)} ${f(cy + ky)} ${f(cx + kx)} ${f(cy + ry)} ${f(cx)} ${f(cy + ry)}` +
      `C${f(cx - kx)} ${f(cy + ry)} ${f(cx - rx)} ${f(cy + ky)} ${f(cx - rx)} ${f(cy)}Z`;
    this.shape(d, x, y, w, h, o);
  }

  /** Polyline connector with an optional arrowhead on its final segment. */
  line(points: Point[], o: LineOptions = {}) {
    const px = points.map(([x, y]): Point => [x * IN, y * IN]);
    const last = px[px.length - 1];
    const prev = px[px.length - 2];
    if (!last || !prev) return;
    const color = o.color ?? "dim";
    const width = (o.width ?? 1.5) * PT;
    const arrow = o.arrow !== false;
    const length = Math.hypot(last[0] - prev[0], last[1] - prev[1]) || 1;
    const ux = (last[0] - prev[0]) / length;
    const uy = (last[1] - prev[1]) / length;
    const head = Math.min(16, length);
    const end: Point = arrow ? [last[0] - ux * head * 0.8, last[1] - uy * head * 0.8] : last;
    const path = [...px.slice(0, -1), end];
    const xs = px.map((p) => p[0]);
    const ys = px.map((p) => p[1]);
    const bounds = {
      x: f(Math.min(...xs)),
      y: f(Math.min(...ys)),
      width: f(Math.max(...xs) - Math.min(...xs)),
      height: f(Math.max(...ys) - Math.min(...ys)),
    };
    this.nodes.push({
      kind: "path",
      ...bounds,
      d: path.map(([x, y], i) => `${i ? "L" : "M"}${f(x)} ${f(y)}`).join(""),
      stroke: color,
      strokeWidth: width,
      ...(o.dash ? { dash: [10, 7] } : {}),
    });
    if (arrow) {
      const bx = last[0] - ux * head;
      const by = last[1] - uy * head;
      const half = 7;
      this.nodes.push({
        kind: "path",
        ...bounds,
        d: `M${f(last[0])} ${f(last[1])}L${f(bx - uy * half)} ${f(by + ux * half)}L${f(bx + uy * half)} ${f(by - ux * half)}Z`,
        fill: color,
      });
    }
  }

  /** Outline icon from the bundled icon set, drawn as stroked vector paths. */
  icon(name: string, color: Ink, x: number, y: number, size: number) {
    for (const d of ICONS[name] ?? [])
      this.nodes.push({
        kind: "path",
        x: f(x * IN),
        y: f(y * IN),
        width: f(size * IN),
        height: f(size * IN),
        d,
        stroke: color,
        strokeWidth: 2,
        round: true,
        tx: f(x * IN),
        ty: f(y * IN),
        scale: f((size * IN) / 24),
      });
  }

  pill(
    label: string,
    x: number,
    y: number,
    w: number,
    h: number,
    o: {
      fill?: Ink;
      line?: Ink | null;
      color?: Ink;
      size?: number;
      bold?: boolean;
      mono?: boolean;
    } = {},
  ) {
    this.box(x, y, w, h, { fill: o.fill ?? "panel2", line: o.line ?? null, r: h / 2 });
    this.text(label, {
      x: x + 0.06,
      y,
      w: w - 0.12,
      h,
      size: o.size ?? 12,
      bold: o.bold ?? true,
      ...(o.mono ? { mono: true } : {}),
      color: o.color ?? "foreground",
      align: "center",
      valign: "middle",
      nowrap: true,
    });
  }

  image(src: string, x: number, y: number, w: number, h: number) {
    this.nodes.push({
      kind: "image",
      x: f(x * IN),
      y: f(y * IN),
      width: f(w * IN),
      height: f(h * IN),
      src,
    });
  }

  link(url: string, label: string, x: number, y: number, w: number, h: number) {
    this.nodes.push({
      kind: "link",
      x: f(x * IN),
      y: f(y * IN),
      width: f(w * IN),
      height: f(h * IN),
      url,
      label,
    });
  }
}
