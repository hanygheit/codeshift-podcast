import { Link } from "@tanstack/react-router";
import type { Episode } from "@/content/types";
import { formatDate, pad } from "@/content/episodes";
import { Tag } from "./site";

export function EpisodeCard({ ep }: { ep: Episode }) {
  return (
    <Link to="/episodes/$slug" params={{ slug: ep.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow">
      <div className="aspect-video overflow-hidden bg-muted">
        <img src={ep.thumbnail} alt={`EP${pad(ep.number)} cover: ${ep.title}`} loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="eyebrow">EP{pad(ep.number)} · {formatDate(ep.scheduledDate)}</p>
        <h3 className="text-lg font-semibold leading-snug">{ep.title}</h3>
        <p className="line-clamp-3 text-sm text-muted-foreground">{ep.summary}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {ep.audienceLevels.map((a) => <Tag key={a}>{a}</Tag>)}
        </div>
      </div>
    </Link>
  );
}
