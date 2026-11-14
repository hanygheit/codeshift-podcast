import { Draw, type Point } from "@/lib/deck-draw";
import type { DeckEntry, DeckSlide, Ink, Primitive } from "@/lib/deck-model";

/**
 * EP004 diagram slides. Geometry is in inches / points (see deck-draw) and mirrors the
 * offline PowerPoint deck; every shape is a deck primitive, so SVG and PDF match.
 */
const CAT: Record<string, Ink> = {
  client: "muted",
  edge: "teal",
  app: "primary",
  data: "amber",
  msg: "violet",
  ext: "rose",
};

function badge(d: Draw, x: number, y: number) {
  d.box(x, y, 0.46, 0.22, { fill: "foreground", line: null, r: 0.06 });
  d.text("NEW", {
    x,
    y,
    w: 0.46,
    h: 0.22,
    size: 8.5,
    mono: true,
    color: "background",
    align: "center",
    valign: "middle",
    nowrap: true,
  });
}
function takeaway(d: Draw, text: string | undefined, y = 6.12, h = 0.72) {
  if (!text) return;
  d.box(0.5, y, 12.33, h);
  d.text(text, { x: 0.8, y, w: 11.7, h, size: 16, bold: true, color: "teal", valign: "middle" });
}
function callouts(d: Draw, entries: DeckEntry[], inks: Ink[] = ["rose", "teal", "amber"]) {
  entries.slice(0, 3).forEach((entry, i) => {
    const x = 0.5 + i * 4.165;
    d.box(x, 6.06, 4.0, 0.86);
    d.text(entry.title.toUpperCase(), {
      x: x + 0.17,
      y: 6.13,
      w: 3.6,
      size: 9.5,
      mono: true,
      color: inks[i] ?? "teal",
      nowrap: true,
    });
    d.text(entry.body, { x: x + 0.17, y: 6.36, w: 3.66, h: 0.5, size: 12.5 });
  });
}
function label(d: Draw, text: string, x: number, y: number, w = 6) {
  d.text(text, { x, y, w, size: 10.5, mono: true, color: "teal", nowrap: true });
}
function bullets(d: Draw, items: string[], x: number, y: number, w: number, size = 13, gap = 0.07) {
  let top = y;
  for (const item of items) {
    d.text("•", { x, y: top, w: 0.2, size, nowrap: true });
    top += d.text(item, { x: x + 0.24, y: top, w: w - 0.24, size }) + gap;
  }
}
function chain(d: Draw, y: number) {
  const steps: [string, Ink][] = [
    ["Requirement", "muted"],
    ["Challenge", "rose"],
    ["Decision", "teal"],
    ["Trade-off", "amber"],
    ["Updated diagram", "primary"],
  ];
  steps.forEach(([text, ink], i) => {
    const x = 0.5 + i * 2.5;
    d.box(x, y, 2.05, 0.66, { line: ink, lw: 1.75, r: 0.33 });
    d.text(text, {
      x: x + 0.1,
      y,
      w: 1.85,
      h: 0.66,
      size: 14,
      bold: true,
      align: "center",
      valign: "middle",
      nowrap: true,
    });
    if (i < steps.length - 1)
      d.line(
        [
          [x + 2.08, y + 0.33],
          [x + 2.47, y + 0.33],
        ],
        { color: "muted", width: 2 },
      );
  });
}
function mini(
  d: Draw,
  text: string,
  x: number,
  y: number,
  w: number,
  h: number,
  ink: Ink,
  dash = false,
) {
  d.box(x, y, w, h, { fill: "panel2", line: ink, lw: 1.5, dash });
  d.text(text, {
    x: x + 0.05,
    y,
    w: w - 0.1,
    h,
    size: 11,
    bold: true,
    align: "center",
    valign: "middle",
    nowrap: true,
  });
}
function store(d: Draw, x: number, y: number, ink: Ink) {
  d.box(x, y, 0.6, 0.44, { fill: ink, ft: 70, line: ink, lw: 1.25, r: 0.14 });
}

