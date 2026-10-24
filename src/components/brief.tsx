import { ArrowUpRight, CheckCircle2, ExternalLink } from "lucide-react";
import type { Episode } from "@/content/types";
import { BrandMark, ExtLink } from "@/components/site";
import { formatDate, pad } from "@/content/episodes";
import { HOSTS } from "@/content/site";
import { cn } from "@/lib/utils";

const ACCESS_STYLES: Record<string, string> = {
  Free: "border-teal/40 bg-teal/10 text-teal",
  "Free tier": "border-primary/40 bg-primary/10 text-primary",
  Subscription: "border-border bg-muted/60 text-muted-foreground",
};

function ResourceLink({ r }: { r: Episode["brief"] extends infer B ? (B extends { resourceGroups: { items: (infer I)[] }[] } ? I : never) : never }) {
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-background/60 px-3.5 py-2.5 transition-colors hover:border-teal/50 hover:bg-teal/5"
    >
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          {r.ref && (
            <span className="rounded border border-teal/40 bg-teal/10 px-1.5 py-px font-mono text-[10px] font-bold text-teal">{r.ref}</span>
          )}
          <span className="text-sm font-semibold leading-snug text-foreground group-hover:text-teal">{r.title}</span>
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{r.provider}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", ACCESS_STYLES[r.access])}>
          {r.access}
        </span>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-teal" />
      </span>
    </a>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-5">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-teal">{kicker}</p>
      <h2 className="mt-1 font-display text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
    </div>
  );
}

