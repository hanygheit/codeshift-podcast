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
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr] md:py-20">
          <div>
            <p className="eyebrow">Weekly Arabic Technical Podcast</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] md:text-6xl">Software Engineering <span className="text-gradient">in the AI Era</span></h1>
            <p className="mt-3 font-display text-xl text-teal">{SITE.tagline}</p>
            <p className="mt-5 max-w-xl text-muted-foreground">{SITE.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-brand"><a href="#explore">Explore Episodes <ArrowRight /></a></Button>
              <Button asChild size="lg" variant="outline"><ExtLink href={SITE.youtube}><Youtube /> Watch on YouTube</ExtLink></Button>
            </div>
          </div>
          <div className="rounded-2xl border bg-card/70 p-6 shadow-glow backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal">On the show</p>
              <span className="font-mono text-xs text-muted-foreground">{EPISODES.length} episodes</span>
            </div>
            <ul className="mt-4 space-y-2">
              {TOPICS_EXPLORED.map((t, i) => (
                <li key={t} className="flex items-center gap-3 rounded-lg border bg-background/40 px-3 py-2 text-sm">
                  <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>{t}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-3 border-t pt-4">
              <div className="flex -space-x-3">
                {HOSTS.map((h) => <img key={h.name} src={h.photo} alt={h.name} className="h-10 w-10 rounded-full border-2 border-card object-cover" />)}
              </div>
              <p className="text-sm text-muted-foreground">Hosted by {HOSTS.map((h) => h.name).join(" & ")}</p>
            </div>
          </div>
        </div>
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
