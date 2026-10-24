import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronLeft, ChevronRight, Search, SearchX, X, Youtube } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EPISODES, formatDate, pad } from "@/content/episodes";
import { filterEpisodes, HOME_PAGE_SIZE, PAGE_SIZE, type ArchiveSearch, type Filterable } from "@/lib/archive";
import { getYoutubeRecordings, type YtRecording } from "@/lib/youtube.functions";
import { Button } from "@/components/ui/button";
import { ExtLink } from "@/components/site";

/** One row in the library: an editorial episode (has slug) or a YouTube recording without a page yet. */
export interface LibraryItem extends Filterable {
  key: string;
  slug?: string;
  thumbnail: string;
  watchUrl: string;
}

const TOPICS = [...new Set(EPISODES.flatMap((e) => e.topics))].sort();
const selectCls = "h-10 rounded-lg border bg-card px-3 text-sm";

const editorial: LibraryItem[] = EPISODES.map((e) => ({
  key: e.id, slug: e.slug, number: e.number, title: e.title, summary: e.summary, description: e.description,
  topics: e.topics, tags: e.tags, audienceLevels: e.audienceLevels, scheduledDate: e.scheduledDate,
  thumbnail: e.thumbnail, watchUrl: e.youtubeUrl,
}));

/** Adds verified YouTube recordings that have no CodeShift page yet (matched by video ID). */
export function mergeLibrary(recordings: YtRecording[]): LibraryItem[] {
  const ids = new Set(EPISODES.map((e) => e.youtubeVideoId));
  const nums = new Set(EPISODES.map((e) => e.number));
  const extra = recordings.filter((r) => !ids.has(r.videoId)).flatMap((r): LibraryItem[] => {
    const m = /\bEP\s?0*(\d{1,4})\b/i.exec(r.title);
    const number = m ? Number(m[1]) : null;
    if (number != null && nums.has(number)) return [];
    return [{ key: r.videoId, number, title: r.title, summary: r.description, description: r.description, topics: [], tags: [],
      scheduledDate: r.publishedAt.slice(0, 10), thumbnail: r.thumbnail, watchUrl: r.url }];
  });
  return [...editorial, ...extra];
}

export function EpisodeRow({ ep }: { ep: LibraryItem }) {
  const label = ep.number != null ? `EP${pad(ep.number)}` : "New";
  return (
    <article className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
      <img src={ep.thumbnail} alt="" loading="lazy" className="hidden aspect-video w-40 shrink-0 rounded-lg border object-cover sm:block" />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-3 font-mono text-xs">
          <span className="font-bold text-teal">{label}</span>
          <time dateTime={ep.scheduledDate} className="text-muted-foreground">{formatDate(ep.scheduledDate)}</time>
        </p>
        <h3 className="mt-1 text-base font-bold leading-snug md:text-lg">{ep.title}</h3>
        {ep.summary && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{ep.summary}</p>}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 sm:w-auto sm:flex-col lg:flex-row">
        <Button asChild size="sm" className="flex-1 bg-gradient-brand sm:flex-none">
          <ExtLink href={ep.watchUrl} aria-label={`Watch ${label} on YouTube`}><Youtube /> Watch Episode</ExtLink>
        </Button>
        {ep.slug && (
          <Button asChild size="sm" variant="outline" className="flex-1 sm:flex-none">
            <Link to="/episodes/$slug" params={{ slug: ep.slug }} aria-label={`${label} summary and resources`}><BookOpen /> Summary & Resources</Link>
          </Button>
        )}
      </div>
    </article>
  );
}

