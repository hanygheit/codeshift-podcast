import { describe, expect, it } from 'vitest';
import { EPISODES } from '@/content/episodes';
import { buildDeck, boundedSlide, slideIndex, SLIDE_WIDTH, SLIDE_HEIGHT } from '@/lib/deck-model';
import { getResource } from '@/content/resources';

describe('shared presentation rules', () => {
  it('adds EP003 with the specified date, recording and thirteen slides', () => {
    const ep = EPISODES.find(e => e.id === 'ep003');
    if (!ep) throw new Error('EP003 missing');
    expect(ep.slug).toBe('ep003');
    expect(ep.scheduledDate).toBe('2026-10-31');
    expect(ep.youtubeUrl).toBe('https://youtube.com/live/u114p0sd86I');
    expect(buildDeck(ep)).toHaveLength(13);
    expect(buildDeck(ep).filter(s => s.part === 'resources')).toHaveLength(2);
  });
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
      for (const id of ep.resourceIds) { const resource = getResource(id); if (resource) expect(links).toContain(resource.url); }
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
  it('keeps EP001 within 7–9 slides and EP002 within 14–16 slides', () => {
    const first = EPISODES.find(e => e.id === 'ep001');
    const second = EPISODES.find(e => e.id === 'ep002');
    if (!first || !second) throw new Error('Required episodes missing');
    expect(buildDeck(first).length).toBeGreaterThanOrEqual(7);
    expect(buildDeck(first).length).toBeLessThanOrEqual(9);
    expect(buildDeck(second).length).toBeGreaterThanOrEqual(14);
    expect(buildDeck(second).length).toBeLessThanOrEqual(16);
  });
  it('provides exactly one complete resource slide per EP002 package, including optional P06', () => {
    const ep = EPISODES.find(e => e.id === 'ep002');
    if (!ep) throw new Error('Required episode missing');
    const deck = buildDeck(ep);
    for (let i = 0; i < 6; i++) {
      const id = `P0${i + 1}`;
      const matches = deck.filter(s => s.part === 'resources' && s.packageId === id);
      expect(matches).toHaveLength(1);
      for (const resource of ep.brief?.resourceGroups[i]?.items ?? []) expect(matches[0]?.entries.map(e => e.url)).toContain(resource.url);
    }
    expect(deck.find(s => s.packageId === 'P06')?.title).toContain('Optional');
    for (let i = 1; i <= 14; i++) expect(deck.flatMap(s => s.entries).some(e => e.title.startsWith(`R${i} / `))).toBe(true);
  });
  it('maps removed fragmented resource links to the consolidated package', () => {
    const ep = EPISODES.find(e => e.id === 'ep002');
    if (!ep) throw new Error('Required episode missing');
    const deck = buildDeck(ep);
    expect(deck[slideIndex(deck, 'resources-3-4')]?.packageId).toBe('P03');
    expect(deck[slideIndex(deck, 'playbook-90')]?.id).toBe('adoption');
    expect(deck[slideIndex(deck, 'lessons')]?.id).toBe('lessons');
  });
});