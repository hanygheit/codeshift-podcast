import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, LayoutGrid, Maximize2, Minimize2, Youtube } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Episode } from "@/content/types";
import { pad } from "@/content/episodes";
import { buildDeck, SlideFrame, type DeckSlide } from "./deck-slides";
import { DownloadPdfButton } from "./download-pdf";

/** Renders 1920×1080 content scaled to the width of its container. */
export function Scaled({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 1920));
    ro.observe(el); setScale(el.clientWidth / 1920);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={`relative aspect-video w-full overflow-hidden ${className}`}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${scale})`, visibility: scale ? "visible" : "hidden" }}>{children}</div>
    </div>
  );
}

const btn = "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-secondary disabled:opacity-60";

export function DeckPlayer({ ep, slideId }: { ep: Episode; slideId?: string | undefined }) {
  const slides = buildDeck(ep);
  const total = slides.length;
  const found = slides.findIndex((s) => s.id === slideId);
  const i = found < 0 ? 0 : found;
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const [thumbs, setThumbs] = useState(true);
  const [fs, setFs] = useState(false);

  const go = useCallback((n: number) => {
    const t = Math.max(0, Math.min(total - 1, n));
    navigate({ to: "/episodes/$slug/slides", params: { slug: ep.slug }, search: { slide: slides[t]!.id }, replace: true });
  }, [total, navigate, ep.slug, slides]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); go(i + 1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(i - 1); }
      else if (e.key === "Home") { e.preventDefault(); go(0); }
      else if (e.key === "End") { e.preventDefault(); go(total - 1); }
      else if (e.key === "Escape" && !document.fullscreenElement) setThumbs(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go, total]);

  useEffect(() => {
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  useEffect(() => { document.title = `${i + 1}/${total} — ${slides[i]!.title} · EP${pad(ep.number)} CodeShift`; }, [i, total, slides, ep.number]);

  const toggleFs = () => (document.fullscreenElement ? document.exitFullscreen() : root.current?.requestFullscreen?.());
  const firstResources = slides.findIndex((s) => s.section === "Resources");

  return (
    <div ref={root} className="flex flex-col bg-background" style={{ minHeight: fs ? "100vh" : "calc(100vh - 4rem)" }}>
      {!fs && (
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-2 px-4 pt-3">
          <Link to="/episodes/$slug" params={{ slug: ep.slug }} className="inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 shrink-0" /> <span className="truncate">EP{pad(ep.number)} · {ep.shortTitle}</span>
          </Link>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setThumbs(!thumbs)} className={`${btn} hidden lg:inline-flex`} aria-pressed={thumbs}><LayoutGrid className="h-4 w-4" /> Slides</button>
            {firstResources >= 0 && <button onClick={() => go(firstResources)} className={btn}><BookOpen className="h-4 w-4" /> Resources</button>}
            <a href={ep.youtubeUrl} target="_blank" rel="noopener noreferrer" className={btn}><Youtube className="h-4 w-4" /> Watch</a>
            <DownloadPdfButton ep={ep} className={btn} />
            <button onClick={toggleFs} className={btn}><Maximize2 className="h-4 w-4" /> Fullscreen</button>
          </div>
        </div>
      )}
      <div className="flex min-h-0 flex-1 gap-4 px-4 py-3">
        {thumbs && !fs && (
          <aside aria-label="Slide thumbnails" className="hidden w-52 shrink-0 space-y-3 overflow-y-auto pr-1 lg:block" style={{ maxHeight: "calc(100vh - 10rem)" }}>
            {slides.map((s, n) => (
              <button key={s.id} onClick={() => go(n)} aria-label={`Slide ${n + 1}: ${s.title}`} aria-current={n === i}
                className={`block w-full overflow-hidden rounded-lg border-2 text-left transition ${n === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}>
                <Scaled><div className="pointer-events-none"><SlideFrame ep={ep} slide={s} index={n} total={total} /></div></Scaled>
                <span className="block truncate bg-surface px-2 py-1 font-mono text-[10px] text-muted-foreground">{String(n + 1).padStart(2, "0")} · {s.title}</span>
              </button>
            ))}
          </aside>
        )}
        <main className="flex min-w-0 flex-1 items-center justify-center"
          onTouchStart={(e) => (touchX.current = e.touches[0]!.clientX)}
          onTouchEnd={(e) => { if (touchX.current === null) return; const dx = e.changedTouches[0]!.clientX - touchX.current; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); touchX.current = null; }}>
          <div className="w-full" style={{ maxWidth: fs ? "calc((100vh - 5rem) * 16 / 9)" : "calc((100vh - 15rem) * 16 / 9)" }}>
            <Scaled className="rounded-xl border shadow-glow">
              <div key={slides[i]!.id} className="animate-in fade-in duration-300"><SlideFrame ep={ep} slide={slides[i]!} index={i} total={total} /></div>
            </Scaled>
          </div>
        </main>
      </div>
      <div className="flex items-center justify-center gap-4 pb-4">
        <button aria-label="Previous slide" onClick={() => go(i - 1)} disabled={i === 0} className="rounded-full border p-3 disabled:opacity-30"><ChevronLeft className="h-5 w-5" /></button>
        <div className="flex w-40 flex-col items-center gap-1.5 sm:w-64">
          <span className="font-mono text-sm" aria-live="polite">{String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-brand transition-all" style={{ width: `${((i + 1) / total) * 100}%` }} /></div>
        </div>
        <button aria-label="Next slide" onClick={() => go(i + 1)} disabled={i === total - 1} className="rounded-full border p-3 disabled:opacity-30"><ChevronRight className="h-5 w-5" /></button>
        {fs && <button aria-label="Exit fullscreen" onClick={toggleFs} className="rounded-full border p-3"><Minimize2 className="h-5 w-5" /></button>}
      </div>
    </div>
  );
}

/** Non-interactive, unscaled render of every slide — loaded by the PDF renderer. */
export function ExportDeck({ ep }: { ep: Episode }) {
  const slides: DeckSlide[] = buildDeck(ep);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const imgs = Array.from(document.images).map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => undefined)));
    Promise.all([document.fonts.ready, ...imgs]).then(() => setReady(true));
  }, []);
  return (
    <div className="deck-export" {...(ready ? { "data-export-ready": "" } : {})}>
      {slides.map((s, n) => <SlideFrame key={s.id} ep={ep} slide={s} index={n} total={slides.length} />)}
    </div>
  );
}
