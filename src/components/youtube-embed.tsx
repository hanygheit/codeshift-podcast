import { Play } from "lucide-react";
import { useState } from "react";

/** Privacy-conscious: loads youtube-nocookie only after the visitor clicks. */
export function YouTubeEmbed({ id, title, thumbnail }: { id: string; title: string; thumbnail: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border bg-muted">
      {on ? (
        <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title} allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
      ) : (
        <button onClick={() => setOn(true)} className="group absolute inset-0" aria-label={`Play video: ${title}`}>
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
          <span className="absolute inset-0 grid place-items-center bg-background/30 transition group-hover:bg-background/10">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-brand shadow-glow"><Play className="h-8 w-8 fill-current text-primary-foreground" /></span>
          </span>
        </button>
      )}
    </div>
  );
}
