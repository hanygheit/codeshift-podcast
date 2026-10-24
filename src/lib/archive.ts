import { z } from "zod";

export const PAGE_SIZE = 10;
export const HOME_PAGE_SIZE = 5;

export const archiveSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  topic: z.string().optional().catch(undefined),
  audience: z.string().optional().catch(undefined),
  year: z.string().optional().catch(undefined),
  sort: z.enum(["newest", "oldest", "number", "date-desc", "title-asc", "title-desc"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});
export type ArchiveSearch = z.infer<typeof archiveSearchSchema>;

/** Minimal shape shared by editorial episodes and YouTube-discovered recordings. */
export interface Filterable {
  number?: number | null;
  title: string;
  summary: string;
  description: string;
  topics: readonly string[];
  tags: readonly string[];
  scheduledDate: string;
  audienceLevels?: readonly string[];
}

export function filterEpisodes<T extends Filterable>(episodes: T[], s: ArchiveSearch, pageSize = PAGE_SIZE) {
  const q = s.q?.trim().toLowerCase();
  let list = episodes.filter((e) => {
    if (q) {
      const num = e.number != null ? [`ep${String(e.number).padStart(3, "0")}`, `ep${e.number}`, String(e.number)] : [];
      const hay = [...num, e.title, e.summary, e.description, ...e.topics, ...e.tags].join(" ").toLowerCase();
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    if (s.topic && !e.topics.includes(s.topic)) return false;
    if (s.audience && !(e.audienceLevels ?? []).includes(s.audience)) return false;
    if (s.year && !e.scheduledDate.startsWith(s.year)) return false;
    return true;
  });
  const n = (e: T) => e.number ?? -1;
  const sort = s.sort ?? "newest";
  list = [...list].sort((a, b) =>
    sort === "oldest" || sort === "number" ? n(a) - n(b)
    : sort === "date-desc" ? b.scheduledDate.localeCompare(a.scheduledDate)
    : sort === "title-asc" ? a.title.localeCompare(b.title)
    : sort === "title-desc" ? b.title.localeCompare(a.title)
    : n(b) - n(a) || b.scheduledDate.localeCompare(a.scheduledDate),
  );
  const total = list.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, s.page ?? 1), pageCount);
  return { items: list.slice((page - 1) * pageSize, page * pageSize), total, page, pageCount, pageSize };
}