// ---------- the evolving e-commerce diagram: one geometry for every stage ----------
const COL = { C: 0.5, E: 2.85, A: 5.25, D: 7.95, X: 10.75 };
const WIDTH = { C: 1.75, E: 1.75, A: 2.05, D: 1.95, X: 2.08 };
interface Node {
  x: number;
  w: number;
  y: number;
  h: number;
  label: string;
  sub: string;
  icon: string;
  cat: string;
  stage: number;
}
const node = (
  col: keyof typeof COL,
  y: number,
  h: number,
  name: string,
  sub: string,
  icon: string,
  cat: string,
  stage: number,
): Node => ({
  x: COL[col],
  w: WIDTH[col],
  y,
  h,
  label: name,
  sub,
  icon,
  cat,
  stage,
});
const NODES: Node[] = [
  node("C", 3.65, 0.6, "Web / Mobile", "customers", "monitor-smartphone", "client", 1),
  node("E", 3.65, 0.6, "Load balancer", "proxy · TLS", "network", "edge", 4),
  node("E", 2.35, 0.58, "CDN", "edge cache", "globe", "edge", 7),
  node("D", 2.35, 0.58, "Object storage", "images · files", "hard-drive", "data", 7),
  node("D", 3.13, 0.58, "Redis cache", "hot product reads", "layers", "data", 6),
  node("D", 4.19, 0.58, "SQL database", "orders · payments", "database", "data", 1),
  node("D", 5.08, 0.58, "Message broker", "order events", "share-2", "msg", 8),
  node("A", 5.08, 0.58, "Workers", "email · fulfillment", "cog", "app", 8),
  node("X", 3.65, 0.6, "Payment provider", "charge · webhook", "credit-card", "ext", 9),
  node("X", 4.62, 0.56, "Email / SMS", "notifications", "mail", "ext", 9),
  node("X", 5.3, 0.56, "Shipping", "fulfillment partner", "truck", "ext", 9),
];
const API = { x: COL.A, y: 3.3, w: WIDTH.A, h: 1.3 };
const AR = API.x + API.w;
interface Edge {
  from: number;
  to?: number;
  pts: Point[];
  dash?: boolean;
  arrow?: boolean;
  note?: { text: string; x: number; y: number; w: number; center?: boolean };
}
const EDGES: Edge[] = [
  {
    from: 1,
    to: 3,
    pts: [
      [2.25, 3.95],
      [5.25, 3.95],
    ],
  },
  {
    from: 1,
    pts: [
      [AR, 4.48],
      [7.95, 4.48],
    ],
  },
  {
    from: 4,
    pts: [
      [2.25, 3.95],
      [2.85, 3.95],
    ],
    note: { text: "API", x: 2.27, y: 3.7, w: 0.56, center: true },
  },
  {
    from: 4,
    pts: [
      [4.6, 3.95],
      [5.25, 3.95],
    ],
  },
  {
    from: 6,
    pts: [
      [AR, 3.42],
      [7.95, 3.42],
    ],
  },
  {
    from: 7,
    pts: [
      [1.375, 3.65],
      [1.375, 2.64],
      [2.85, 2.64],
    ],
    note: { text: "static files", x: 1.45, y: 2.38, w: 1.35 },
  },
  {
    from: 7,
    pts: [
      [4.6, 2.64],
      [7.95, 2.64],
    ],
    note: { text: "origin fetch on cache miss", x: 4.8, y: 2.38, w: 3.0, center: true },
  },
  {
    from: 8,
    dash: true,
    pts: [
      [6.95, 4.6],
      [6.95, 4.93],
      [8.925, 4.93],
      [8.925, 5.08],
    ],
    note: { text: "publish", x: 7.38, y: 4.68, w: 0.55 },
  },
  {
    from: 8,
    dash: true,
    pts: [
      [7.95, 5.37],
      [AR, 5.37],
    ],
  },
  {
    from: 9,
    pts: [
      [AR, 3.84],
      [10.75, 3.84],
    ],
    note: { text: "pay", x: 10.2, y: 3.58, w: 0.5 },
  },
  {
    from: 9,
    dash: true,
    pts: [
      [10.75, 4.06],
      [AR, 4.06],
    ],
    note: { text: "webhook", x: 10.16, y: 4.12, w: 0.58 },
  },
  {
    from: 9,
    arrow: false,
    pts: [
      [6.275, 5.66],
      [6.275, 5.8],
      [10.45, 5.8],
      [10.45, 4.9],
    ],
  },
  {
    from: 9,
    pts: [
      [10.45, 4.9],
      [10.75, 4.9],
    ],
  },
  {
    from: 9,
    pts: [
      [10.45, 5.58],
      [10.75, 5.58],
    ],
  },
];
function drawNode(d: Draw, n: Node, fresh: boolean) {
  const ink = CAT[n.cat] ?? "muted";
  if (fresh) d.box(n.x, n.y, n.w, n.h, { fill: ink, ft: 84, line: null });
  d.box(n.x, n.y, n.w, n.h, {
    fill: fresh ? null : "panel",
    line: fresh ? ink : "border",
    lw: fresh ? 2.25 : 1.25,
  });
  const cy = n.y + n.h / 2;
  d.icon(n.icon, ink, n.x + 0.13, cy - 0.17, 0.34);
  d.text(n.label, {
    x: n.x + 0.56,
    y: cy - 0.22,
    w: n.w - 0.62,
    size: 11.5,
    bold: true,
    nowrap: true,
  });
  d.text(n.sub, {
    x: n.x + 0.56,
    y: cy + 0.04,
    w: n.w - 0.62,
    size: 9.5,
    color: "muted",
    nowrap: true,
  });
  if (fresh) badge(d, n.x + n.w - 0.36, n.y - 0.19);
}
function drawApi(d: Draw, stage: number, fresh: boolean) {
  const { x, y, w, h } = API;
  const multi = stage >= 4;
  const line: Ink = fresh ? "primary" : "border";
  if (multi) {
    d.box(x + 0.24, y - 0.16, w - 0.48, 0.3, { line });
    d.box(x + 0.12, y - 0.08, w - 0.24, 0.3, { line });
  }
  d.box(x, y, w, h, { fill: "panel", line: null });
  if (fresh) d.box(x, y, w, h, { fill: "primary", ft: 82, line: null });
  d.box(x, y, w, h, { fill: null, line, lw: fresh ? 2.25 : 1.25 });
  d.icon("server", "primary", x + 0.13, y + 0.13, 0.34);
  d.text(multi ? "API instances ×3" : "Backend API", {
    x: x + 0.56,
    y: y + 0.1,
    w: w - 0.62,
    size: 11.5,
    bold: true,
    nowrap: true,
  });
  d.text(multi ? "stateless · same code" : "one deployable", {
    x: x + 0.56,
    y: y + 0.36,
    w: w - 0.62,
    size: 9.5,
    color: "muted",
    nowrap: true,
  });
  ["Catalog", "Cart", "Orders", "Payments"].forEach((m, i) =>
    d.pill(m, x + 0.13 + (i % 2) * 0.92, y + 0.66 + Math.floor(i / 2) * 0.3, 0.86, 0.24, {
      size: 8.5,
      bold: false,
      color: "muted",
      fill: "background",
      line: "border",
    }),
  );
  if (fresh) badge(d, x + w - 0.36, y - (multi ? 0.33 : 0.19));
}
function legend(d: Draw) {
  const x = 10.47;
  d.line(
    [
      [x, 2.08],
      [x + 0.45, 2.08],
    ],
    { color: "foreground", width: 1.75 },
  );
  d.text("request (sync)", {
    x: x + 0.58,
    y: 1.99,
    w: 1.8,
    size: 9.5,
    color: "muted",
    nowrap: true,
  });
  d.line(
    [
      [x, 2.38],
      [x + 0.45, 2.38],
    ],
    { color: "foreground", width: 1.75, dash: true },
  );
  d.text("event / callback (async)", {
    x: x + 0.58,
    y: 2.29,
    w: 1.8,
    size: 9.5,
    color: "muted",
    nowrap: true,
  });
  badge(d, x, 2.58);
  d.text("added in this stage", {
    x: x + 0.58,
    y: 2.6,
    w: 1.8,
    size: 9.5,
    color: "muted",
    nowrap: true,
  });
}
function sideNote(d: Draw, title: string, lines: string[]) {
  d.box(10.45, 3.1, 2.38, 1.62);
  d.text(title, { x: 10.6, y: 3.19, w: 2.1, size: 9.5, mono: true, color: "teal", nowrap: true });
  let y = 3.47;
  for (const line of lines) y += d.text(line, { x: 10.6, y, w: 2.1, size: 10.5 }) + 0.05;
}
function stageDiagram(d: Draw, stage: number, highlight = true, boundary?: string) {
  const fresh = (s: number) => highlight && s === stage;
  if (stage >= 4) {
    d.box(2.68, 1.98, 7.44, 3.97, { fill: null, line: "border", lw: 1.25, dash: true, r: 0.12 });
    d.text(boundary ?? "HOSTING BOUNDARY · cloud, on-premises or hybrid", {
      x: 2.82,
      y: 2.05,
      w: 7,
      size: 9,
      mono: true,
      color: "muted",
      nowrap: true,
    });
  }
  for (const e of EDGES) {
    if (e.from > stage || (e.to ?? 99) < stage) continue;
    const on = fresh(e.from);
    d.line(e.pts, {
      color: on ? "foreground" : "dim",
      width: on ? 2 : 1.5,
      dash: !!e.dash,
      arrow: e.arrow !== false,
    });
    if (e.note)
      d.text(e.note.text, {
        x: e.note.x,
        y: e.note.y,
        w: e.note.w,
        size: 9,
        color: on ? "foreground" : "muted",
        nowrap: true,
        ...(e.note.center ? { align: "center" as const } : {}),
      });
  }
  for (const n of NODES) if (n.stage <= stage) drawNode(d, n, fresh(n.stage));
  drawApi(d, stage, fresh(1) || fresh(4));
}

type Painter = (d: Draw, s: DeckSlide) => void;

const artwork: Painter = (d, s) => {
  if (!s.image) return;
  const w = 10.42;
  const h = (w * 941) / 1672;
  const x = (13.333 - w) / 2;
  d.image(s.image, x, 0.78, w, h);
  d.text(s.subtitle ?? "", {
    x,
    y: 6.69,
    w,
    size: 10,
    color: "muted",
    align: "center",
    nowrap: true,
  });
};