/** Shared episode search/filter/sort/paginate library. URL search params are the source of truth. */
export function EpisodeExplorer({ search: s, onChange, pageSize = PAGE_SIZE }: {
  search: ArchiveSearch;
  onChange: (patch: Partial<ArchiveSearch>, resetPage?: boolean) => void;
  pageSize?: number;
}) {
  const [q, setQ] = useState(s.q ?? "");
  useEffect(() => setQ(s.q ?? ""), [s.q]);
  useEffect(() => { const t = setTimeout(() => { if ((s.q ?? "") !== q) onChange({ q }); }, 250); return () => clearTimeout(t); }, [q]);

  const rec = useQuery({ queryKey: ["yt-recordings"], queryFn: () => getYoutubeRecordings(), staleTime: 30 * 60_000, retry: 1 });
  const all = useMemo(() => mergeLibrary(rec.data?.status === "ok" ? rec.data.items : []), [rec.data]);
  const { items, total, page, pageCount } = filterEpisodes(all, s, pageSize);
  const active = !!(s.q || s.topic || s.audience || s.year || s.sort);
  const clear = () => { setQ(""); onChange({ q: undefined, topic: undefined, audience: undefined, year: undefined, sort: undefined }); };
  const sortValue = s.sort === "number" ? "oldest" : s.sort ?? "newest";

  return (
    <div>
      <div className="flex flex-col gap-2 rounded-xl border bg-surface p-2.5 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="relative min-w-0 flex-1 sm:min-w-64">
          <span className="sr-only">Search episodes</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search episodes by title, topic, or keyword..."
            className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm" />
        </label>
        <select aria-label="Topic" className={selectCls} value={s.topic ?? ""} onChange={(e) => onChange({ topic: e.target.value })}>
          <option value="">All topics</option>{TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select aria-label="Sort episodes" className={selectCls} value={sortValue}
          onChange={(e) => onChange({ sort: e.target.value === "newest" ? undefined : (e.target.value as ArchiveSearch["sort"]) })}>
          <option value="newest">Episode Number — Newest First</option>
          <option value="oldest">Episode Number — Oldest First</option>
          <option value="date-desc">Publication Date — Newest First</option>
          <option value="title-asc">Title A–Z</option>
          {s.sort === "title-desc" && <option value="title-desc">Title Z–A</option>}
        </select>
        {active && <Button variant="ghost" size="sm" onClick={clear}><X /> Clear Filters</Button>}
      </div>
      <p className="mt-4 text-xs text-muted-foreground" aria-live="polite">
        {total === 0 ? "No episodes found" : `Showing ${(page - 1) * pageSize + 1}–${(page - 1) * pageSize + items.length} of ${total} episode${total === 1 ? "" : "s"}`}
      </p>
      {total === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed bg-surface/40 px-6 py-10 text-center">
          <SearchX className="h-9 w-9 text-teal" />
          <p className="mt-3 font-semibold">No episodes match your search</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another keyword, topic, or episode number like EP002.</p>
          <Button onClick={clear} variant="outline" size="sm" className="mt-4">Clear Filters</Button>
        </div>
      ) : (
        <div className="mt-2 divide-y border-y">{items.map((e) => <EpisodeRow key={e.key} ep={e} />)}</div>
      )}
      {pageCount > 1 && (
        <nav aria-label="Episode pagination" className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onChange({ page: page - 1 }, false)}><ChevronLeft /> Previous</Button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <Button key={p} size="sm" variant={p === page ? "default" : "ghost"} aria-current={p === page ? "page" : undefined}
              onClick={() => onChange({ page: p }, false)} className="w-9 font-mono">{p}</Button>
          ))}
          <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => onChange({ page: page + 1 }, false)}>Next <ChevronRight /></Button>
        </nav>
      )}
    </div>
  );
}

export { HOME_PAGE_SIZE };

/** Builds a search updater that drops empty values and resets the page when filters change. */
export function patchSearch(prev: ArchiveSearch, patch: Partial<ArchiveSearch>, resetPage = true): ArchiveSearch {
  const next: Record<string, unknown> = { ...prev, ...patch, ...(resetPage ? { page: undefined } : {}) };
  Object.keys(next).forEach((k) => { if (next[k] === "" || next[k] === undefined) delete next[k]; });
  return next as ArchiveSearch;
}
