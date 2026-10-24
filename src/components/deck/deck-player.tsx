import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, List, Maximize2, Minimize2, X } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Episode } from '@/content/types';
import { formatDate, pad } from '@/content/episodes';
import { boundedSlide } from '@/lib/deck-model';
import { buildDeck, SlideFrame } from './deck-slides';
import { DownloadPdfButton } from './download-pdf';
import { Button } from '@/components/ui/button';

export function Scaled({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const update = () => setScale(el.clientWidth / 1920);
    const observer = new ResizeObserver(update); observer.observe(el); update();
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`relative aspect-video w-full overflow-hidden ${className}`}><div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${scale})`, visibility: scale ? 'visible' : 'hidden' }}>{children}</div></div>;
}

export function DeckPlayer({ ep, slideId }: { ep: Episode; slideId?: string | undefined }) {
  const slides = useMemo(() => buildDeck(ep), [ep]);
  const total = slides.length;
  const found = slides.findIndex(s => s.id === slideId);
  const index = found < 0 ? 0 : found;
  const slide = slides[index];
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [contents, setContents] = useState(false);
  const [query, setQuery] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [nativePending, setNativePending] = useState(false);
  const go = useCallback((n: number) => {
    const next = slides[boundedSlide(n, total)];
    if (!next || next.id === slides[index]?.id) return;
    void navigate({ to: '/episodes/$slug/slides', params: { slug: ep.slug }, search: { slide: next.id }, resetScroll: false });
  }, [slides, total, index, navigate, ep.slug]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target;
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey || (target instanceof Element && target.closest('input,textarea,select,[contenteditable="true"]'))) return;
      if (e.key === 'Escape') { setContents(false); setFallback(false); return; }
      if (contents) return;
      if (e.key === ' ' && target instanceof Element && target.closest('button,a')) return;
      if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); go(index + 1); }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(index - 1); }
      if (e.key === 'Home') { e.preventDefault(); go(0); }
      if (e.key === 'End') { e.preventDefault(); go(total - 1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go, index, total, contents]);
  useEffect(() => {
    const changed = () => { const active = document.fullscreenElement === root.current; setFullscreen(active); setNativePending(false); if (!active) setFallback(false); };
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  useEffect(() => { if (slide) document.title = `${index + 1}/${total} — ${slide.title} · CodeShift EP${pad(ep.number)}`; }, [slide, index, total, ep.number]);
  useEffect(() => {
    if (!fallback) return;
    const old = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = old; };
  }, [fallback]);
  const toggleFullscreen = async () => {
    setContents(false);
    if (fallback) { setFallback(false); return; }
    if (document.fullscreenElement) { await document.exitFullscreen(); return; }
    try {
      if (!root.current?.requestFullscreen) { setFallback(true); return; }
      setNativePending(true); await root.current.requestFullscreen();
    } catch { setFallback(true); setNativePending(false); }
  };
  const immersive = fullscreen || fallback || nativePending;
  if (!slide) return null;
  const resourceIndex = slides.findIndex(s => s.part === 'resources');
  const select = (n: number) => { go(n); setContents(false); };
  return <div ref={root} className={`presentation-shell ${immersive ? 'presentation-immersive' : ''}`}>
    {!immersive && <div className="presentation-toolbar flex items-center gap-2 border-b px-3 md:px-5">
      <Button asChild variant="ghost" size="sm"><Link to="/episodes/$slug" params={{ slug: ep.slug }} title="Back to Episode"><ArrowLeft /><span className="hidden md:inline">Back to Episode</span><span className="sr-only md:hidden">Back to Episode</span></Link></Button>
      <Button variant="ghost" size="sm" onClick={() => setContents(!contents)} aria-expanded={contents}><List /> Contents</Button>
      <span className="ml-auto whitespace-nowrap font-mono text-xs sm:text-sm" aria-live="polite">Slide {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
      <Button variant="ghost" size="icon" onClick={toggleFullscreen} aria-label="Fullscreen" title="Fullscreen"><Maximize2 /></Button>
      <DownloadPdfButton ep={ep} />
    </div>}
    <div className="presentation-stage relative flex min-h-0 flex-1 items-center justify-center"
      onTouchStart={e => { if (e.target instanceof Element && e.target.closest('a,button,input')) { touch.current = null; return; } const t = e.touches[0]; touch.current = t ? { x: t.clientX, y: t.clientY } : null; }}
      onTouchEnd={e => { const start = touch.current; touch.current = null; const end = e.changedTouches[0]; if (!start || !end) return; const dx = end.clientX - start.x, dy = end.clientY - start.y; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1)); }}>
      <div className="presentation-canvas"><Scaled><SlideFrame ep={ep} slide={slide} index={index} total={total} /></Scaled></div>
      <article className="presentation-reading w-full self-start px-5 py-7" aria-label="Slide reading view">
        <p className="eyebrow">{slide.part === 'resources' ? 'Resources & references' : slide.section}</p>
        <h1 className="mt-3 text-2xl font-semibold leading-tight">{slide.title}</h1>
        {slide.image && <img src={slide.image} alt="Episode cover" className="mt-5 w-full rounded-md" />}
        {slide.subtitle && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{slide.subtitle}</p>}
        <div className="mt-6 divide-y">{slide.entries.map((e, n) => <div key={n} className="py-5 first:pt-0">{e.url ? <a href={e.url} target="_blank" rel="noopener noreferrer" className="block min-h-11 text-lg font-semibold text-teal">{e.title} ↗</a> : e.title && <h2 className="text-lg font-semibold">{e.title}</h2>}<p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{e.body}</p>{e.meta && <p className="mt-3 font-mono text-xs text-teal">{e.meta}</p>}</div>)}</div>
        {slide.layout === 'cover' && <><p className="mt-5 text-sm text-muted-foreground">{formatDate(ep.scheduledDate)} · Hany Saad &amp; Ahmed Mamdoh</p><Button asChild className="mt-5"><a href={ep.youtubeUrl} target="_blank" rel="noopener noreferrer">Watch Episode ↗</a></Button></>}
      </article>
      {contents && <aside role="dialog" aria-label="Presentation contents" className="presentation-contents absolute inset-y-0 left-0 z-30 w-full max-w-md overflow-y-auto border-r bg-popover p-4 shadow-glow">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Contents</h2><Button variant="ghost" size="icon" onClick={() => setContents(false)} aria-label="Close contents"><X /></Button></div>
        <div className="mt-3 flex gap-2"><Button variant="secondary" size="sm" onClick={() => select(0)}>Executive Summary</Button>{resourceIndex >= 0 && <Button variant="secondary" size="sm" onClick={() => select(resourceIndex)}><BookOpen /> Resources</Button>}</div>
        <input aria-label="Search slide titles" placeholder="Search contents…" value={query} onChange={e => setQuery(e.target.value)} className="mt-4 h-10 w-full rounded-md border bg-background px-3 text-sm" />
        <ol className="mt-4 space-y-1">{slides.map((s, n) => s.title.toLowerCase().includes(query.toLowerCase()) || s.section.toLowerCase().includes(query.toLowerCase()) ? <li key={s.id}><Button variant={n === index ? 'secondary' : 'ghost'} onClick={() => select(n)} className="h-auto w-full justify-start gap-3 whitespace-normal py-3 text-left"><span className="font-mono text-xs text-teal">{String(n + 1).padStart(2, '0')}</span><span><span className="block text-[10px] uppercase text-muted-foreground">{s.section}</span><span>{s.title}</span></span></Button></li> : null)}</ol>
      </aside>}
    </div>
    <div className="presentation-navigation flex shrink-0 items-center justify-center gap-4 border-t px-4 py-3">
      <Button variant="outline" className="h-11 w-11" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous slide"><ChevronLeft /></Button>
      <input type="range" min={1} max={total} value={index + 1} onChange={e => go(Number(e.target.value) - 1)} aria-label="Slide navigator" className="w-48 accent-primary sm:w-80" />
      <Button variant="outline" className="h-11 w-11" onClick={() => go(index + 1)} disabled={index === total - 1} aria-label="Next slide"><ChevronRight /></Button>
      {immersive && <><span className="font-mono text-xs">{index + 1} / {total}</span><Button variant="ghost" size="icon" onClick={toggleFullscreen} aria-label="Exit fullscreen"><Minimize2 /></Button></>}
    </div>
  </div>;
}

/** Preserved diagnostic export URL; PDFs are generated directly from the model, not this view. */
export function ExportDeck({ ep }: { ep: Episode }) {
  const slides = buildDeck(ep);
  return <div className="deck-export">{slides.map((s, i) => <SlideFrame key={s.id} ep={ep} slide={s} index={i} total={slides.length} />)}</div>;
}
