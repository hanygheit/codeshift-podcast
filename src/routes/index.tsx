import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Youtube, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { EpisodeTable } from "@/components/episode-table";
import { HomeResources } from "@/components/home-resources";
import { Button } from "@/components/ui/button";
import { BriefView, printBrief } from "@/components/brief";
import { PrintDeck, printDeck } from "@/components/slide";
import { flushSync } from "react-dom";
import { ExtLink, HostCard } from "@/components/site";
import { HOSTS, SITE } from "@/content/site";
import { EPISODES } from "@/content/episodes";
import { AUDIENCES, type Episode } from "@/content/types";
import { archiveSearchSchema, filterEpisodes, HOME_PAGE_SIZE, type ArchiveSearch } from "@/lib/archive";
import logoAsset from "@/assets/codeshift-logo.png.asset.json";

export const Route = createFileRoute("/")({
  validateSearch: (s) => archiveSearchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "CodeShift Podcast — Software Engineering in the AI Era" },
      { name: "description", content: SITE.description },
      { property: "og:title", content: "CodeShift Podcast — Think Beyond the Code." },
      { property: "og:description", content: SITE.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "PodcastSeries", name: "CodeShift",
      description: SITE.description, inLanguage: "ar-EG", sameAs: [SITE.facebook, SITE.youtube],
    }) }],
  }),
  component: Home,
});

function Home() {
  const [printEpisode, setPrintEpisode] = useState<Episode | null>(null);
  const savePdf = (ep: Episode) => {
    flushSync(() => setPrintEpisode(ep));
    if (ep.brief) printBrief(ep);
    else printDeck(ep);
  };
  return (
    <>
      <PageShell>
        <section className="border-b bg-surface">
          <div className="mx-auto flex max-w-6xl items-center gap-5 px-5 py-8 sm:gap-8">
            <img src={logoAsset.url} alt="CodeShift logo" className="h-24 w-24 shrink-0 rounded-full sm:h-32 sm:w-32" />
            <div className="min-w-0">
              <p className="eyebrow">Weekly Arabic podcast</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">CodeShift</h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">{SITE.descriptor} · {SITE.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm"><a href="#learning-resources"><BookOpen /> Learning resources</a></Button>
                <Button asChild variant="ghost" size="sm"><ExtLink href={SITE.youtube}><Youtube /> YouTube</ExtLink></Button>
              </div>
            </div>
          </div>
        </section>
        <EpisodeBrowser onPdf={savePdf} />
        <HomeResources />
        <section className="mx-auto max-w-6xl px-5 py-10">
          <p className="eyebrow">Your hosts</p>
          <h2 className="mt-2 text-2xl font-bold">Hany & Ahmed</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">{HOSTS.map((h) => <HostCard key={h.name} host={h} />)}</div>
        </section>
      </PageShell>
      {printEpisode && (printEpisode.brief
        ? <div className="print-deck"><BriefView ep={printEpisode} /></div>
        : <PrintDeck ep={printEpisode} />)}
    </>
  );
}

const TOPICS = [...new Set(EPISODES.flatMap((e) => e.topics))].sort();
const YEARS = [...new Set(EPISODES.map((e) => e.scheduledDate.slice(0, 4)))].sort().reverse();
const selectCls = "rounded-lg border bg-card px-3 py-2 text-sm";

function EpisodeBrowser({ onPdf }: { onPdf: (ep: Episode) => void }) {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const set = (patch: Partial<ArchiveSearch>, resetPage = true) =>
    navigate({ search: (prev) => {
      const next = { ...prev, ...patch, ...(resetPage ? { page: undefined } : {}) };
      Object.keys(next).forEach((k) => { const v = next[k as keyof ArchiveSearch]; if (v === "" || v === undefined) delete next[k as keyof ArchiveSearch]; });
      return next;
    }, replace: true });
  const [q, setQ] = useState(s.q ?? "");
  useEffect(() => setQ(s.q ?? ""), [s.q]);
  useEffect(() => { const t = setTimeout(() => { if ((s.q ?? "") !== q) set({ q }); }, 250); return () => clearTimeout(t); }, [q]);

  const { items, total, page, pageCount, pageSize } = filterEpisodes(EPISODES, s, HOME_PAGE_SIZE);
  const active = !!(s.q || s.topic || s.audience || s.year || s.sort);
  const clear = () => navigate({ search: {} });

  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <p className="eyebrow">Episode library</p>
      <h2 className="mt-2 text-2xl font-bold">Browse episodes</h2>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="relative min-w-48 flex-1">
          <span className="sr-only">Search episodes</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles, topics, tags…"
            className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm" />
        </label>
        <select aria-label="Topic" className={selectCls} value={s.topic ?? ""} onChange={(e) => set({ topic: e.target.value })}>
          <option value="">All topics</option>{TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select aria-label="Audience" className={selectCls} value={s.audience ?? ""} onChange={(e) => set({ audience: e.target.value })}>
          <option value="">All audiences</option>{AUDIENCES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select aria-label="Year" className={selectCls} value={s.year ?? ""} onChange={(e) => set({ year: e.target.value })}>
          <option value="">All years</option>{YEARS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select aria-label="Sort" className={selectCls} value={s.sort ?? "newest"} onChange={(e) => set({ sort: e.target.value === "newest" ? undefined : (e.target.value as ArchiveSearch["sort"]) })}>
          <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="number">Episode number</option>
        </select>
        {active && <Button onClick={clear} variant="ghost" size="sm"><X /> Clear</Button>}
      </div>
      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {total === 0 ? "No episodes found" : `Showing ${(page - 1) * pageSize + 1}–${(page - 1) * pageSize + items.length} of ${total} episode${total === 1 ? "" : "s"}`}
      </p>
      {total === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed p-12 text-center">
          <p className="text-lg font-semibold">Nothing matches those filters.</p>
          <Button onClick={clear} className="mt-4">Reset filters</Button>
        </div>
      ) : (
        <EpisodeTable episodes={items} onPdf={onPdf} />
      )}
      <nav aria-label="Episode pagination" className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">5 per page · Page {page} of {pageCount}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => set({ page: page - 1 }, false)}><ChevronLeft /> Previous</Button>
          <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => set({ page: page + 1 }, false)}>Next <ChevronRight /></Button>
        </div>
      </nav>
    </section>
  );
}
