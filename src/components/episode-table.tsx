import { Link } from "@tanstack/react-router";
import { BookOpen, FileDown, FileText, Youtube } from "lucide-react";
import type { Episode } from "@/content/types";
import { formatDate, pad } from "@/content/episodes";
import { Button } from "@/components/ui/button";

export function EpisodeTable({ episodes, onPdf }: { episodes: Episode[]; onPdf: (ep: Episode) => void }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[660px] text-left text-sm">
        <caption className="sr-only">CodeShift episodes, summaries, videos, PDFs and resources</caption>
        <thead className="bg-surface text-xs text-muted-foreground">
          <tr><th scope="col" className="px-4 py-3">Episode</th><th scope="col" className="px-4 py-3">Date</th><th scope="col" className="px-4 py-3">Watch & learn</th></tr>
        </thead>
        <tbody className="divide-y">
          {episodes.map((ep) => (
            <tr key={ep.id} className="bg-card/40 align-top transition-colors hover:bg-surface">
              <td className="max-w-md px-4 py-5">
                <span className="font-mono text-xs text-teal">EP{pad(ep.number)}</span>
                <Link to="/episodes/$slug" params={{ slug: ep.slug }} className="mt-1 block font-semibold leading-relaxed hover:text-primary">{ep.title}</Link>
                <p className="mt-2 text-xs text-muted-foreground">{ep.topics.join(" · ")}</p>
              </td>
              <td className="whitespace-nowrap px-4 py-5 text-xs text-muted-foreground"><time dateTime={ep.scheduledDate}>{formatDate(ep.scheduledDate)}</time></td>
              <td className="px-4 py-5">
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" size="sm"><a href={ep.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch video EP${pad(ep.number)}`}><Youtube /> Video</a></Button>
                  <Button asChild variant="outline" size="sm"><Link to="/episodes/$slug/slides" params={{ slug: ep.slug }} aria-label={`View summary EP${pad(ep.number)}`}><FileText /> Summary</Link></Button>
                  <Button variant="ghost" size="sm" onClick={() => onPdf(ep)} aria-label={`Save PDF EP${pad(ep.number)}`} title="Save as PDF"><FileDown /> PDF</Button>
                  <Button asChild variant="ghost" size="sm"><Link to="/episodes/$slug/slides" params={{ slug: ep.slug }} hash="resources" aria-label={`View resources EP${pad(ep.number)}`}><BookOpen /> Resources</Link></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}