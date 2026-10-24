import { z } from "zod";
import type { Episode } from "@/content/types";

export const PAGE_SIZE = 10;

export const archiveSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  topic: z.string().optional().catch(undefined),
  audience: z.string().optional().catch(undefined),
  year: z.string().optional().catch(undefined),
  sort: z.enum(["newest", "oldest", "number"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});
export type ArchiveSearch = z.infer<typeof archiveSearchSchema>;

export function filterEpisodes(episodes: Episode[], s: ArchiveSearch) {
  const q = s.q?.trim().toLowerCase();
  let list = episodes.filter((e) => {
    if (q) {
      const hay = [e.title, e.summary, e.description, ...e.topics, ...e.tags].join(" ").toLowerCase();
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    if (s.topic && !e.topics.includes(s.topic as never)) return false;
    if (s.audience && !e.audienceLevels.includes(s.audience as never)) return false;
    if (s.year && !e.scheduledDate.startsWith(s.year)) return false;
    return true;
  });
  const sort = s.sort ?? "newest";
  list = [...list].sort((a, b) =>
    sort === "number" ? a.number - b.number
    : sort === "oldest" ? a.scheduledDate.localeCompare(b.scheduledDate)
    : b.scheduledDate.localeCompare(a.scheduledDate),
  );
  const total = list.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, s.page ?? 1), pageCount);
  return { items: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total, page, pageCount };
}
