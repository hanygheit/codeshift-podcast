import type { Episode, SlideBlock } from '@/content/types';
import { getResource } from '@/content/resources';
import { formatDate, pad } from '@/content/episodes';
import metrics from './deck-font-metrics.json';
import logo from '@/assets/codeshift-logo.png.asset.json';

export const SLIDE_WIDTH = 1920;
export const SLIDE_HEIGHT = 1080;
export type FontRole = 'title' | 'body' | 'mono';
export type Ink = 'background' | 'foreground' | 'muted' | 'primary' | 'teal' | 'panel' | 'border';
export type Primitive =
  | { kind: 'text'; x: number; y: number; width: number; size: number; font: FontRole; ink: Ink; lines: string[] }
  | { kind: 'rect'; x: number; y: number; width: number; height: number; ink: Ink }
  | { kind: 'image'; x: number; y: number; width: number; height: number; src: string }
  | { kind: 'link'; x: number; y: number; width: number; height: number; url: string; label: string };
export interface DeckEntry { title: string; body: string; url?: string; meta?: string }
export interface DeckSlide { id: string; section: string; part: 'summary' | 'resources'; title: string; entries: DeckEntry[]; subtitle?: string; image?: string; layout?: 'cover' | 'timeline' | 'cards'; nodes: Primitive[] }
const chunks = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

export function wrapText(text: string, width: number, size: number, font: FontRole): string[] {
  const map = metrics[font] as Record<string, number>;
  const measure = (s: string) => Array.from(s).reduce((sum, c) => sum + (map[c] ?? .6) * size, 0);
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (line && measure(next) > width) { lines.push(line); line = word; } else line = next;
    }
    if (line) lines.push(line);
  }
  return lines;
}

