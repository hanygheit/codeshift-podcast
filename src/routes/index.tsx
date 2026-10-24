import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Youtube } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { ExtLink, HostCard, Tag } from "@/components/site";
import { HOSTS, SITE, TOPICS_EXPLORED } from "@/content/site";
import { EPISODES, formatDate, pad } from "@/content/episodes";
import logoAsset from "@/assets/codeshift-logo.png.asset.json";

export const Route = createFileRoute("/")({
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

const byNumber = [...EPISODES].sort((a, b) => b.number - a.number);

function Home() {
  const [latest, ...previous] = byNumber;
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
              <Button asChild size="lg" className="bg-gradient-brand"><Link to="/episodes">Explore Episodes <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="outline"><ExtLink href={SITE.youtube}><Youtube /> Watch on YouTube</ExtLink></Button>
            </div>
          </div>
          <img src={logoAsset.url} alt="CodeShift logo" className="mx-auto w-56 rounded-full shadow-glow md:w-72" />
        </div>
      </section>

      {latest && (
        <section className="mx-auto max-w-6xl px-5 py-14">
          <p className="eyebrow">Latest episode</p>
          <div className="mt-4 grid items-center gap-8 rounded-3xl border bg-card p-5 md:grid-cols-2 md:p-8">
            <Link to="/episodes/$slug" params={{ slug: latest.slug }} className="overflow-hidden rounded-2xl border">
              <img src={latest.thumbnail} alt={`EP${pad(latest.number)} cover: ${latest.title}`} className="aspect-video w-full object-cover transition duration-500 hover:scale-105" />
            </Link>
            <div>
              <p className="font-mono text-xs text-teal">EP{pad(latest.number)} · {formatDate(latest.scheduledDate)}</p>
              <h2 className="mt-2 text-2xl font-bold leading-tight md:text-3xl">{latest.title}</h2>
              <p className="mt-3 text-muted-foreground">{latest.summary}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="bg-gradient-brand"><ExtLink href={latest.youtubeUrl}><Youtube /> Watch Episode</ExtLink></Button>
                <Button asChild variant="outline"><Link to="/episodes/$slug/slides" params={{ slug: latest.slug }}><BookOpen /> Explore Summary & Resources</Link></Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {previous.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-14">
          <div className="flex items-end justify-between gap-4">
            <div><p className="eyebrow">Previous episodes</p><h2 className="mt-2 text-2xl font-bold">Catch up</h2></div>
            <Link to="/episodes" className="text-sm font-semibold text-primary hover:underline">View All Episodes →</Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {previous.slice(0, 4).map((ep) => (
              <Link key={ep.id} to="/episodes/$slug" params={{ slug: ep.slug }} className="flex gap-4 rounded-2xl border bg-card p-3 transition hover:border-primary/60">
                <img src={ep.thumbnail} alt="" loading="lazy" className="aspect-video w-36 shrink-0 rounded-lg object-cover sm:w-44" />
                <div className="min-w-0 py-1">
                  <p className="font-mono text-xs text-teal">EP{pad(ep.number)} · {formatDate(ep.scheduledDate)}</p>
                  <p className="mt-1 line-clamp-2 font-semibold leading-snug">{ep.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{ep.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

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
