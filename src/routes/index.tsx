import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Facebook, Youtube, CalendarClock, Layers, Cog, BrainCircuit, Laptop, MessagesSquare, Users, Lightbulb, CalendarDays, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { EpisodeCard } from "@/components/episode-card";
import { ExtLink, HostCard, Tag } from "@/components/site";
import { EXPLORE, HOSTS, SITE } from "@/content/site";
import { EPISODES, episodesNewestFirst, formatDate, pad } from "@/content/episodes";
import { AUDIENCES } from "@/content/types";
import { archiveSearchSchema, filterEpisodes, type ArchiveSearch } from "@/lib/archive";
import logoAsset from "@/assets/codeshift-logo.png.asset.json";

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

const HERO_LEFT = [
  { icon: Layers, label: "Architecture" },
  { icon: Cog, label: "System Design" },
  { icon: BrainCircuit, label: "AI & Agentic Coding" },
  { icon: Laptop, label: "Engineering Leadership" },
];
const HERO_RIGHT = [
  { icon: MessagesSquare, label: "Practical Discussions" },
  { icon: Users, label: "Real-World Experience" },
  { icon: Lightbulb, label: "Advice & Mentoring" },
  { icon: CalendarDays, label: "Weekly Episodes" },
];

function HeroFeature({ icon: Icon, label }: { icon: typeof Layers; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border bg-card text-teal shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <span className="font-semibold">{label}</span>
    </li>
  );
}

function Home() {
  const eps = episodesNewestFirst();
  const latest = eps[0]!;
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-hero">
        <div className="grid-lines absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Weekly Arabic podcast · {SITE.descriptor}</p>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.02] md:text-7xl">
              Think Beyond <span className="text-gradient">the Code.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">{SITE.description}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/episodes" className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 font-semibold text-primary-foreground shadow-glow">
                Explore Episodes <ArrowRight className="h-4 w-4" />
              </Link>
              <ExtLink href={SITE.youtube} className="inline-flex items-center gap-2 rounded-full border px-6 py-3 font-semibold hover:bg-secondary">
                <Youtube className="h-4 w-4" /> Watch on YouTube
              </ExtLink>
            </div>
          </div>
          <div className="mt-16 grid items-center gap-10 md:grid-cols-[1fr_auto_1fr]">
            <ul className="space-y-5 md:justify-self-end">
              {HERO_LEFT.map((f) => <HeroFeature key={f.label} {...f} />)}
            </ul>
            <div className="relative mx-auto order-first md:order-none">
              <div className="absolute inset-0 -m-10 rounded-full bg-primary/30 blur-3xl" />
              <div className="absolute inset-0 -m-4 rounded-full border border-teal/30" />
              <img src={logoAsset.url} alt="CodeShift logo" className="animate-float relative w-56 rounded-full shadow-glow md:w-72" />
            </div>
            <ul className="space-y-5">
              {HERO_RIGHT.map((f) => <HeroFeature key={f.label} {...f} />)}
            </ul>
          </div>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
            <ExtLink href={SITE.youtube} className="inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-secondary">
              <Youtube className="h-4 w-4 text-primary" /> YouTube
            </ExtLink>
            <ExtLink href={SITE.facebook} className="inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-secondary">
              <Facebook className="h-4 w-4 text-primary" /> Facebook
            </ExtLink>
          </div>
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

      <EpisodeBrowser />

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

const HOME_PAGE_SIZE = 5;
const TOPICS = [...new Set(EPISODES.flatMap((e) => e.topics))].sort();
const YEARS = [...new Set(EPISODES.map((e) => e.scheduledDate.slice(0, 4)))].sort().reverse();
const selectCls = "rounded-lg border bg-card px-3 py-2 text-sm";

function EpisodeBrowser() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const set = (patch: Partial<ArchiveSearch>, resetPage = true) =>
    navigate({ search: (prev) => {
      const next = { ...prev, ...patch, ...(resetPage ? { page: undefined } : {}) };
      Object.keys(next).forEach((k) => { const v = next[k as keyof ArchiveSearch]; if (v === "" || v === undefined) delete next[k as keyof ArchiveSearch]; });
      return next;
    }, replace: true });
  const [q, setQ] = useState(s.q ?? "");
  useEffect(() => setQ(s.q ?? ""), [s.q]);
  useEffect(() => { const t = setTimeout(() => { if ((s.q ?? "") !== q) set({ q }); }, 250); return () => clearTimeout(t); }, [q]);

  const { items, total, page, pageCount, pageSize } = filterEpisodes(EPISODES, s, HOME_PAGE_SIZE);
  const active = !!(s.q || s.topic || s.audience || s.year || s.sort);
  const clear = () => navigate({ search: {} });

  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <p className="eyebrow">Archive</p>
      <h2 className="mt-3 text-3xl font-bold">Browse episodes</h2>
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border bg-surface p-4 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search episodes</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles, topics, tags…"
            className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm" />
        </label>
        <select aria-label="Topic" className={selectCls} value={s.topic ?? ""} onChange={(e) => set({ topic: e.target.value })}>
          <option value="">All topics</option>{TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select aria-label="Audience" className={selectCls} value={s.audience ?? ""} onChange={(e) => set({ audience: e.target.value })}>
          <option value="">All audiences</option>{AUDIENCES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select aria-label="Year" className={selectCls} value={s.year ?? ""} onChange={(e) => set({ year: e.target.value })}>
          <option value="">All years</option>{YEARS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select aria-label="Sort" className={selectCls} value={s.sort ?? "newest"} onChange={(e) => set({ sort: e.target.value === "newest" ? undefined : (e.target.value as ArchiveSearch["sort"]) })}>
          <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="number">Episode number</option>
        </select>
        {active && <button onClick={clear} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /> Clear</button>}
      </div>
      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {total === 0 ? "No episodes found" : `Showing ${(page - 1) * pageSize + 1}–${(page - 1) * pageSize + items.length} of ${total} episode${total === 1 ? "" : "s"}`}
      </p>
      {total === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed p-12 text-center">
          <p className="text-lg font-semibold">Nothing matches those filters.</p>
          <button onClick={clear} className="mt-4 rounded-full bg-gradient-brand px-5 py-2.5 font-semibold text-primary-foreground">Reset filters</button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((e) => <EpisodeCard key={e.id} ep={e} />)}</div>
      )}
      {pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
          <Link to="/" search={{ ...s, page: page - 1 }} disabled={page === 1} className="rounded-lg border px-3 py-2 text-sm aria-disabled:opacity-40">Previous</Link>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <Link key={n} to="/" search={{ ...s, page: n }} aria-current={n === page ? "page" : undefined}
              className={`rounded-lg border px-3 py-2 text-sm ${n === page ? "bg-gradient-brand text-primary-foreground" : ""}`}>{n}</Link>
          ))}
          <Link to="/" search={{ ...s, page: page + 1 }} disabled={page === pageCount} className="rounded-lg border px-3 py-2 text-sm aria-disabled:opacity-40">Next</Link>
        </nav>
      )}
    </section>
  );
}