const PAINT: Record<string, Painter> = {
  journey(d, s) {
    const pitch = 2.07;
    const x0 = 1.5;
    d.line(
      [
        [x0, 2.55],
        [x0 + 5 * pitch, 2.55],
      ],
      { color: "border", width: 3, arrow: false },
    );
    s.entries.forEach((e, i) => {
      const cx = x0 + i * pitch;
      const on = i === 3;
      d.ellipse(cx - 0.36, 2.19, 0.72, 0.72, {
        fill: on ? "teal" : "panel2",
        line: on ? "teal" : "primary",
        lw: 2,
      });
      d.text(String(i + 1).padStart(2, "0"), {
        x: cx - 0.36,
        y: 2.19,
        w: 0.72,
        h: 0.72,
        size: 15,
        mono: true,
        color: on ? "background" : "foreground",
        align: "center",
        valign: "middle",
        nowrap: true,
      });
      d.text(e.title, {
        x: cx - 0.95,
        y: 3.1,
        w: 1.9,
        h: 0.6,
        size: 13.5,
        bold: true,
        align: "center",
        color: on ? "teal" : "foreground",
      });
      d.text(e.body, {
        x: cx - 0.95,
        y: 3.78,
        w: 1.9,
        h: 0.7,
        size: 12,
        align: "center",
        color: "muted",
      });
    });
    label(d, "HOW EVERY CASE-STUDY STAGE WORKS", 0.5, 4.85);
    chain(d, 5.25);
  },
  previously(d, s) {
    const rings: [string, string, number, number, number, number, Ink][] = [
      ["ARCHITECTURE", "boundaries · trade-offs · whole systems", 0.5, 1.95, 6.2, 4.0, "teal"],
      ["ENGINEERING", "requirements · quality · tests", 0.85, 2.75, 5.5, 3.0, "primary"],
      ["IMPLEMENTATION", "syntax · APIs · features", 1.2, 3.55, 4.8, 1.95, "muted"],
    ];
    for (const [title, body, x, y, w, h, ink] of rings) {
      d.box(x, y, w, h, { fill: ink, ft: 90, line: ink, lw: 1.5, r: 0.18 });
      d.text(title, {
        x: x + 0.25,
        y: y + 0.16,
        w: w - 0.5,
        size: 12,
        mono: true,
        color: ink,
        nowrap: true,
      });
      d.text(body, { x: x + 0.25, y: y + 0.44, w: w - 0.5, size: 12.5, nowrap: true });
    }
    d.text("AI increasingly covers this layer", {
      x: 1.45,
      y: 4.7,
      w: 4.3,
      size: 12,
      color: "muted",
      nowrap: true,
    });
    const icons = ["bot", "scale", "network"];
    s.entries.forEach((e, i) => {
      const y = 2.05 + i * 1.3;
      d.ellipse(7.2, y, 0.72, 0.72, { fill: "panel2", line: "teal", lw: 1.5 });
      d.icon(icons[i] ?? "target", "teal", 7.38, y + 0.18, 0.36);
      d.text(e.title, { x: 8.15, y, w: 4.68, size: 16, bold: true, nowrap: true });
      d.text(e.body, { x: 8.15, y: y + 0.42, w: 4.68, size: 13, color: "muted", nowrap: true });
    });
    takeaway(d, s.takeaway);
  },
  "developer-journey"(d, s) {
    const lane = (
      y: number,
      title: string,
      sub: string,
      icon: string,
      ink: Ink,
      items: string[],
      ghost: boolean,
    ) => {
      d.box(0.5, y, 12.33, 1.45, { r: 0.12 });
      d.icon(icon, ink, 0.75, y + 0.28, 0.42);
      d.text(title, {
        x: 0.75,
        y: y + 0.82,
        w: 2.3,
        size: 12.5,
        bold: true,
        color: ink,
        nowrap: true,
      });
      d.text(sub, { x: 0.75, y: y + 1.1, w: 2.3, size: 10.5, color: "muted", nowrap: true });
      items.forEach((item, i) => {
        const x = 3.2 + i * 3.25;
        const g = ghost && i === items.length - 1;
        d.box(x, y + 0.35, 2.8, 0.75, {
          fill: g ? "background" : "panel2",
          line: g ? "muted" : ink,
          lw: 1.5,
          dash: g,
        });
        d.text(item, {
          x: x + 0.1,
          y: y + 0.35,
          w: 2.6,
          h: 0.75,
          size: 13,
          bold: !g,
          color: g ? "muted" : "foreground",
          align: "center",
          valign: "middle",
        });
        if (i < items.length - 1)
          d.line(
            [
              [x + 2.85, y + 0.725],
              [x + 3.2, y + 0.725],
            ],
            { color: "muted", width: 2 },
          );
      });
    };
    const [lead, junior] = s.entries;
    lane(
      1.95,
      "Architects & Tech Leads",
      "decide",
      "users",
      "teal",
      lead?.body.split("\n") ?? [],
      false,
    );
    d.line(
      [
        [11.7, 3.05],
        [11.7, 3.58],
        [4.6, 3.58],
        [4.6, 3.95],
      ],
      { color: "muted", width: 2 },
    );
    d.text("tickets", {
      x: 7.6,
      y: 3.33,
      w: 1.2,
      size: 10,
      color: "muted",
      align: "center",
      nowrap: true,
    });
    lane(
      3.65,
      "Junior developers",
      "implement",
      "user",
      "primary",
      junior?.body.split("\n") ?? [],
      true,
    );
    d.box(0.5, 5.4, 12.33, 1.45, { fill: "teal", ft: 88, line: "teal", lw: 1.5, r: 0.12 });
    d.icon("lightbulb", "teal", 0.8, 5.83, 0.55);
    d.text("Now", { x: 1.6, y: 5.56, w: 2, size: 15, bold: true, color: "teal", nowrap: true });
    d.text(s.takeaway ?? "", { x: 1.6, y: 5.93, w: 10.9, h: 0.8, size: 15 });
  },
  "three-boxes"(d) {
    label(d, "CLASSIC 3-TIER", 0.5, 1.96);
    const tiers: [string, string, string, Ink][] = [
      ["Frontend", "Web / mobile UI", "monitor-smartphone", "muted"],
      ["Backend API", "Business logic", "server", "primary"],
      ["Database", "Persistent data", "database", "amber"],
    ];
    tiers.forEach(([title, body, icon, ink], i) => {
      const y = 2.3 + i * 1.08;
      d.box(0.5, y, 3.2, 0.74, { line: ink, lw: 1.75 });
      d.icon(icon, ink, 0.68, y + 0.18, 0.38);
      d.text(title, { x: 1.2, y: y + 0.11, w: 2.4, size: 14, bold: true, nowrap: true });
      d.text(body, { x: 1.2, y: y + 0.42, w: 2.4, size: 11, color: "muted", nowrap: true });
      if (i < 2)
        d.line(
          [
            [2.1, y + 0.76],
            [2.1, y + 1.06],
          ],
          { color: "muted", width: 2 },
        );
    });
    label(d, "SAMPLE E-COMMERCE ERD · PK / FK", 4.15, 1.96);
    const ent = (name: string, fields: string[], c: number, r: number) => ({
      name,
      fields,
      x: 4.15 + c * 2.2,
      y: r ? 4.0 : 2.35,
      w: 1.85,
      h: 1.25,
    });
    const customer = ent("Customer", ["PK customer_id", "email", "name"], 0, 0);
    const cart = ent("Cart", ["PK cart_id", "FK customer_id", "created_at"], 1, 0);
    const cartItem = ent(
      "Cart_Item",
      ["PK cart_item_id", "FK cart_id", "FK product_id", "quantity"],
      2,
      0,
    );
    const product = ent("Product", ["PK product_id", "sku · name", "price"], 3, 0);
    const payment = ent(
      "Payment",
      ["PK payment_id", "FK order_id", "status", "provider_ref"],
      0,
      1,
    );
    const order = ent("Order", ["PK order_id", "FK customer_id", "status · total"], 1, 1);
    const orderItem = ent(
      "Order_Item",
      ["PK order_item_id", "FK order_id", "FK product_id", "unit_price"],
      2,
      1,
    );
    const rel = (pts: Point[]) => d.line(pts, { color: "muted", width: 1.5, arrow: false });
    rel([
      [6.0, 2.975],
      [6.35, 2.975],
    ]);
    rel([
      [8.2, 2.975],
      [8.55, 2.975],
    ]);
    rel([
      [10.4, 2.975],
      [10.75, 2.975],
    ]);
    rel([
      [5.075, 3.6],
      [5.075, 3.8],
      [6.75, 3.8],
      [6.75, 4.0],
    ]);
    rel([
      [8.2, 4.625],
      [8.55, 4.625],
    ]);
    rel([
      [6.35, 4.625],
      [6.0, 4.625],
    ]);
    rel([
      [10.4, 4.625],
      [11.675, 4.625],
      [11.675, 3.6],
    ]);
    for (const e of [customer, cart, cartItem, product, payment, order, orderItem]) {
      d.box(e.x, e.y, e.w, e.h, { line: "amber", lw: 1.25, r: 0.06 });
      d.box(e.x, e.y, e.w, 0.3, { fill: "amber", ft: 78, line: null, r: 0.06 });
      d.text(e.name, {
        x: e.x + 0.1,
        y: e.y,
        w: e.w - 0.2,
        h: 0.3,
        size: 11,
        bold: true,
        valign: "middle",
        nowrap: true,
      });
      e.fields.forEach((field, i) =>
        d.text(field, {
          x: e.x + 0.1,
          y: e.y + 0.38 + i * 0.2,
          w: e.w - 0.15,
          size: 9,
          mono: true,
          nowrap: true,
          color: field.startsWith("PK") ? "amber" : field.startsWith("FK") ? "teal" : "muted",
        }),
      );
    }
    d.text(
      "1:N  Customer > Cart, Order · Cart > Cart_Item · Order > Order_Item, Payment · Product > items",
      { x: 4.15, y: 5.35, w: 8.68, size: 9, mono: true, color: "muted", nowrap: true },
    );
    d.text("…and the rest of a real system?", {
      x: 0.5,
      y: 5.78,
      w: 6,
      size: 14,
      bold: true,
      color: "teal",
      nowrap: true,
    });
    [
      "Load balancing",
      "Caching",
      "CDN",
      "Queues & workers",
      "Integrations",
      "Security",
      "Observability",
      "CI/CD",
    ].forEach((t, i) =>
      d.pill(t, 0.5 + i * 1.56, 6.25, 1.45, 0.48, { size: 10.5, line: "border" }),
    );
  },
  "architecture-vs-design"(d, s) {
    d.ellipse(2.0, 1.95, 5.6, 4.0, { fill: "primary", ft: 80, line: "primary", lw: 2 });
    d.ellipse(5.73, 1.95, 5.6, 4.0, { fill: "teal", ft: 82, line: "teal", lw: 2 });
    const [arch, design] = s.entries;
    d.text("Software Architecture", {
      x: 2.6,
      y: 2.85,
      w: 3.0,
      size: 16,
      bold: true,
      color: "primary",
      nowrap: true,
    });
    bullets(d, arch?.body.split("\n") ?? [], 2.6, 3.4, 3.0, 13);
    d.text("System Design", {
      x: 7.75,
      y: 2.85,
      w: 3.0,
      size: 16,
      bold: true,
      color: "teal",
      nowrap: true,
    });
    bullets(d, design?.body.split("\n") ?? [], 7.75, 3.4, 3.0, 13);
    d.text("Decisions &\ntrade-offs", {
      x: 5.8,
      y: 3.45,
      w: 1.73,
      h: 0.9,
      size: 13.5,
      bold: true,
      align: "center",
      valign: "middle",
      nowrap: true,
    });
    takeaway(d, s.takeaway);
  },
  questions(d, s) {
    const icons = [
      "target",
      "users",
      "list-checks",
      "gauge",
      "database",
      "shield-check",
      "circle-dollar-sign",
      "graduation-cap",
    ];
    s.entries.forEach((e, i) => {
      const x = 0.5 + (i % 2) * 3.62;
      const y = 1.95 + Math.floor(i / 2) * 0.99;
      d.box(x, y, 3.47, 0.86);
      d.icon(icons[i] ?? "target", "teal", x + 0.18, y + 0.24, 0.38);
      d.text(e.title, {
        x: x + 0.72,
        y: y + 0.12,
        w: 2.65,
        size: 13,
        bold: true,
        color: "teal",
        nowrap: true,
      });
      d.text(e.body, { x: x + 0.72, y: y + 0.45, w: 2.65, size: 12.5, nowrap: true });
    });
    d.line(
      [
        [7.72, 3.9],
        [8.8, 3.9],
      ],
      { color: "teal", width: 5 },
    );
    d.box(8.95, 1.95, 3.88, 3.82, { fill: "panel2", line: "teal", lw: 1.5, r: 0.12 });
    d.text("…then decide", {
      x: 9.2,
      y: 2.1,
      w: 3.4,
      size: 16,
      bold: true,
      color: "teal",
      nowrap: true,
    });
    const decisions: [string, string][] = [
      ["blocks", "Components we need"],
      ["database", "Data stores & consistency"],
      ["cloud", "Hosting & deployment"],
      ["gauge", "Scaling approach"],
      ["layout-grid", "Architecture style"],
    ];
    decisions.forEach(([icon, text], i) => {
      const y = 2.68 + i * 0.6;
      d.icon(icon, "foreground", 9.22, y + 0.05, 0.32);
      d.text(text, { x: 9.72, y, w: 3.0, h: 0.42, size: 14, valign: "middle", nowrap: true });
    });
    takeaway(d, s.takeaway);
  },
  "case-study"(d, s) {
    const icons = [
      "store",
      "search",
      "eye",
      "shopping-cart",
      "receipt",
      "credit-card",
      "circle-check",
      "truck",
    ];
    s.entries.forEach((e, i) => {
      const x = 0.5 + i * 1.56;
      const hot = i === 4 || i === 5;
      d.box(x, 2.0, 1.36, 1.7, { line: hot ? "rose" : "border", lw: 1.25 });
      d.icon(icons[i] ?? "target", hot ? "rose" : "teal", x + 0.45, 2.2, 0.46);
      d.text(e.title, {
        x: x + 0.05,
        y: 2.82,
        w: 1.26,
        size: 14,
        bold: true,
        align: "center",
        nowrap: true,
      });
      d.text(e.body, {
        x: x + 0.05,
        y: 3.2,
        w: 1.26,
        h: 0.4,
        size: 10.5,
        color: "muted",
        align: "center",
      });
      if (i < s.entries.length - 1)
        d.line(
          [
            [x + 1.38, 2.85],
            [x + 1.54, 2.85],
          ],
          { color: "muted", width: 1.5 },
        );
    });
    d.text("Ordering and payment (highlighted) are where consistency matters most.", {
      x: 0.5,
      y: 3.88,
      w: 12.3,
      size: 12.5,
      color: "muted",
      nowrap: true,
    });
    label(d, "EVERY STAGE FOLLOWS THE SAME FRAMEWORK", 0.5, 4.45);
    chain(d, 4.85);
    takeaway(d, s.takeaway, 6.05, 0.7);
  },
  "stage-1"(d, s) {
    legend(d);
    stageDiagram(d, 1);
    sideNote(d, "TWO BASIC FLOWS", [
      "Browse: GET /products, then SELECT from products",
      "Order: POST /orders, then INSERT order + items in one transaction",
    ]);
    callouts(d, s.entries);
  },
  "stack-hosting"(d, s) {
    const cols = [0.5, 1.95, 4.8, 7.95];
    const rows = [1.98, 2.4, 3.18, 3.96, 4.74, 5.52];
    d.box(0.5, 1.98, 7.45, 3.54, { r: 0.06 });
    d.box(0.5, 1.98, 7.45, 0.42, { fill: "panel2", line: null, r: 0.06 });
    rows.slice(1, -1).forEach((y) =>
      d.line(
        [
          [0.5, y],
          [7.95, y],
        ],
        { color: "border", width: 1, arrow: false },
      ),
    );
    cols.slice(1, -1).forEach((x) =>
      d.line(
        [
          [x, 1.98],
          [x, 5.52],
        ],
        { color: "border", width: 1, arrow: false },
      ),
    );
    const table = [
      ["LAYER", "EXAMPLE OPTIONS", "DECIDE BY"],
      ["Frontend", "React · Angular · native mobile", "UX needs, team skills, SEO"],
      ["Backend", ".NET · Node.js · Java", "Domain complexity, ecosystem, team"],
      ["Database", "PostgreSQL · SQL Server", "Transactions, access patterns, operations"],
      ["All layers", "Prefer what the team can run", "Maintainability, hiring, support, cost"],
    ];
    table.forEach((row, r) =>
      row.forEach((cell, c) => {
        const x = (cols[c] ?? 0) + 0.12;
        const w = (cols[c + 1] ?? 0) - (cols[c] ?? 0) - 0.24;
        const y = rows[r] ?? 0;
        const h = (rows[r + 1] ?? 0) - y;
        if (!r)
          d.text(cell, {
            x,
            y,
            w,
            h,
            size: 10,
            mono: true,
            color: "teal",
            valign: "middle",
            nowrap: true,
          });
        else
          d.text(cell, {
            x,
            y,
            w,
            h,
            size: 12.5,
            bold: !c,
            color: c === 2 ? "muted" : "foreground",
            valign: "middle",
          });
      }),
    );
    label(d, "WHERE WILL IT RUN?", 8.3, 1.96);
    const hosts: [string, string, string][] = [
      ["building-2", "On-premises", "Full control; you run hardware, patching and capacity."],
      ["cloud", "Cloud", "Managed, elastic services; watch cost and lock-in."],
      ["split", "Hybrid", "Split workloads; networking and operations get harder."],
    ];
    hosts.forEach(([icon, title, body], i) => {
      const y = 2.32 + i * 1.18;
      d.box(8.3, y, 4.53, 1.04);
      d.icon(icon, "teal", 8.5, y + 0.3, 0.44);
      d.text(title, { x: 9.15, y: y + 0.12, w: 3.55, size: 14, bold: true, nowrap: true });
      d.text(body, { x: 9.15, y: y + 0.47, w: 3.55, h: 0.5, size: 12, color: "muted" });
    });
    callouts(d, s.entries);
  },
  "stage-4"(d, s) {
    legend(d);
    stageDiagram(d, 4);
    sideNote(d, "SCALE UP vs. SCALE OUT", [
      "Up: a bigger machine — simple, but it has a ceiling.",
      "Out: more instances — needs stateless APIs.",
    ]);
    callouts(d, s.entries);
  },
  "stage-5"(d, s) {
    const card = (
      x: number,
      icon: string,
      ink: Ink,
      title: string,
      sub: string,
      good: string[],
      watch: string,
    ) => {
      d.box(x, 1.98, 6.0, 2.62, { line: ink, lw: 1.5, r: 0.1 });
      d.icon(icon, ink, x + 0.22, 2.15, 0.46);
      d.text(title, {
        x: x + 0.85,
        y: 2.12,
        w: 5.0,
        size: 16,
        bold: true,
        color: ink,
        nowrap: true,
      });
      d.text(sub, { x: x + 0.85, y: 2.48, w: 5.0, size: 11.5, color: "muted", nowrap: true });
      bullets(d, good, x + 0.3, 2.95, 5.5, 13, 0.05);
      d.text(watch, { x: x + 0.3, y: 4.16, w: 5.5, size: 12.5, color: "amber", nowrap: true });
    };
    card(
      0.5,
      "database",
      "amber",
      "Relational (SQL)",
      "PostgreSQL · SQL Server",
      [
        "ACID transactions: order + items + stock together",
        "Constraints, joins and foreign keys",
        "Reasonable default for checkout and payments",
      ],
      "Scale reads with replicas; writes need more thought.",
    );
    card(
      6.83,
      "boxes",
      "violet",
      "NoSQL",
      "document · key-value · wide-column · search",
      [
        "Specific access patterns: sessions, carts, search",
        "Flexible schema; simple partitioning by key",
        "Use alongside SQL, not as a mandatory replacement",
      ],
      "Not automatically faster or more scalable.",
    );
    label(d, "SCALE THE DATABASE IN STEPS", 0.5, 4.83);
    [
      "Indexes & query tuning",
      "Cache hot reads",
      "Read replicas",
      "Partitioning / sharding",
    ].forEach((t, i) => {
      const x = 0.5 + i * 3.14;
      d.pill(`${i + 1}  ${t}`, x, 5.15, 2.8, 0.62, { size: 12.5, line: "border" });
      if (i < 3)
        d.line(
          [
            [x + 2.83, 5.46],
            [x + 3.11, 5.46],
          ],
          { color: "muted", width: 2 },
        );
    });
    callouts(d, s.entries);
  },
  "stage-6"(d, s) {
    legend(d);
    stageDiagram(d, 6);
    sideNote(d, "CACHE-ASIDE", [
      "1  API checks Redis — hit: return it",
      "2  Miss: read the SQL database",
      "3  Store in Redis with a TTL",
    ]);
    callouts(d, s.entries);
  },
  "stage-7"(d, s) {
    legend(d);
    stageDiagram(d, 7);
    sideNote(d, "TWO REQUEST PATHS", [
      "Static: client, CDN, then object storage on a miss",
      "Dynamic: client, load balancer, API",
    ]);
    callouts(d, s.entries);
  },
  "stage-8"(d, s) {
    legend(d);
    stageDiagram(d, 8);
    sideNote(d, "SYNC vs. ASYNC", [
      "Sync: the caller waits for the result.",
      "Async: publish now; a worker processes later and may retry.",
    ]);
    callouts(d, s.entries);
  },
  "stage-9"(d, s) {
    legend(d);
    stageDiagram(d, 9);
    callouts(d, s.entries);
  },
  "architecture-styles"(d, s) {
    const inks: Ink[] = ["muted", "teal", "violet"];
    const modules: [string, Ink][] = [
      ["Catalog", "amber"],
      ["Orders", "primary"],
      ["Payments", "rose"],
    ];
    s.entries.forEach((e, i) => {
      const x = 0.5 + i * 4.165;
      d.box(x, 1.98, 4.0, 3.98, {
        line: i === 1 ? "teal" : "border",
        lw: i === 1 ? 2 : 1,
        r: 0.12,
      });
      d.text(e.title, {
        x: x + 0.25,
        y: 2.1,
        w: 3.5,
        size: 16,
        bold: true,
        color: inks[i] ?? "teal",
        nowrap: true,
      });
      e.body.split("\n").forEach((line, k) =>
        d.text(line, {
          x: x + 0.25,
          y: 5.08 + k * 0.36,
          w: 3.6,
          size: 12.5,
          color: line.startsWith("−") ? "muted" : "foreground",
          nowrap: true,
        }),
      );
    });
    {
      const x = 0.5;
      d.box(x + 0.4, 2.62, 3.2, 1.35, { fill: "panel2", line: "muted", lw: 1.75 });
      d.text("one deployable", {
        x: x + 0.5,
        y: 2.68,
        w: 3.0,
        size: 9,
        mono: true,
        color: "muted",
        nowrap: true,
      });
      const bars: [number, number, number, Ink][] = [
        [0.6, 2.95, 1.1, "amber"],
        [1.8, 2.95, 1.5, "primary"],
        [0.6, 3.27, 1.6, "rose"],
        [2.3, 3.27, 1.0, "amber"],
        [0.6, 3.59, 0.9, "primary"],
        [1.6, 3.59, 1.7, "rose"],
      ];
      bars.forEach(([bx, by, bw, ink]) =>
        d.box(x + bx, by, bw, 0.22, { fill: ink, ft: 55, line: null, r: 0.04 }),
      );
      d.line(
        [
          [x + 2.0, 3.99],
          [x + 2.0, 4.32],
        ],
        { color: "muted", width: 1.75 },
      );
      mini(d, "Shared database", x + 1.0, 4.34, 2.0, 0.5, "amber");
    }
    {
      const x = 4.665;
      d.box(x + 0.25, 2.62, 3.5, 1.35, { fill: "panel2", line: "teal", lw: 1.75 });
      d.text("one deployable", {
        x: x + 0.35,
        y: 2.68,
        w: 3.0,
        size: 9,
        mono: true,
        color: "muted",
        nowrap: true,
      });
      modules.forEach(([m, ink], k) => {
        d.box(x + 0.37 + k * 1.13, 2.98, 1.03, 0.82, { line: ink, lw: 1.5 });
        d.text(m, {
          x: x + 0.4 + k * 1.13,
          y: 2.98,
          w: 0.97,
          h: 0.82,
          size: 10.5,
          bold: true,
          align: "center",
          valign: "middle",
          nowrap: true,
        });
      });
      d.line(
        [
          [x + 2.0, 3.99],
          [x + 2.0, 4.32],
        ],
        { color: "muted", width: 1.75 },
      );
      mini(d, "one DB · owned schemas", x + 0.62, 4.34, 2.76, 0.5, "amber");
    }
    {
      const x = 8.83;
      d.text("network calls · events", {
        x: x + 0.22,
        y: 2.6,
        w: 3.5,
        size: 9,
        mono: true,
        color: "muted",
        align: "center",
        nowrap: true,
      });
      modules.forEach(([m, ink], k) => {
        const bx = x + 0.22 + k * 1.22;
        mini(d, m, bx, 2.85, 1.08, 0.72, ink);
        d.line(
          [
            [bx + 0.54, 3.59],
            [bx + 0.54, 4.3],
          ],
          { color: "muted", width: 1.5 },
        );
        store(d, bx + 0.24, 4.32, ink);
      });
      d.line(
        [
          [x + 1.3, 3.21],
          [x + 1.44, 3.21],
        ],
        { color: "foreground", width: 1.25, dash: true },
      );
      d.line(
        [
          [x + 2.52, 3.21],
          [x + 2.66, 3.21],
        ],
        { color: "foreground", width: 1.25, dash: true },
      );
      d.text("each service owns its data", {
        x: x + 0.22,
        y: 4.84,
        w: 3.5,
        size: 9,
        mono: true,
        color: "muted",
        align: "center",
        nowrap: true,
      });
    }
    takeaway(d, s.takeaway);
  },
  "code-structure": artwork,
  "reference-architecture": artwork,
  "reference-detail": artwork,
  production(d, s) {
    stageDiagram(
      d,
      9,
      false,
      "PRIVATE NETWORK · least privilege · encrypted in transit and at rest",
    );
    const tag = (text: string, x: number, y: number, w: number) =>
      d.pill(text, x, y, w, 0.26, { fill: "green", color: "background", size: 9 });
    tag("TLS · WAF · rate limiting", 2.78, 3.3, 1.9);
    tag("AuthN · AuthZ", 5.3, 2.84, 1.25);
    tag("Secrets in a vault", 10.75, 3.31, 1.5);
    d.text("SECURITY · RELIABILITY ·\nOBSERVABILITY", {
      x: 10.47,
      y: 2.03,
      w: 2.4,
      size: 9.5,
      mono: true,
      color: "green",
      nowrap: true,
    });
    const inks: Ink[] = ["green", "teal", "violet"];
    const icons = ["shield-check", "refresh-cw", "activity"];
    s.entries.forEach((e, i) => {
      const x = 0.5 + i * 4.165;
      const ink = inks[i] ?? "teal";
      d.box(x, 6.06, 4.0, 0.86, { fill: ink, ft: 88, line: ink, lw: 1.25 });
      d.icon(icons[i] ?? "target", ink, x + 0.15, 6.3, 0.36);
      d.text(e.title.toUpperCase(), {
        x: x + 0.65,
        y: 6.13,
        w: 3.2,
        size: 9.5,
        mono: true,
        color: ink,
        nowrap: true,
      });
      d.text(e.body, { x: x + 0.65, y: 6.36, w: 3.25, h: 0.5, size: 12 });
    });
  },
  deployment(d, s) {
    label(d, "CI/CD PIPELINE", 0.5, 1.96);
    d.text("ENVIRONMENTS · promote the same image", {
      x: 6.77,
      y: 1.96,
      w: 6,
      size: 10.5,
      mono: true,
      color: "teal",
      nowrap: true,
    });
    const steps: [string, string, string][] = [
      ["git-pull-request", "Commit / PR", "code review"],
      ["list-checks", "CI", "build · test · scan"],
      ["container", "Image", "Docker artifact"],
      ["code", "Dev", "integration"],
      ["flask-conical", "Staging", "prod-like checks"],
      ["rocket", "Production", "gradual rollout"],
    ];
    steps.forEach(([icon, title, body], i) => {
      const x = 0.5 + i * 2.09;
      const env = i >= 3;
      d.box(x, 2.25, 1.85, 1.25, {
        fill: env ? "panel2" : "panel",
        line: env ? "teal" : "primary",
        lw: 1.5,
      });
      d.icon(icon, env ? "teal" : "primary", x + 0.16, 2.4, 0.4);
      d.text(title, { x: x + 0.16, y: 2.88, w: 1.6, size: 13.5, bold: true, nowrap: true });
      d.text(body, { x: x + 0.16, y: 3.19, w: 1.6, size: 11, color: "muted", nowrap: true });
      if (i < steps.length - 1)
        d.line(
          [
            [x + 1.87, 2.875],
            [x + 2.07, 2.875],
          ],
          { color: "muted", width: 2 },
        );
    });
    const cards: [string, string, string, Ink][] = [
      [
        "container",
        "Containers — Docker",
        "Package the app and its dependencies into one image that runs the same on a laptop, in CI and in production.",
        "primary",
      ],
      [
        "boxes",
        "Orchestration — Kubernetes",
        "Schedules, scales and restarts containers across many machines. Optional: managed platforms are often enough.",
        "violet",
      ],
    ];
    cards.forEach(([icon, title, body, ink], i) => {
      const x = 0.5 + i * 6.25;
      d.box(x, 3.85, 6.08, 1.95, { line: ink, lw: 1.25, r: 0.1 });
      d.icon(icon, ink, x + 0.25, 4.05, 0.5);
      d.text(title, {
        x: x + 0.95,
        y: 4.1,
        w: 5.0,
        size: 16,
        bold: true,
        color: ink,
        nowrap: true,
      });
      d.text(body, { x: x + 0.95, y: 4.58, w: 4.95, h: 1.1, size: 13.5 });
    });
    callouts(d, s.entries);
  },
  "order-flow"(d, s) {
    const lanes: [string, string, Ink, number][] = [
      ["Customer", "monitor-smartphone", "muted", 1.6],
      ["Storefront API", "server", "primary", 4.1],
      ["Database", "database", "amber", 6.6],
      ["Payment provider", "credit-card", "rose", 9.1],
      ["Broker + workers", "share-2", "violet", 11.6],
    ];
    for (const [title, icon, ink, cx] of lanes) {
      d.line(
        [
          [cx, 2.47],
          [cx, 5.95],
        ],
        { color: "border", width: 1.25, dash: true, arrow: false },
      );
      d.box(cx - 1.08, 1.95, 2.16, 0.5, { line: ink, lw: 1.5 });
      d.icon(icon, ink, cx - 0.98, 2.04, 0.32);
      d.text(title, {
        x: cx - 0.58,
        y: 1.95,
        w: 1.6,
        h: 0.5,
        size: 11.5,
        bold: true,
        valign: "middle",
        nowrap: true,
      });
    }
    const X = { c: 1.6, api: 4.1, db: 6.6, pay: 9.1, mq: 11.6 };
    type Lane = keyof typeof X;
    const messages: [Lane, Lane, string, boolean, boolean][] = [
      ["c", "api", "Checkout + Idempotency-Key", false, false],
      ["api", "db", "PENDING order + reserve stock", false, false],
      ["api", "pay", "Create payment (idempotency key)", false, false],
      ["api", "c", "“Payment pending” / redirect", false, true],
      ["pay", "api", "Signed webhook: succeeded or failed", true, false],
      ["api", "db", "Dedupe · set PAID / FAILED", false, false],
      ["api", "mq", "Publish OrderPaid (via outbox)", true, false],
      ["mq", "mq", "Email + start fulfillment", true, false],
      ["api", "c", "Confirmed, failed or pending", false, true],
    ];
    messages.forEach(([a, b, text, dash, back], i) => {
      const y = 2.82 + i * 0.38;
      const n = String(i + 1);
      if (a === b) {
        d.box(X[a] - 1.05, y - 0.2, 2.1, 0.32, { fill: "violet", ft: 80, line: "violet" });
        d.text(`${n}  ${text}`, {
          x: X[a] - 1.0,
          y: y - 0.2,
          w: 2.0,
          h: 0.32,
          size: 10,
          align: "center",
          valign: "middle",
          nowrap: true,
        });
        return;
      }
      const right = X[b] > X[a];
      d.line(
        [
          [X[a] + (right ? 0.04 : -0.04), y + 0.1],
          [X[b] + (right ? -0.04 : 0.04), y + 0.1],
        ],
        { color: back ? "muted" : "foreground", width: 1.75, dash },
      );
      const left = Math.min(X[a], X[b]) + 0.12;
      d.text(n, {
        x: left,
        y: y - 0.15,
        w: 0.2,
        size: 10,
        mono: true,
        color: "teal",
        nowrap: true,
      });
      d.text(text, {
        x: left + 0.24,
        y: y - 0.15,
        w: Math.abs(X[b] - X[a]) - 0.45,
        size: 10,
        nowrap: true,
      });
    });
    callouts(d, s.entries, ["teal", "violet", "rose"]);
  },
  "same-product"(d, s) {
    const inks: Ink[] = ["muted", "teal", "violet"];
    s.entries.forEach((e, i) => {
      const x = 0.5 + i * 4.165;
      d.box(x, 1.98, 4.0, 3.98, { r: 0.12 });
      d.text(e.title, {
        x: x + 0.25,
        y: 2.08,
        w: 3.5,
        size: 16,
        bold: true,
        color: inks[i] ?? "teal",
        nowrap: true,
      });
      bullets(d, e.body.split("\n"), x + 0.25, 4.84, 3.6, 12.5, 0.03);
    });
    {
      const x = 0.5;
      d.box(x + 0.35, 2.58, 3.3, 2.05, { fill: null, line: "muted", dash: true, r: 0.1 });
      d.text("managed hosting", {
        x: x + 0.45,
        y: 2.64,
        w: 3,
        size: 9,
        mono: true,
        color: "muted",
        nowrap: true,
      });
      mini(d, "Monolith app", x + 0.95, 2.95, 2.1, 0.55, "primary");
      d.line(
        [
          [x + 2.0, 3.52],
          [x + 2.0, 3.88],
        ],
        { color: "muted" },
      );
      mini(d, "SQL database", x + 0.95, 3.9, 2.1, 0.55, "amber");
    }
    {
      const x = 4.665;
      mini(d, "Load balancer", x + 1.0, 2.6, 2.0, 0.45, "teal");
      d.line(
        [
          [x + 2.0, 3.07],
          [x + 2.0, 3.25],
        ],
        { color: "muted" },
      );
      d.box(x + 0.62, 3.21, 2.76, 0.5, { fill: "panel2", line: "primary" });
      mini(d, "Modular monolith ×2", x + 0.5, 3.27, 2.76, 0.5, "primary");
      const stores: [string, Ink, number, number][] = [
        ["SQL", "amber", 0.25, 0.88],
        ["Redis", "amber", 1.25, 0.88],
        ["Queue + worker", "violet", 2.25, 1.5],
      ];
      stores.forEach(([m, ink, bx, bw]) => {
        d.line(
          [
            [x + bx + bw / 2, 3.79],
            [x + bx + bw / 2, 4.06],
          ],
          { color: "muted", width: 1.25 },
        );
        mini(d, m, x + bx, 4.08, bw, 0.45, ink);
      });
    }
    {
      const x = 8.83;
      mini(d, "API gateway", x + 1.0, 2.6, 2.0, 0.42, "teal");
      const services: [string, Ink][] = [
        ["Catalog", "amber"],
        ["Orders", "primary"],
        ["Payments", "rose"],
      ];
      services.forEach(([m, ink], k) => {
        const bx = x + 0.3 + k * 1.15;
        d.line(
          [
            [bx + 0.5, 3.04],
            [bx + 0.5, 3.2],
          ],
          { color: "muted", width: 1.25 },
        );
        mini(d, m, bx, 3.22, 1.0, 0.45, ink);
        d.box(bx + 0.27, 3.75, 0.46, 0.36, { fill: ink, ft: 70, line: ink, r: 0.12 });
      });
      mini(d, "Event bus", x + 0.3, 4.22, 3.3, 0.36, "violet", true);
    }
    takeaway(d, s.takeaway);
  },
  "trade-offs"(d, s) {
    const positions = [0.3, 0.55, 0.35, 0.45];
    s.entries.forEach((e, i) => {
      const y = 2.05 + i * 0.98;
      const [left, right] = e.title.split(" | ");
      d.text(left ?? "", {
        x: 0.5,
        y,
        w: 2.75,
        size: 15,
        bold: true,
        align: "right",
        color: "teal",
        nowrap: true,
      });
      d.text(right ?? "", {
        x: 9.95,
        y,
        w: 2.88,
        size: 15,
        bold: true,
        color: "amber",
        nowrap: true,
      });
      d.box(3.45, y + 0.12, 6.3, 0.1, { fill: "border", line: null, r: 0.05 });
      d.ellipse(3.45 + (positions[i] ?? 0.5) * 6.3 - 0.16, y + 0.01, 0.32, 0.32, {
        fill: "foreground",
        line: "teal",
        lw: 2,
      });
      d.text(e.body, {
        x: 3.45,
        y: y + 0.43,
        w: 6.3,
        h: 0.45,
        size: 12,
        color: "muted",
        align: "center",
      });
    });
    takeaway(d, s.takeaway);
  },
  takeaways(d, s) {
    const icons = ["code", "list-checks", "circle-help", "rocket", "target", "refresh-cw"];
    s.entries.forEach((e, i) => {
      const x = 0.5 + (i % 3) * 4.165;
      const y = 1.98 + Math.floor(i / 3) * 2.08;
      d.box(x, y, 4.0, 1.88, { r: 0.12 });
      d.ellipse(x + 0.25, y + 0.25, 0.66, 0.66, { fill: "panel2", line: "teal", lw: 1.5 });
      d.icon(icons[i] ?? "target", "teal", x + 0.41, y + 0.41, 0.34);
      d.text(e.title, {
        x: x + 1.1,
        y: y + 0.25,
        w: 2.75,
        h: 0.66,
        size: 16,
        bold: true,
        valign: "middle",
        nowrap: true,
      });
      d.text(e.body, { x: x + 0.25, y: y + 1.08, w: 3.55, h: 0.7, size: 13.5, color: "muted" });
    });
  },
  "last-item"(d, s) {
    d.text(s.subtitle ?? "", { x: 0.5, y: 1.92, w: 12.33, h: 0.52, size: 12.5, color: "muted" });
    const shopper = (name: string, y: number) => {
      d.box(0.5, y, 1.75, 0.82, { line: "muted", lw: 1.5 });
      d.icon("user", "muted", 0.64, y + 0.1, 0.32);
      d.text(name, { x: 1.02, y: y + 0.12, w: 1.2, size: 12, bold: true, nowrap: true });
      d.pill("sees “1 left”", 0.64, y + 0.47, 1.48, 0.26, { size: 9.5, color: "amber" });
    };
    shopper("Shopper A", 2.85);
    shopper("Shopper B", 5.6);
    d.box(2.75, 2.65, 3.75, 0.48, { fill: "panel2", line: null, r: 0.24 });
    d.icon("clock", "amber", 2.88, 2.74, 0.3);
    d.text("Both click “Checkout” at the same moment", {
      x: 3.25,
      y: 2.65,
      w: 3.15,
      h: 0.48,
      size: 10.5,
      bold: true,
      valign: "middle",
    });
    d.box(2.75, 3.55, 1.95, 2.35, { line: "amber", lw: 2 });
    d.icon("database", "amber", 2.9, 3.68, 0.38);
    d.text("Inventory", { x: 3.35, y: 3.68, w: 1.3, size: 12.5, bold: true, nowrap: true });
    d.text("primary DB", { x: 3.35, y: 3.95, w: 1.3, size: 10, color: "muted", nowrap: true });
    d.text("available", {
      x: 2.9,
      y: 4.32,
      w: 1.65,
      size: 10.5,
      color: "muted",
      align: "center",
      nowrap: true,
    });
    d.text("1 → 0", {
      x: 2.9,
      y: 4.58,
      w: 1.65,
      size: 20,
      mono: true,
      color: "amber",
      align: "center",
      nowrap: true,
    });
    d.text("conditional update +\nreservation, in one\ntransaction", {
      x: 2.85,
      y: 5.14,
      w: 1.75,
      size: 8.5,
      mono: true,
      color: "muted",
      align: "center",
      nowrap: true,
    });
    d.line(
      [
        [2.25, 3.26],
        [2.5, 3.26],
        [2.5, 4.15],
        [2.75, 4.15],
      ],
      { color: "foreground", width: 1.75 },
    );
    d.line(
      [
        [2.25, 6.01],
        [2.5, 6.01],
        [2.5, 5.3],
        [2.75, 5.3],
      ],
      { color: "foreground", width: 1.75 },
    );
    d.line(
      [
        [4.7, 4.15],
        [4.95, 4.15],
      ],
      { color: "green", width: 2 },
    );
    d.line(
      [
        [4.7, 5.3],
        [4.95, 5.3],
      ],
      { color: "rose", width: 2 },
    );
    const outcome = (y: number, ink: Ink, icon: string, title: string, body: string) => {
      d.box(4.95, y, 1.55, 1.0, { fill: ink, ft: 85, line: ink, lw: 1.5 });
      d.icon(icon, ink, 5.05, y + 0.1, 0.3);
      d.text(title, {
        x: 5.42,
        y: y + 0.13,
        w: 1.03,
        size: 11,
        bold: true,
        color: ink,
        nowrap: true,
      });
      d.text(body, { x: 5.05, y: y + 0.5, w: 1.38, h: 0.45, size: 10 });
    };
    outcome(3.65, "green", "circle-check", "A: reserved", "hold expires in 10 min");
    outcome(4.85, "rose", "circle-x", "B: Sold out", "no row updated");
    s.entries.forEach((e, i) => {
      const y = 2.58 + i * 0.87;
      const on = i === 2;
      d.ellipse(6.85, y + 0.02, 0.42, 0.42, {
        fill: on ? "teal" : "panel2",
        line: "teal",
        lw: 1.5,
      });
      d.text(String(i + 1), {
        x: 6.85,
        y: y + 0.02,
        w: 0.42,
        h: 0.42,
        size: 12,
        mono: true,
        color: on ? "background" : "foreground",
        align: "center",
        valign: "middle",
        nowrap: true,
      });
      d.text(e.title, {
        x: 7.45,
        y,
        w: 5.38,
        size: 13,
        bold: true,
        color: on ? "teal" : "foreground",
        nowrap: true,
      });
      d.text(e.body, { x: 7.45, y: y + 0.3, w: 5.38, h: 0.54, size: 11, color: "muted" });
    });
  },
};

export function ep004PresentationNodes(slide: DeckSlide): Primitive[] {
  const paint = PAINT[slide.id];
  if (slide.layout !== "canvas" || !paint) return slide.nodes;
  const d = new Draw();
  paint(d, slide);
  // Artwork slides give the picture the full canvas: keep only the frame's header and footer.
  const frame = slide.image ? slide.nodes.filter((n) => n.y < 120 || n.y >= 990) : slide.nodes;
  return [...frame, ...d.nodes];
}