export function BriefView({ ep }: { ep: Episode }) {
  const brief = ep.brief;
  if (!brief) return null;
  const watchLabel = brief.watchLabel ?? "Watch Full Episode";
  // EP001 order: actions before resources. Playbook-style briefs (EP002): resources first, actions as the closing section.
  const actionsFirst = !brief.packages;

  const actionsSection = (
    <section>
      <SectionTitle kicker="Action items" title="What to do next" />
      <div className={cn("grid gap-4 sm:grid-cols-2", brief.actions.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
        {brief.actions.map((a) => (
          <div key={a.role} className="rounded-xl border border-border bg-card/60 p-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal">{a.role}</h3>
            <ul className="mt-3 space-y-2.5">
              {a.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );

  const resourcesSection = (
    <section id="resources">
      <SectionTitle kicker="Learning resources" title="Curated links to keep learning" />
      {brief.resourcesNote && <p className="mb-5 text-sm text-muted-foreground">{brief.resourcesNote}</p>}
      <div className="grid gap-6 md:grid-cols-2">
        {brief.resourceGroups.map((g) => (
          <div key={g.label} className="rounded-xl border border-border bg-card/60 p-5">
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-foreground">{g.label}</h3>
            <div className="space-y-2">
              {g.items.map((r) => (
                <ResourceLink key={r.url} r={r} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <article className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      {/* Header */}
      <header className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <BrandMark className="h-10 w-10" />
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-teal">CodeShift · Executive Brief</p>
            <p className="text-xs text-muted-foreground">Think Beyond the Code</p>
          </div>
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
          <span className="text-teal">EP{pad(ep.number)}</span> — {ep.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatDate(ep.scheduledDate)} · Hosted by {HOSTS.map((h) => h.name).join(" & ")}
        </p>
        <div className="mt-5">
          <ExtLink
            href={ep.youtubeUrl}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {watchLabel} <ArrowUpRight className="h-4 w-4" />
          </ExtLink>
        </div>
      </header>

      {/* Executive summary */}
      <section className="mt-10">
        <SectionTitle kicker="Executive summary" title={brief.summaryHeadline} />
        <div className="space-y-4 rounded-xl border-l-2 border-teal bg-card/60 p-6">
          {brief.summary.map((p) => (
            <p key={p.slice(0, 32)} className="text-sm leading-relaxed text-foreground/90 sm:text-base">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Key lessons */}
      <section className="mt-10">
        <SectionTitle kicker="Key lessons" title="Six things to remember" />
        <div className="grid gap-4 sm:grid-cols-2">
          {brief.lessons.map((l, i) => (
            <div key={l.title} className="rounded-xl border border-border bg-card/60 p-5">
              <p className="font-mono text-xs font-bold text-teal">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-1.5 font-display text-base font-bold text-foreground">{l.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Learning packages */}
      {brief.packages && (
        <section className="mt-10">
          <SectionTitle kicker="The learning playbook" title="Six learning packages" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brief.packages.map((p) => (
              <div key={p.id} className="flex flex-col rounded-xl border border-border bg-card/60 p-5">
                <p className="font-mono text-xs font-bold text-teal">{p.id}</p>
                <h3 className="mt-1.5 font-display text-base font-bold leading-snug text-foreground">{p.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.topics}</p>
                <p className="mt-3 border-t border-border/70 pt-3 text-xs font-medium text-foreground/80">
                  <span className="text-teal">Outcome:</span> {p.outcome}
                </p>
              </div>
            ))}
          </div>
          {brief.packagesNote && <p className="mt-4 text-sm text-muted-foreground">{brief.packagesNote}</p>}
        </section>
      )}

      {/* Career-level priorities */}
      {brief.careerLevels && (
        <section className="mt-10">
          <SectionTitle kicker="Career levels" title="Learning priorities by level" />
          <div className="grid gap-4 sm:grid-cols-2">
            {brief.careerLevels.map((c) => (
              <div key={c.level} className="rounded-xl border border-border bg-card/60 p-5">
                <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal">{c.level}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{c.priorities}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Should juniors use AI? */}
      {brief.juniorAi && (
        <section className="mt-10">
          <SectionTitle kicker="Guidance" title="Should juniors use AI?" />
          <div className="rounded-xl border border-teal/30 bg-teal/5 p-6">
            <p className="font-display text-lg font-bold text-foreground">“{brief.juniorAi.message}”</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {brief.juniorAi.modes.map((m, i) => (
                <span key={m} className="flex items-center gap-2">
                  <span className="rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">{m}</span>
                  {i < brief.juniorAi!.modes.length - 1 && <span className="text-muted-foreground">→</span>}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{brief.juniorAi.emphasis}</p>
          </div>
        </section>
      )}

      {/* 90-day adoption roadmap */}
      {brief.adoption && (
        <section className="mt-10">
          <SectionTitle kicker="For software companies" title="A 90-day AI adoption roadmap" />
          <div className="grid gap-4 sm:grid-cols-3">
            {brief.adoption.phases.map((p) => (
              <div key={p.days} className="rounded-xl border border-border bg-card/60 p-5">
                <p className="font-mono text-xs font-bold text-teal">{p.days}</p>
                <h3 className="mt-1 font-display text-base font-bold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card/60 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Essential metrics</p>
            <div className="flex flex-wrap gap-2">
              {brief.adoption.metrics.map((m) => (
                <span key={m} className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-foreground/80">
                  {m}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-4 border-l-2 border-teal pl-4 font-display text-base font-bold text-foreground">
            “{brief.adoption.highlight}”
          </p>
        </section>
      )}

      {/* Case study */}
      {brief.caseStudy && (
        <section className="mt-10">
          <SectionTitle kicker="Case study" title={brief.caseStudy.headline} />
          <div className="rounded-xl border border-border bg-card/60 p-6">
            <div className="space-y-3">
              {brief.caseStudy.body.map((p) => (
                <p key={p.slice(0, 32)} className="text-sm leading-relaxed text-foreground/90">
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {brief.caseStudy.links.map((l) => (
                <ExtLink
                  key={l.url}
                  href={l.url}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-teal/40 bg-teal/10 px-3.5 py-2 text-xs font-semibold text-teal transition-colors hover:bg-teal/20"
                >
                  {l.label} <ArrowUpRight className="h-3.5 w-3.5" />
                </ExtLink>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mt-10 space-y-10">
        {actionsFirst ? (
          <>
            {actionsSection}
            {resourcesSection}
          </>
        ) : (
          <>
            {resourcesSection}
            {actionsSection}
          </>
        )}
      </div>

      {/* Final message */}
      <footer className="mt-10 rounded-2xl border border-teal/30 bg-teal/5 p-6 text-center sm:p-8">
        <p className="mx-auto max-w-2xl font-display text-lg font-bold leading-snug text-foreground sm:text-xl">
          “{brief.finalMessage}”
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <ExtLink
            href={ep.youtubeUrl}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Watch EP{pad(ep.number)} <ArrowUpRight className="h-4 w-4" />
          </ExtLink>
          {brief.nextEpisode && (
            <ExtLink
              href={brief.nextEpisode.url}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-teal/50 hover:text-teal"
            >
              {brief.nextEpisode.label} <ArrowUpRight className="h-4 w-4" />
            </ExtLink>
          )}
        </div>
      </footer>
    </article>
  );
}

export function printBrief(ep: Episode) {
  const prev = document.title;
  document.title = `EP${pad(ep.number)} — Executive Brief — CodeShift`;
  const restore = () => {
    document.title = prev;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
}
