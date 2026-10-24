import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Facebook, Youtube, CalendarClock, Layers, Cog, BrainCircuit, Laptop, MessagesSquare, Users, Lightbulb, CalendarDays } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { EpisodeCard } from "@/components/episode-card";
import { ExtLink, HostCard, Tag } from "@/components/site";
import { EXPLORE, HOSTS, SITE } from "@/content/site";
import { episodesNewestFirst, formatDate, pad } from "@/content/episodes";
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

function HeroArt() {
  return (
    <svg viewBox="0 0 360 300" className="h-full w-full" aria-hidden="true">
      {([[60, 60], [300, 70], [70, 240], [290, 230]] as const).map(([x, y], i) => (
        <g key={i}>
          <line x1="180" y1="150" x2={x} y2={y} stroke="var(--teal)" strokeOpacity=".5" className="animate-dash" />
          <rect x={x - 26} y={y - 18} width="52" height="36" rx="8" fill="var(--surface-raised)" stroke="var(--border)" />
          <text x={x} y={y + 5} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--muted-foreground)">{["</>", "API", "test", "ship"][i]}</text>
        </g>
      ))}
      <circle cx="180" cy="150" r="54" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2" />
      <circle cx="180" cy="150" r="72" fill="none" stroke="var(--teal)" strokeOpacity=".3" strokeDasharray="2 8" />
      <text x="180" y="160" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="800" fontSize="30" fill="var(--teal)">CS</text>
    </svg>
  );
}

function Home() {
  const eps = episodesNewestFirst();
  const latest = eps[0]!;
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-hero">
        <div className="grid-lines absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
          <div>
            <p className="eyebrow">Weekly Arabic podcast · {SITE.descriptor}</p>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.02] md:text-7xl">
              Think Beyond<br /><span className="text-gradient">the Code.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">{SITE.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/episodes" className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 font-semibold text-primary-foreground shadow-glow">
                Explore Episodes <ArrowRight className="h-4 w-4" />
              </Link>
              <ExtLink href={SITE.youtube} className="inline-flex items-center gap-2 rounded-full border px-6 py-3 font-semibold hover:bg-secondary">
                <Youtube className="h-4 w-4" /> Watch on YouTube
              </ExtLink>
            </div>
          </div>
          <div className="animate-float mx-auto aspect-[6/5] w-full max-w-md"><HeroArt /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="eyebrow">Latest episode</p>
        <div className="mt-5 grid overflow-hidden rounded-3xl border bg-card md:grid-cols-2">
          <img src={latest.thumbnail} alt={`EP${pad(latest.number)} cover`} className="h-full w-full object-cover" />
          <div className="flex flex-col gap-4 p-8">
            <p className="font-mono text-sm text-teal">EP{pad(latest.number)} · {formatDate(latest.scheduledDate)} · 7:00 PM Cairo</p>
            <h2 className="text-3xl font-bold leading-tight">{latest.title}</h2>
            <p className="text-muted-foreground">{latest.summary}</p>
            <div className="flex flex-wrap gap-1.5">{latest.topics.map((t) => <Tag key={t}>{t}</Tag>)}</div>
            <div className="mt-auto flex flex-wrap gap-3 pt-2">
              <Link to="/episodes/$slug" params={{ slug: latest.slug }} className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 font-semibold text-primary-foreground">Explore resources <ArrowRight className="h-4 w-4" /></Link>
              <ExtLink href={latest.youtubeUrl} className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-semibold hover:bg-secondary"><Youtube className="h-4 w-4" /> Watch</ExtLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="eyebrow">What we explore</p>
        <h2 className="mt-3 text-3xl font-bold">Six threads running through every conversation</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXPLORE.map((x, i) => (
            <div key={x.title} className="rounded-2xl border bg-card p-6 transition hover:border-primary/60">
              <span className="font-mono text-sm text-teal">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-lg font-semibold">{x.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{x.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <div><p className="eyebrow">Archive</p><h2 className="mt-3 text-3xl font-bold">Recent episodes</h2></div>
          <Link to="/episodes" className="text-sm font-semibold text-primary hover:underline">All episodes →</Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">{eps.slice(0, 4).map((e) => <EpisodeCard key={e.id} ep={e} />)}</div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="eyebrow">Your hosts</p>
        <h2 className="mt-3 text-3xl font-bold">Two practitioners, one conversation</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">{HOSTS.map((h) => <HostCard key={h.name} host={h} />)}</div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-3xl border bg-hero bg-card p-10 text-center">
          <CalendarClock className="mx-auto h-8 w-8 text-teal" />
          <h2 className="mt-4 text-3xl font-bold">Join the conversation live</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{SITE.schedule}. Bring your questions to the live chat — the discussion is in conversational Egyptian Arabic.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ExtLink href={SITE.facebook} className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-semibold hover:bg-secondary"><Facebook className="h-4 w-4" /> Follow on Facebook</ExtLink>
            <ExtLink href={SITE.youtube} className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 font-semibold text-primary-foreground"><Youtube className="h-4 w-4" /> Watch on YouTube</ExtLink>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
