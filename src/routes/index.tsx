import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Linkedin, Youtube } from "lucide-react";
import { EpisodeExplorer, patchSearch } from "@/components/episode-explorer";
import { UpcomingEpisode } from "@/components/upcoming-episode";
import { archiveSearchSchema } from "@/lib/archive";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { ExtLink, HostCard, Tag } from "@/components/site";
import { HOSTS, SITE, TOPICS_EXPLORED } from "@/content/site";

export const Route = createFileRoute("/")({
  validateSearch: (s) => archiveSearchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "CodeShift Podcast — Software Engineering in the AI Era" },
      { name: "description", content: SITE.description },
      { property: "og:title", content: "CodeShift Podcast — Think Beyond the Code." },
      { property: "og:description", content: SITE.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "PodcastSeries", name: "CodeShift",
      description: SITE.description, inLanguage: "ar-EG", sameAs: [SITE.facebook, SITE.youtube],
    }) }],
  }),
  component: Home,
});

function Home() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0 bg-hero" />
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-40" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 md:grid-cols-2 md:py-12 lg:gap-14">
          <div>
            <p className="eyebrow">Weekly Arabic Tech Podcast</p>
            <h1 className="mt-4 max-w-xl text-3xl font-bold leading-[1.18] sm:text-4xl lg:text-5xl">
              Software Engineering <span className="text-teal">in the AI Era.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground lg:text-lg">
              Practical conversations on engineering fundamentals, software architecture, coding agents, developer growth, and the changing way we build software.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 bg-gradient-brand px-6"><Link to="/episodes">Explore Episodes <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6"><ExtLink href={SITE.youtube}><Youtube /> Watch on YouTube</ExtLink></Button>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
              <span className="h-px w-10 bg-primary" /> {SITE.tagline}
            </div>
          </div>

          <figure className="relative">
            <div className="relative overflow-hidden rounded-2xl border bg-card shadow-glow">
              <div className="grid grid-cols-2">
                {HOSTS.map((h, i) => (
                  <div key={h.name} className={`relative aspect-[4/5] overflow-hidden ${i === 0 ? "border-r" : ""}`}>
                    <img src={h.photo} alt={`${h.name}, CodeShift co-host`} className="h-full w-full object-cover object-top" loading="eager" />
                  </div>
                ))}
              </div>
              <div className="h-14 sm:hidden" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-0 bg-portrait-overlay" />
              <div className="absolute left-4 top-4 rounded-full border bg-background/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-teal backdrop-blur">
                Your hosts
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 grid grid-cols-2">
                {HOSTS.map((h, i) => (
                  <div key={h.name} className="min-w-0 px-3 pb-4 sm:px-5 sm:pb-5">
                    <Waveform offset={i} />
                    <a href={h.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${h.name} on LinkedIn (opens in a new tab)`} className="mt-3 block w-fit font-display text-sm font-semibold text-foreground transition-colors hover:text-teal sm:text-base lg:text-lg">{h.name}</a>
                    <p className="mt-1 text-[11px] font-medium leading-snug text-foreground/85 sm:text-xs">{h.heroTitle}</p>
                    <a href={h.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`View ${h.name}'s LinkedIn profile (opens in a new tab)`} className="mt-2 inline-flex min-h-8 items-center gap-1.5 text-[11px] font-semibold text-teal hover:underline sm:text-xs">
                      <Linkedin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> LinkedIn Profile <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                    </a>
                  </div>
                ))}
              </figcaption>
            </div>
          </figure>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      </section>

      <UpcomingEpisode />

      <section id="explore" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="eyebrow">Episode library</p><h2 className="mt-2 text-2xl font-bold">Explore Episodes</h2></div>
          <Link to="/episodes" className="text-sm font-semibold text-primary hover:underline">View All Episodes →</Link>
        </div>
        <EpisodeExplorer pageSize={5} search={s} onChange={(patch, reset) => navigate({ search: (prev) => patchSearch(prev, patch, reset), replace: true, resetScroll: false })} />
      </section>

      <section className="border-y bg-surface/50">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <p className="eyebrow">Topics we explore</p>
          <div className="mt-5 flex flex-wrap gap-2">{TOPICS_EXPLORED.map((t) => <Tag key={t}>{t}</Tag>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <p className="eyebrow">Meet the hosts</p>
        <h2 className="mt-2 text-2xl font-bold">Hany & Ahmed</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">{HOSTS.map((h) => <HostCard key={h.name} host={h} />)}</div>
      </section>
    </PageShell>
  );
}

const WAVE = [6, 12, 20, 9, 26, 16, 30, 12, 22, 8, 18, 28, 14, 24, 10, 20, 6, 16, 26, 12, 22, 9, 18, 30, 14, 8, 20, 12];
function Waveform({ offset }: { offset: number }) {
  return (
    <div className="pointer-events-none flex h-6 items-end gap-[3px]" aria-hidden="true" data-waveform>
      {WAVE.map((h, i) => (
        <span key={i} className="wave-bar w-[2px] rounded-full bg-gradient-to-t from-primary to-teal" style={{ height: h * 0.75, animationDelay: `${-((i % 7) * 0.16 + offset * 0.53)}s` }} />
      ))}
    </div>
  );
}
