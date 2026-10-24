import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronLeft, ChevronRight, Search, SearchX, X, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import type { Episode } from "@/content/types";
import { AUDIENCES } from "@/content/types";
import { EPISODES, formatDate, pad } from "@/content/episodes";
import { filterEpisodes, PAGE_SIZE, type ArchiveSearch } from "@/lib/archive";
import { Button } from "@/components/ui/button";
import { ExtLink } from "@/components/site";

const TOPICS = [...new Set(EPISODES.flatMap((e) => e.topics))].sort();
const YEARS = [...new Set(EPISODES.map((e) => e.scheduledDate.slice(0, 4)))].sort().reverse();
const selectCls = "rounded-lg border bg-card px-3 py-2 text-sm";

export function ExplorerCard({ ep }: { ep: Episode }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-glow">
      <Link to="/episodes/$slug" params={{ slug: ep.slug }} className="relative block aspect-video overflow-hidden bg-muted">
        <img src={ep.thumbnail} alt={`EP${pad(ep.number)} cover: ${ep.title}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 font-mono text-xs font-bold text-teal backdrop-blur">EP{pad(ep.number)}</span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-xs text-muted-foreground"><time dateTime={ep.scheduledDate}>{formatDate(ep.scheduledDate)}</time></p>
        <h3 className="mt-2 text-lg font-bold leading-snug md:text-xl">
          <Link to="/episodes/$slug" params={{ slug: ep.slug }} className="hover:text-primary">{ep.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{ep.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">{ep.topics.slice(0, 3).map((t) => <span key={t} className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>)}</div>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <Button asChild size="sm" className="bg-gradient-brand"><ExtLink href={ep.youtubeUrl}><Youtube /> Watch Episode</ExtLink></Button>
          <Button asChild size="sm" variant="outline"><Link to="/episodes/$slug" params={{ slug: ep.slug }}><BookOpen /> Summary & Resources</Link></Button>
        </div>
      </div>
    </article>
  );
}

/** Shared episode search/sort/paginate UI. The URL search params are the source of truth. */
export function EpisodeExplorer({ search: s, onChange, filters = false }: {
  search: ArchiveSearch;
  onChange: (patch: Partial<ArchiveSearch>, resetPage?: boolean) => void;
  filters?: boolean;
}) {
  const [q, setQ] = useState(s.q ?? "");
  useEffect(() => setQ(s.q ?? ""), [s.q]);
  useEffect(() => { const t = setTimeout(() => { if ((s.q ?? "") !== q) onChange({ q }); }, 250); return () => clearTimeout(t); }, [q]);

  const { items, total, page, pageCount, pageSize } = filterEpisodes(EPISODES, s, PAGE_SIZE);
  const active = !!(s.q || s.topic || s.audience || s.year || s.sort);
  const clear = () => { setQ(""); onChange({ q: undefined, topic: undefined, audience: undefined, year: undefined, sort: undefined }); };

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="relative min-w-0 flex-1 sm:min-w-64">
          <span className="sr-only">Search episodes</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search episodes by title, topic, or keyword..."
            className="w-full rounded-lg border bg-card py-2.5 pl-9 pr-3 text-sm" />
        </label>
        {filters && <>
          <select aria-label="Topic" className={selectCls} value={s.topic ?? ""} onChange={(e) => onChange({ topic: e.target.value })}>
            <option value="">All topics</option>{TOPICS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select aria-label="Audience" className={selectCls} value={s.audience ?? ""} onChange={(e) => onChange({ audience: e.target.value })}>
            <option value="">All audiences</option>{AUDIENCES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select aria-label="Year" className={selectCls} value={s.year ?? ""} onChange={(e) => onChange({ year: e.target.value })}>
            <option value="">All years</option>{YEARS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </>}
        <select aria-label="Sort episodes" className={selectCls} value={s.sort === "number" ? "oldest" : s.sort ?? "newest"}
          onChange={(e) => onChange({ sort: e.target.value === "newest" ? undefined : (e.target.value as ArchiveSearch["sort"]) })}>
          <option value="newest">Episode Number — Newest First</option>
          <option value="oldest">Episode Number — Oldest First</option>
          <option value="title-asc">Title A–Z</option>
          <option value="title-desc">Title Z–A</option>
        </select>
        {active && <Button variant="ghost" size="sm" onClick={clear}><X /> Clear</Button>}
      </div>
      <p className="mt-4 text-xs text-muted-foreground" aria-live="polite">
        {total === 0 ? "No episodes found" : `Showing ${(page - 1) * pageSize + 1}–${(page - 1) * pageSize + items.length} of ${total} episode${total === 1 ? "" : "s"}`}
      </p>
      {total === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed bg-surface/40 px-6 py-12 text-center">
          <SearchX className="h-10 w-10 text-teal" />
          <p className="mt-3 text-lg font-semibold">No episodes match “{s.q ?? "your filters"}”</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another keyword, topic, or episode number like EP002.</p>
          <Button onClick={clear} variant="outline" className="mt-5">Reset search</Button>
        </div>
      ) : (
        <div className="mt-4 grid gap-6 md:grid-cols-2">{items.map((e) => <ExplorerCard key={e.id} ep={e} />)}</div>
      )}
      {pageCount > 1 && (
        <nav aria-label="Episode pagination" className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onChange({ page: page - 1 }, false)}><ChevronLeft /> Previous</Button>
          <span className="px-2 font-mono text-xs text-muted-foreground">Page {page} of {pageCount}</span>
          <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => onChange({ page: page + 1 }, false)}>Next <ChevronRight /></Button>
        </nav>
      )}
    </div>
  );
}

/** Builds a search updater that drops empty values and resets the page when filters change. */
export function patchSearch(prev: ArchiveSearch, patch: Partial<ArchiveSearch>, resetPage = true): ArchiveSearch {
  const next: Record<string, unknown> = { ...prev, ...patch, ...(resetPage ? { page: undefined } : {}) };
  Object.keys(next).forEach((k) => { if (next[k] === "" || next[k] === undefined) delete next[k]; });
  return next as ArchiveSearch;
}
