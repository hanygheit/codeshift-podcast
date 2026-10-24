import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { EpisodeCard } from "@/components/episode-card";
import { EPISODES } from "@/content/episodes";
import { AUDIENCES } from "@/content/types";
import { archiveSearchSchema, filterEpisodes, type ArchiveSearch } from "@/lib/archive";

export const Route = createFileRoute("/episodes/")({
  validateSearch: (s) => archiveSearchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Episode Archive — CodeShift Podcast" },
      { name: "description", content: "Browse every CodeShift episode by topic, audience and year, with notes, slides and resources." },
      { property: "og:title", content: "CodeShift Episode Archive" },
      { property: "og:description", content: "Every CodeShift episode with notes, reference slides and curated resources." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/episodes" }],
  }),
  component: Archive,
});

const TOPICS = [...new Set(EPISODES.flatMap((e) => e.topics))].sort();
const YEARS = [...new Set(EPISODES.map((e) => e.scheduledDate.slice(0, 4)))].sort().reverse();
const selectCls = "rounded-lg border bg-card px-3 py-2 text-sm";

function Archive() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/episodes/" });
  const set = (patch: Partial<ArchiveSearch>, resetPage = true) =>
    navigate({ search: (prev) => {
      const next = { ...prev, ...patch, ...(resetPage ? { page: undefined } : {}) };
      Object.keys(next).forEach((k) => { const v = next[k as keyof ArchiveSearch]; if (v === "" || v === undefined) delete next[k as keyof ArchiveSearch]; });
      return next;
    }, replace: true });
  const [q, setQ] = useState(s.q ?? "");
  useEffect(() => setQ(s.q ?? ""), [s.q]);
  useEffect(() => { const t = setTimeout(() => { if ((s.q ?? "") !== q) set({ q }); }, 250); return () => clearTimeout(t); }, [q]);

  const { items, total, page, pageCount, pageSize } = filterEpisodes(EPISODES, s);
  const active = !!(s.q || s.topic || s.audience || s.year || s.sort);
  const clear = () => navigate({ search: {} });

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="eyebrow">Archive</p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">All episodes</h1>
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border bg-surface p-4 lg:flex-row lg:items-center">
          <label className="relative flex-1">
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
          {active && <button onClick={clear} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /> Clear</button>}
        </div>
        <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
          {total === 0 ? "No episodes found" : `Showing ${(page - 1) * pageSize + 1}–${(page - 1) * pageSize + items.length} of ${total} episode${total === 1 ? "" : "s"}`}
        </p>
        {total === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed p-12 text-center">
            <p className="text-lg font-semibold">Nothing matches those filters.</p>
            <button onClick={clear} className="mt-4 rounded-full bg-gradient-brand px-5 py-2.5 font-semibold text-primary-foreground">Reset filters</button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((e) => <EpisodeCard key={e.id} ep={e} />)}</div>
        )}
        {pageCount > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
            <Link to="/episodes" search={{ ...s, page: page - 1 }} disabled={page === 1} className="rounded-lg border px-3 py-2 text-sm aria-disabled:opacity-40">Previous</Link>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <Link key={n} to="/episodes" search={{ ...s, page: n }} aria-current={n === page ? "page" : undefined}
                className={`rounded-lg border px-3 py-2 text-sm ${n === page ? "bg-gradient-brand text-primary-foreground" : ""}`}>{n}</Link>
            ))}
            <Link to="/episodes" search={{ ...s, page: page + 1 }} disabled={page === pageCount} className="rounded-lg border px-3 py-2 text-sm aria-disabled:opacity-40">Next</Link>
          </nav>
        )}
      </section>
    </PageShell>
  );
}
