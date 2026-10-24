// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { EPISODES } from '@/content/episodes';
import { buildDeck } from '@/lib/deck-model';
import { generateDeckPdf } from '@/lib/deck-pdf.server';

describe('real backend PDF output', () => {
  for (const ep of EPISODES) it(`exports exactly one vector page per slide for ${ep.id}`, async () => {
    const bytes = await generateDeckPdf(ep);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
    const document = await PDFDocument.load(bytes);
    const slides = buildDeck(ep);
    expect(document.getPageCount()).toBe(slides.length);
    document.getPages().forEach((page, i) => {
      expect(page.getSize()).toEqual({ width: 1920, height: 1080 });
      expect(page.node.Annots()?.size() ?? 0).toBe(slides[i]?.nodes.filter(n => n.kind === 'link').length);
    });
  }, 30_000);
});