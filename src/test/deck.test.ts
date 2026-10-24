import { describe, expect, it } from 'vitest';
import { EPISODES } from '@/content/episodes';
import { buildDeck, boundedSlide, SLIDE_WIDTH, SLIDE_HEIGHT } from '@/lib/deck-model';

describe('shared presentation rules', () => {
  it('uses a 16:9 1920 by 1080 canvas', () => {
    expect(SLIDE_WIDTH).toBe(1920); expect(SLIDE_HEIGHT).toBe(1080);
    expect(SLIDE_WIDTH / SLIDE_HEIGHT).toBe(16 / 9);
  });
  it('never navigates before first or after last slide', () => {
    expect(boundedSlide(-1, 18)).toBe(0); expect(boundedSlide(18, 18)).toBe(17);
  });
  for (const ep of EPISODES) {
    it(`preserves every resource and unique slide identifier for ${ep.id}`, () => {
      const deck = buildDeck(ep);
      expect(new Set(deck.map(s => s.id)).size).toBe(deck.length);
      const links = deck.flatMap(s => s.nodes.filter(n => n.kind === 'link').map(n => n.url));
      expect(links).toContain(ep.youtubeUrl);
      for (const g of ep.brief?.resourceGroups ?? []) for (const r of g.items) expect(links).toContain(r.url);
      for (const l of ep.brief?.caseStudy?.links ?? []) expect(links).toContain(l.url);
    });
    it(`keeps essential content inside slide boundaries for ${ep.id}`, () => {
      for (const s of buildDeck(ep)) for (const n of s.nodes) {
        expect(n.x).toBeGreaterThanOrEqual(0); expect(n.y).toBeGreaterThanOrEqual(0);
        if (n.kind === 'text') expect(n.y + n.lines.length * n.size * 1.3).toBeLessThanOrEqual(1080);
        else expect(n.y + n.height).toBeLessThanOrEqual(1080);
      }
    });
  }
  it('uses the verified video destinations', () => {
    expect(EPISODES.find(e => e.id === 'ep001')?.youtubeUrl).toBe('https://www.youtube.com/live/bJTXs9y39Lw');
    expect(EPISODES.find(e => e.id === 'ep002')?.youtubeUrl).toBe('https://www.youtube.com/live/CohumEwctE4');
  });
  it('retains the original fundamentals and company adoption frameworks', () => {
    const first = EPISODES.find(e => e.id === 'ep001');
    const second = EPISODES.find(e => e.id === 'ep002');
    expect(first).toBeDefined(); expect(second).toBeDefined();
    if (!first || !second) return;
    const firstText = JSON.stringify(buildDeck(first));
    expect(firstText).toContain('Spot inefficient or incorrect logic.');
    expect(firstText).toContain('Diagnose what generated code actually does.');
    const secondText = JSON.stringify(buildDeck(second));
    expect(secondText).toContain('Pilot with a small team; set guidelines and security rules.');
    expect(secondText).toContain('Standardise workflows and invest in skills.');
  });
});