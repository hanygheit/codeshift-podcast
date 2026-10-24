import { CheckCircle2, ExternalLink, Youtube } from "lucide-react";
import type { BriefResource, Episode } from "@/content/types";
import { formatDate, pad } from "@/content/episodes";
import { SITE } from "@/content/site";
import { BrandMark, ExtLink } from "./site";

const accessStyles: Record<BriefResource["access"], string> = {
  Free: "border-teal/50 text-teal",
  "Free tier": "border-primary/50 text-primary",
  Subscription: "border-muted-foreground/50 text-muted-foreground",
};

function ResourceLink({ r }: { r: BriefResource }) {
  return (
    <li>
      <a href={r.url} target="_blank" rel="noopener noreferrer"
        className="group flex items-start justify-between gap-3 rounded-xl border bg-surface-raised p-4 transition hover:border-primary">
        <span>
          <span className="flex items-center gap-2 font-semibold leading-snug">
            {r.title}
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-teal" />
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">{r.provider}</span>
        </span>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${accessStyles[r.access]}`}>
          {r.access}
        </span>
      </a>
    </li>
  );
}

/** The single scrollable executive brief for an episode (screen + print). */
export function BriefView({ ep }: { ep: Episode }) {
  const brief = ep.brief!;
  return (
    <article className="mx-auto w-full max-w-4xl">
      {/* Section A — header */}
      <header className="relative overflow-hidden rounded-3xl border bg-hero p-8 md:p-12">
        <div className="grid-lines absolute inset-0 opacity-30" />
        <div className="relative">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <BrandMark className="h-6 w-6" /> CodeShift · {SITE.descriptor}
          </p>
          <p className="mt-6 font-mono text-sm text-teal">EP{pad(ep.number)} · {formatDate(ep.scheduledDate)} · Hosted by Hany Saad &amp; Ahmed Mamdoh</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-5xl">{ep.title}</h1>
          <p className="mt-3 text-muted-foreground">The 2–3 minute brief for anyone who missed the live discussion.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ExtLink href={ep.youtubeUrl} className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 font-semibold text-primary-foreground shadow-glow">
              <Youtube className="h-4 w-4" /> Watch Full Episode
            </ExtLink>
          </div>
        </div>
      </header>

      {/* Section B — executive summary */}
      <section className="mt-10 rounded-3xl border border-primary/40 bg-accent/40 p-8 md:p-10">
        <p className="eyebrow">Executive summary</p>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">{brief.summaryHeadline}</h2>
        <div className="mt-5 space-y-4 text-lg leading-relaxed text-muted-foreground">
          {brief.summary.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </section>

      {/* Section C — six key lessons */}
      <section className="mt-12">
        <p className="eyebrow">Key lessons</p>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">Six things to take away</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {brief.lessons.map((l, i) => (
            <div key={l.title} className="rounded-2xl border bg-card p-6">
              <span className="font-mono text-sm text-teal">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-display text-lg font-semibold leading-snug">{l.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section D — action items */}
      <section className="mt-12">
        <p className="eyebrow">Action items</p>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">What to do next, by role</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {brief.actions.map((g) => (
            <div key={g.role} className="rounded-2xl border bg-card p-6">
              <h3 className="font-display font-semibold text-teal">{g.role}</h3>
              <ul className="mt-4 space-y-3">
                {g.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-snug">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" />{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Section E — learning resources */}
      <section className="mt-12">
        <p className="eyebrow">Learning resources</p>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">Curated links to go deeper</h2>
        <p className="mt-2 text-sm text-muted-foreground">Badges mark free material versus tools that may need a subscription or have usage limits.</p>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {brief.resourceGroups.map((g) => (
            <div key={g.label}>
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-teal">{g.label}</h3>
              <ul className="mt-3 space-y-3">{g.items.map((r) => <ResourceLink key={r.url} r={r} />)}</ul>
            </div>
          ))}
        </div>
      </section>

      {/* Section F — final message */}
      <footer className="mt-12 rounded-3xl border bg-hero p-8 text-center md:p-12">
        <blockquote className="mx-auto max-w-2xl font-display text-xl font-bold leading-snug text-gradient md:text-2xl">
          “{brief.finalMessage}”
        </blockquote>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ExtLink href={ep.youtubeUrl} className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 font-semibold text-primary-foreground">
            <Youtube className="h-4 w-4" /> Watch the full EP{pad(ep.number)} discussion
          </ExtLink>
          {brief.nextEpisode && (
            <ExtLink href={brief.nextEpisode.url} className="inline-flex items-center gap-2 rounded-full border px-6 py-3 font-semibold hover:bg-secondary">
              <Youtube className="h-4 w-4" /> {brief.nextEpisode.label}
            </ExtLink>
          )}
        </div>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">CodeShift · {SITE.tagline}</p>
      </footer>
    </article>
  );
}

export function printBrief(ep: Episode) {
  const prev = document.title;
  document.title = `CodeShift EP${pad(ep.number)} - ${ep.shortTitle} - Executive Brief`;
  const restore = () => { document.title = prev; window.removeEventListener("afterprint", restore); };
  window.addEventListener("afterprint", restore);
  window.print();
}
