import { mkdir, writeFile } from "node:fs/promises";
import QRCode from "qrcode";

const url = "https://codeshift-podcast.lovable.app/poll";
const matrix = QRCode.create(url, { errorCorrectionLevel: "H" }).modules;
const quietZone = 4;
const side = matrix.size + quietZone * 2;
const rows = Array.from({ length: side }, (_, y) =>
  Array.from({ length: side }, (_, x) => {
    const row = y - quietZone;
    const column = x - quietZone;
    return row >= 0 &&
      row < matrix.size &&
      column >= 0 &&
      column < matrix.size &&
      matrix.get(row, column)
      ? "1"
      : "0";
  }).join(""),
);
const svg = await QRCode.toString(url, {
  type: "svg",
  errorCorrectionLevel: "H",
  margin: quietZone,
  width: 900,
  color: { dark: "#0d1527", light: "#ffffff" },
});

await mkdir("public", { recursive: true });
await mkdir("src/assets", { recursive: true });
await writeFile("public/poll-qr.svg", svg);
await writeFile("src/assets/live-poll-qr.json", `${JSON.stringify({ url, rows }, null, 2)}\n`);
