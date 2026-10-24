import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, FileDown, List, Maximize2, X, Youtube } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { PrintDeck, printDeck, SlideView } from "@/components/slide";
import { BriefView, printBrief } from "@/components/brief";
import { ExtLink } from "@/components/site";
import { getEpisode, pad } from "@/content/episodes";
import type { Episode } from "@/content/types";

export const Route = createFileRoute("/episodes/$slug_/slides")({
  validateSearch: z.object({ slide: z.string().optional().catch(undefined) }),
  loader: ({ params }) => {
    const ep = getEpisode(params.slug);
    if (!ep) throw notFound();
    return { slug: ep.slug };
  },
  head: ({ params, loaderData }) => {
    const ep = loaderData ? getEpisode(loaderData.slug) : undefined;
    if (!ep) return { meta: [{ title: "Slides unavailable — CodeShift" }, { name: "robots", content: "noindex" }] };
    const title = ep.brief ? `EP${pad(ep.number)} Executive Brief — CodeShift` : `EP${pad(ep.number)} Reference Slides — CodeShift`;
    const desc = ep.brief ? `One-page executive brief for “${ep.title}” — summary, key lessons, action items and resources.` : `Interactive reference deck for “${ep.title}”.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/episodes/${params.slug}/slides` }],
    };
  },
  component: Slides,
});

/** Episodes with a brief render one scrollable knowledge sheet — no deck controls. */
function BriefPage({ ep }: { ep: Episode }) {
  const btn = "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-secondary";
  return (
    <div className="min-h-screen bg-background">
      <header className="screen-only sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link to="/episodes/$slug" params={{ slug: ep.slug }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> EP{pad(ep.number)} details
          </Link>
          <div className="flex flex-wrap gap-2">
            <ExtLink href={ep.youtubeUrl} className={btn}><Youtube className="h-4 w-4" /> Watch Full Episode</ExtLink>
            <button onClick={() => printBrief(ep)} className={btn} title="Choose “Save as PDF” in the print dialog"><FileDown className="h-4 w-4" /> Save as PDF</button>
          </div>
        </div>
      </header>
      <main className="px-4 py-10"><BriefView ep={ep} /></main>
    </div>
  );
}

function Slides() {
  const { slug } = Route.useLoaderData();
  const ep = getEpisode(slug)!;
  const { slide } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const found = ep.slides.findIndex((s) => s.id === slide);
  const i = found < 0 ? 0 : found;
  const total = ep.slides.length;
  const [toc, setToc] = useState(false);
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback((n: number) => {
    const t = Math.max(0, Math.min(total - 1, n));
    navigate({ search: { slide: ep.slides[t]!.id }, replace: true });
  }, [ep, total, navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(i + 1); }
      else if (e.key === "ArrowLeft") go(i - 1);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(total - 1);
      else if (e.key === "Escape") { if (toc) setToc(false); else if (!document.fullscreenElement) navigate({ to: "/episodes/$slug", params: { slug: ep.slug } }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go, total, toc, ep.slug, navigate]);

  const fullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : root.current?.requestFullscreen?.());
  const copy = async () => {
    const url = `${window.location.origin}/episodes/${ep.slug}/slides?slide=${ep.slides[i]!.id}`;
    await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800);
  };
  const btn = "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-secondary";

  return (
    <>
      <div ref={root} className="screen-only flex min-h-screen flex-col bg-background">
        <div className="h-1 bg-muted"><div className="h-full bg-gradient-brand transition-all" style={{ width: `${((i + 1) / total) * 100}%` }} /></div>
        <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link to="/episodes/$slug" params={{ slug: ep.slug }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> EP{pad(ep.number)} details
          </Link>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setToc(true)} className={btn}><List className="h-4 w-4" /> Contents</button>
            <button onClick={copy} className={btn}><Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy slide link"}</button>
            <button onClick={() => printDeck(ep)} className={btn} title="Choose “Save as PDF” in the print dialog"><FileDown className="h-4 w-4" /> Save as PDF</button>
            <button onClick={fullscreen} className={btn}><Maximize2 className="h-4 w-4" /> Fullscreen</button>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center px-4 pb-4"
          onTouchStart={(e) => (touchX.current = e.touches[0]!.clientX)}
          onTouchEnd={(e) => { if (touchX.current === null) return; const dx = e.changedTouches[0]!.clientX - touchX.current; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); touchX.current = null; }}>
          <div className="w-full max-w-[min(100%,calc((100vh-9rem)*16/9))]">
            <SlideView ep={ep} slide={ep.slides[i]!} index={i} />
          </div>
        </main>
        <footer className="flex items-center justify-center gap-4 pb-5">
          <button aria-label="Previous slide" onClick={() => go(i - 1)} disabled={i === 0} className="rounded-full border p-3 disabled:opacity-30"><ChevronLeft className="h-5 w-5" /></button>
          <span className="font-mono text-sm" aria-live="polite">{String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          <button aria-label="Next slide" onClick={() => go(i + 1)} disabled={i === total - 1} className="rounded-full border p-3 disabled:opacity-30"><ChevronRight className="h-5 w-5" /></button>
        </footer>
        {toc && (
          <div className="fixed inset-0 z-50 flex justify-end bg-background/70 backdrop-blur-sm" onClick={() => setToc(false)}>
            <aside role="dialog" aria-label="Table of contents" className="h-full w-full max-w-sm overflow-y-auto border-l bg-surface p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between"><h2 className="font-semibold">Contents</h2><button aria-label="Close" onClick={() => setToc(false)}><X className="h-5 w-5" /></button></div>
              <ol className="mt-4 space-y-1">
                {ep.slides.map((s, n) => (
                  <li key={s.id}>
                    <button onClick={() => { go(n); setToc(false); }} className={`flex w-full gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary ${n === i ? "bg-accent" : ""}`}>
                      <span className="font-mono text-teal">{String(n + 1).padStart(2, "0")}</span>
                      <span><span className="block text-xs text-muted-foreground">{s.section}</span>{s.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        )}
      </div>
      <PrintDeck ep={ep} />
    </>
  );
}
