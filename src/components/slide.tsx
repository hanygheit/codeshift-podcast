import { CheckCircle2, ExternalLink } from "lucide-react";
import type { Episode, Slide, SlideBlock } from "@/content/types";
import { getResource } from "@/content/resources";
import { pad } from "@/content/episodes";
import { BrandMark } from "./site";

function Block({ b }: { b: SlideBlock }) {
  switch (b.kind) {
    case "text":
      return <p className="text-[1.2em] leading-relaxed text-muted-foreground">{b.text}</p>;
    case "quote":
      return <blockquote className="border-l-4 border-teal pl-[1em] text-[1.6em] font-display">{b.text}</blockquote>;
    case "bullets":
      return (
        <ul className="space-y-[0.7em]">
          {b.items.map((i) => (
            <li key={i} className="flex gap-[0.7em] text-[1.35em] leading-snug">
              <span className="mt-[0.45em] h-[0.5em] w-[0.5em] shrink-0 rounded-full bg-gradient-brand" />{i}
            </li>
          ))}
        </ul>
      );
    case "cards":
      return (
        <div className="grid gap-[0.8em]" style={{ gridTemplateColumns: `repeat(${Math.min(b.items.length, 4)}, minmax(0,1fr))` }}>
          {b.items.map((c) => (
            <div key={c.title} className="rounded-[0.7em] border bg-surface-raised p-[1em]">
              <p className="font-display text-[1.15em] font-semibold text-teal">{c.title}</p>
              <p className="mt-[0.4em] text-[0.95em] text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      );
    case "compare":
      return (
        <div className="grid grid-cols-2 gap-[1em]">
          {[b.left, b.right].map((col, i) => (
            <div key={col.title} className={`rounded-[0.7em] border p-[1.1em] ${i ? "border-teal/60 bg-accent/50" : "bg-surface-raised"}`}>
              <p className={`font-display text-[1.2em] font-semibold ${i ? "text-teal" : "text-muted-foreground"}`}>{col.title}</p>
              <ul className="mt-[0.6em] space-y-[0.5em] text-[1.05em]">{col.items.map((x) => <li key={x}>— {x}</li>)}</ul>
            </div>
          ))}
        </div>
      );
    case "steps":
      return (
        <ol className="grid gap-[0.8em]" style={{ gridTemplateColumns: `repeat(${b.items.length}, minmax(0,1fr))` }}>
          {b.items.map((s, i) => (
            <li key={s.title} className="relative rounded-[0.7em] border bg-surface-raised p-[1em]">
              <span className="font-mono text-[0.85em] text-teal">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-[0.3em] font-display text-[1.15em] font-semibold">{s.title}</p>
              {s.body && <p className="mt-[0.3em] text-[0.95em] text-muted-foreground">{s.body}</p>}
            </li>
          ))}
        </ol>
      );
    case "checklist":
      return (
        <ul className="grid grid-cols-2 gap-[0.8em]">
          {b.items.map((i) => (
            <li key={i} className="flex gap-[0.6em] rounded-[0.7em] border bg-surface-raised p-[0.9em] text-[1em]">
              <CheckCircle2 className="h-[1.3em] w-[1.3em] shrink-0 text-teal" />{i}
            </li>
          ))}
        </ul>
      );
    case "resources":
      return (
        <div className="grid grid-cols-2 gap-[0.8em]">
          {b.ids.map(getResource).filter(Boolean).map((r) => (
            <a key={r!.id} href={r!.url} target="_blank" rel="noopener noreferrer"
              className="rounded-[0.7em] border bg-surface-raised p-[0.9em] transition hover:border-primary">
              <p className="flex items-center justify-between font-display text-[1.05em] font-semibold">{r!.title}<ExternalLink className="h-[0.9em] w-[0.9em] text-teal" /></p>
              <p className="text-[0.8em] text-teal">{r!.provider}</p>
              <p className="mt-[0.3em] text-[0.85em] text-muted-foreground">{r!.summary}</p>
            </a>
          ))}
        </div>
      );
  }
}

export function SlideView({ ep, slide, index }: { ep: Episode; slide: Slide; index: number }) {
  const total = ep.slides.length;
  const hero = slide.type === "cover" || slide.type === "closing";
  return (
    <div className="slide-canvas relative rounded-xl">
      <div className="slide-inner flex h-full flex-col p-[2.6em]">
        <div className="flex items-center justify-between font-mono text-[0.75em] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="flex items-center gap-[0.6em]"><BrandMark className="h-[1.8em] w-[1.8em]" /> CodeShift · EP{pad(ep.number)}</span>
          <span>{slide.section}</span>
        </div>
        {hero ? (
          <div className="flex flex-1 flex-col justify-center">
            <p className="eyebrow text-[0.9em]!">{slide.type === "cover" ? `Episode ${pad(ep.number)}` : "Thank you"}</p>
            <h2 className={`mt-[0.4em] max-w-[85%] font-bold leading-[1.08] ${slide.type === "closing" ? "text-gradient text-[3.4em]" : "text-[2.9em]"}`}>{slide.title}</h2>
            {slide.subtitle && <p className="mt-[0.8em] text-[1.25em] text-muted-foreground">{slide.subtitle}</p>}
          </div>
        ) : (
          <div className="flex flex-1 flex-col pt-[1.6em]">
            <h2 className="text-[2.1em] font-bold leading-tight">{slide.title}</h2>
            {slide.subtitle && <p className="mt-[0.3em] text-[1.1em] text-muted-foreground">{slide.subtitle}</p>}
            <div className="mt-[1.4em] flex flex-1 flex-col justify-center gap-[1em]">{slide.blocks.map((b, i) => <Block key={i} b={b} />)}</div>
          </div>
        )}
        <div className="flex items-center justify-between pt-[1em] font-mono text-[0.75em] text-muted-foreground">
          <span>Think Beyond the Code.</span>
          <span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-brand" />
    </div>
  );
}

/** All slides, visible only when printing (Save as PDF). */
export function PrintDeck({ ep }: { ep: Episode }) {
  return (
    <div className="print-deck" aria-hidden="true">
      {ep.slides.map((s, i) => <div key={s.id} className="print-page"><SlideView ep={ep} slide={s} index={i} /></div>)}
    </div>
  );
}

export function printDeck(ep: Episode) {
  const prev = document.title;
  document.title = `CodeShift EP${pad(ep.number)} - ${ep.shortTitle} - Reference Slides`;
  const restore = () => { document.title = prev; window.removeEventListener("afterprint", restore); };
  window.addEventListener("afterprint", restore);
  window.print();
}
