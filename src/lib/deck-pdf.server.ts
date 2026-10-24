import { PDFDocument, PDFName, PDFString, rgb, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fontData from '@/assets/deck-fonts.json';
import imageData from '@/assets/deck-images.json';
import { buildDeck, SLIDE_HEIGHT, SLIDE_WIDTH, type Ink } from './deck-model';
import type { Episode } from '@/content/types';

/** sRGB equivalents of the canonical --deck-* design tokens. */
const colors: Record<Ink, [number, number, number]> = {
  background: [13, 21, 39], foreground: [241, 245, 250], muted: [170, 186, 209],
  primary: [48, 133, 246], teal: [70, 214, 197], panel: [24, 37, 59], border: [49, 68, 94],
};
const bytes = (value: string) => Uint8Array.from(atob(value), c => c.charCodeAt(0));

export async function generateDeckPdf(ep: Episode): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`CodeShift EP${String(ep.number).padStart(3, '0')} — ${ep.title}`);
  doc.setAuthor('CodeShift');
  const fonts = {
    title: await doc.embedFont(bytes(fontData.title), { subset: true }),
    body: await doc.embedFont(bytes(fontData.body), { subset: true }),
    mono: await doc.embedFont(bytes(fontData.mono), { subset: true }),
  };
  const images = new Map<string, Awaited<ReturnType<typeof doc.embedPng>>>();
  const addLink = (page: PDFPage, x: number, y: number, w: number, h: number, url: string) => {
    const annotation = doc.context.register(doc.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [x, SLIDE_HEIGHT - y - h, x + w, SLIDE_HEIGHT - y], Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) } }));
    const existing = page.node.Annots();
    if (existing) existing.push(annotation); else page.node.set(PDFName.of('Annots'), doc.context.obj([annotation]));
  };
  for (const slide of buildDeck(ep)) {
    const page = doc.addPage([SLIDE_WIDTH, SLIDE_HEIGHT]);
    for (const node of slide.nodes) {
      if (node.kind === 'link') { addLink(page, node.x, node.y, node.width, node.height, node.url); continue; }
      if (node.kind === 'image') {
        let image = images.get(node.src);
        if (!image) {
          const encoded = (imageData as Record<string, string>)[node.src];
          if (encoded) image = await doc.embedPng(bytes(encoded));
          else {
            // Only repository-authored asset destinations, never a caller-provided URL.
            const response = await fetch(new URL(node.src, 'https://codeshift-podcast.lovable.app'), { signal: AbortSignal.timeout(10_000) });
            if (!response.ok) throw new Error('Episode artwork unavailable');
            const data = await response.arrayBuffer();
            image = response.headers.get('content-type')?.includes('jpeg') ? await doc.embedJpg(data) : await doc.embedPng(data);
          }
          images.set(node.src, image);
        }
        const ratio = Math.min(node.width / image.width, node.height / image.height);
        const w = image.width * ratio, h = image.height * ratio;
        page.drawImage(image, { x: node.x + (node.width - w) / 2, y: SLIDE_HEIGHT - node.y - (node.height + h) / 2, width: w, height: h });
        continue;
      }
      const c = colors[node.ink];
      const color = rgb(c[0] / 255, c[1] / 255, c[2] / 255);
      if (node.kind === 'rect') page.drawRectangle({ x: node.x, y: SLIDE_HEIGHT - node.y - node.height, width: node.width, height: node.height, color });
      else node.lines.forEach((line, i) => page.drawText(line, { x: node.x, y: SLIDE_HEIGHT - node.y - node.size * .8 - i * node.size * 1.3, size: node.size, font: fonts[node.font], color }));
    }
  }
  return doc.save();
}