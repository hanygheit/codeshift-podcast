import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Youtube } from "lucide-react";
import { EpisodeExplorer, patchSearch } from "@/components/episode-explorer";
import { UpcomingEpisode } from "@/components/upcoming-episode";
import { archiveSearchSchema } from "@/lib/archive";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { ExtLink, HostCard, Tag } from "@/components/site";
import { HOSTS, SITE, TOPICS_EXPLORED } from "@/content/site";
import { EPISODES } from "@/content/episodes";

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
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-12 md:grid-cols-2 md:py-16 lg:gap-16">
          <div>
            <p className="eyebrow">Weekly Arabic Tech Podcast</p>
            <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Engineering <br className="hidden sm:block" />Beyond the <span className="text-teal">Code.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Practical conversations on AI-native development, software architecture, coding agents, developer growth, and engineering leadership.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 bg-gradient-brand px-6"><Link to="/episodes">Explore Episodes <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6"><ExtLink href={SITE.youtube}><Youtube /> Watch on YouTube</ExtLink></Button>
            </div>
            <div className="mt-10 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px w-10 bg-primary" /> {SITE.tagline}
            </div>
          </div>

          <figure className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-3xl border bg-card shadow-glow">
              <div className="grid grid-cols-2">
                {HOSTS.map((h, i) => (
                  <div key={h.name} className={`relative aspect-[4/5] overflow-hidden ${i === 0 ? "border-r" : ""}`}>
                    <img src={h.photo} alt={`${h.name}, CodeShift co-host`} className="h-full w-full object-cover object-top" loading="eager" />
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute left-4 top-4 rounded-full border bg-background/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-teal backdrop-blur">
                Your hosts
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <Waveform />
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {HOSTS.map((h) => (
                    <figcaption key={h.name}>
                      <p className="font-display text-base font-semibold sm:text-lg">{h.name}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{h.role}</p>
                    </figcaption>
                  ))}
                </div>
              </div>
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
        <EpisodeExplorer search={s} onChange={(patch, reset) => navigate({ search: (prev) => patchSearch(prev, patch, reset), replace: true, resetScroll: false })} />
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