function layoutSlide(slide: DeckSlide, ep: Episode, index: number, total: number): Primitive[] {
  const nodes: Primitive[] = [];
  const rect = (x: number, y: number, width: number, height: number, ink: Ink) => nodes.push({ kind: 'rect', x, y, width, height, ink });
  const text = (value: string, x: number, y: number, width: number, size = 34, font: FontRole = 'body', ink: Ink = 'foreground') => {
    const lines = wrapText(value, width, size, font);
    nodes.push({ kind: 'text', x, y, width, size, font, ink, lines });
    return lines.length * size * 1.3;
  };
  rect(0, 0, 1920, 1080, 'background');
  nodes.push({ kind: 'image', x: 72, y: 36, width: 64, height: 64, src: logo.url });
  text(`CodeShift / EP${pad(ep.number)}`, 156, 54, 1000, 24, 'mono', 'muted');
  text(slide.part === 'resources' ? 'PART B / RESOURCES & REFERENCES' : 'PART A / EXECUTIVE SUMMARY', 1240, 54, 608, 20, 'mono', 'teal');
  rect(72, 116, 1776, 2, 'border');
  text(slide.section.toUpperCase(), 72, 154, 1700, 22, 'mono', 'teal');
  if (slide.layout === 'cover') {
    text(slide.title, 72, 250, 1000, 76, 'title');
    text(`${formatDate(ep.scheduledDate)}\nHany Saad & Ahmed Mamdoh`, 72, 690, 1000, 30, 'body', 'muted');
    rect(72, 834, 520, 80, 'primary');
    text('Watch Episode →', 104, 855, 456, 30, 'title');
    nodes.push({ kind: 'link', x: 72, y: 834, width: 520, height: 80, url: ep.youtubeUrl, label: 'Watch Episode' });
    if (slide.image) nodes.push({ kind: 'image', x: 1120, y: 306, width: 728, height: 410, src: slide.image });
  } else {
    const titleHeight = text(slide.title, 72, 205, 1776, 60, 'title');
    let start = 205 + titleHeight + 36;
    if (slide.subtitle) start += text(slide.subtitle, 72, start, 1700, 28, 'body', 'muted') + 28;
    const available = 958 - start;
    if (slide.layout === 'timeline' || slide.layout === 'cards') {
      const width = (1776 - (slide.entries.length - 1) * 28) / Math.max(1, slide.entries.length);
      slide.entries.forEach((entry, i) => {
        const x = 72 + i * (width + 28);
        rect(x, start, width, available, 'panel');
        text(String(i + 1).padStart(2, '0'), x + 30, start + 28, width - 60, 26, 'mono', 'teal');
        const h = text(entry.title, x + 30, start + 90, width - 60, 36, 'title');
        text(entry.body, x + 30, start + 118 + h, width - 60, 32, 'body', 'muted');
      });
    } else {
      const height = (available - (slide.entries.length - 1) * 20) / Math.max(1, slide.entries.length);
      slide.entries.forEach((entry, i) => {
        const y = start + i * (height + 20);
        rect(72, y, 1776, height, 'panel');
        rect(72, y, 5, height, slide.part === 'resources' ? 'primary' : 'teal');
        const h = text(entry.title, 108, y + 24, 1640, 36, 'title', entry.url ? 'teal' : 'foreground');
        if (entry.body) text(entry.body, 108, y + 38 + h, 1640, 32, 'body', 'muted');
        if (entry.meta) text(entry.meta, 108, y + height - 46, 1560, 24, 'mono', 'teal');
        if (entry.url) {
          text('↗', 1770, y + 28, 50, 36, 'body', 'teal');
          nodes.push({ kind: 'link', x: 72, y, width: 1776, height, url: entry.url, label: entry.title });
        }
      });
    }
  }
  text('Think Beyond the Code.', 72, 1012, 1000, 24, 'mono', 'muted');
  text(`${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, 1650, 1012, 190, 24, 'mono', 'muted');
  rect(0, 1074, 1920, 6, 'primary');
  return nodes;
}

/** Pure declarative content and geometry; the SVG and PDF consume these same nodes. */
export function buildDeck(ep: Episode): DeckSlide[] {
  const slides: DeckSlide[] = [];
  const add = (s: Omit<DeckSlide, 'nodes'>) => slides.push({ ...s, nodes: [] });
  const rows = (id: string, section: string, title: string, entries: DeckEntry[], part: DeckSlide['part'] = 'summary', subtitle?: string) => {
    chunks(entries, 3).forEach((group, i) => add({ id: i ? `${id}-${i + 1}` : id, section, title: i ? `${title} · continued` : title, entries: group, part, ...(subtitle ? { subtitle } : {}) }));
  };
  add({ id: 'cover', title: ep.title, section: `Episode ${pad(ep.number)}`, part: 'summary', layout: 'cover', image: ep.thumbnail, entries: [] });
  const b = ep.brief;
  rows('summary', 'Executive summary', b?.summaryHeadline ?? 'Executive summary', (b?.summary ?? ep.overview).map(body => ({ title: '', body })));
  if (b) rows('lessons', 'Key lessons', 'Essential lessons', b.lessons);
  else rows('lessons', 'Key lessons', 'Essential lessons', ep.takeaways.map(title => ({ title, body: '' })));
  if (b?.packages) chunks(b.packages, 3).forEach((group, i) => add({ id: i ? 'packages-2' : 'packages', section: 'Learning packages', title: i ? 'Learning packages · P04–P06' : 'Learning packages · P01–P03', part: 'summary', layout: 'cards', subtitle: b.packagesNote, entries: group.map(p => ({ title: `${p.id} / ${p.name}`, body: `${p.topics}\n${p.outcome}` })) }));
  if (b?.juniorAi) rows('ai-learning', 'AI-assisted learning', 'Should juniors use AI?', [{ title: b.juniorAi.message, body: `${b.juniorAi.modes.join(' → ')}\n${b.juniorAi.emphasis}` }]);
  if (b?.careerLevels) rows('career-levels', 'Career levels', 'Priorities by career level', b.careerLevels.map(c => ({ title: c.level, body: c.priorities })));
  // Preserve the unique original visual frameworks, not the duplicated summary or resource slides.
  const unique = ep.slides.filter(s => s.blocks.some(block => block.kind === 'compare' || block.kind === 'steps') && !/90/.test(s.id));
  unique.forEach(s => s.blocks.forEach((block: SlideBlock, n) => {
    if (block.kind === 'compare') add({ id: s.id, title: s.title, section: s.section, part: 'summary', layout: 'cards', entries: [block.left, block.right].map(c => ({ title: c.title, body: c.items.join('\n') })) });
    if (block.kind === 'steps') chunks(block.items, 3).forEach((group, i) => add({ id: i ? `${s.id}-${n}-${i + 1}` : s.id, title: s.title, section: s.section, part: 'summary', layout: 'timeline', entries: group.map(e => ({ title: e.title, body: e.body ?? '' })) }));
  }));
  if (b?.adoption) {
    add({ id: 'adoption', title: '90-day AI adoption roadmap', section: 'For software companies', part: 'summary', layout: 'timeline', entries: b.adoption.phases.map(p => ({ title: `${p.days} / ${p.title}`, body: p.body })) });
    rows('adoption-measures', 'For software companies', b.adoption.highlight, [{ title: 'Measure engineering outcomes', body: b.adoption.metrics.join(' · ') }]);
  }
  if (b?.caseStudy) rows('case-study', 'WorxForge case study', b.caseStudy.headline, b.caseStudy.body.map(body => ({ title: '', body })));
  if (b) rows('actions', 'Action items', 'Your next practical step', b.actions.map(a => ({ title: a.role, body: a.items.join('\n') })));
  rows('practice', 'Field exercises', 'Put the ideas into practice', ep.actionItems.map((body, i) => ({ title: `Practice ${i + 1}`, body })));
  if (b) rows('closing', 'Final message', 'Think Beyond the Code.', [{ title: b.finalMessage, body: '' }]);
  const seen = new Set<string>();
  b?.resourceGroups.forEach((g, i) => {
    const label = b.packages?.[i] ? `${b.packages[i]?.id} / ${b.packages[i]?.name}` : g.label;
    const entries = g.items.filter(r => { if (seen.has(r.url)) return false; seen.add(r.url); return true; }).map(r => ({ title: `${r.ref ? `${r.ref} / ` : ''}${r.title}`, body: r.provider, meta: r.access, url: r.url }));
    rows(`resources-${i + 1}`, g.label, label, entries, 'resources');
  });
  const refs = ep.resourceIds.flatMap(id => { const r = getResource(id); if (!r || seen.has(r.url)) return []; seen.add(r.url); return [{ title: r.title, body: `${r.provider} — ${r.summary}`, url: r.url, meta: `${r.level} / ${r.resourceType}` }]; });
  if (refs.length) rows('references', 'Supporting references', 'Further reading & references', refs, 'resources');
  if (b?.caseStudy) {
    const links = b.caseStudy.links.filter(l => !seen.has(l.url));
    if (links.length) rows('worxforge-links', 'WorxForge references', 'Explore the original work', links.map(l => ({ title: l.label, body: 'WorxForge', url: l.url })), 'resources');
  }
  if (b?.resourcesNote) rows('resource-note', 'Resources & references', 'Access & learning notes', [{ title: 'Resource access', body: b.resourcesNote }], 'resources');
  slides.forEach((s, i) => { s.nodes = layoutSlide(s, ep, i, slides.length); });
  return slides;
}

export function boundedSlide(index: number, total: number) { return Math.max(0, Math.min(total - 1, index)); }