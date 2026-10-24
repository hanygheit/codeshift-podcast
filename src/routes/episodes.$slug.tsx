import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Copy, ExternalLink, Maximize2, Youtube } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { ExtLink, Tag } from "@/components/site";
import { DownloadPdfButton } from "@/components/deck/download-pdf";
import { Scaled } from "@/components/deck/deck-player";
import { buildDeck, SlideFrame } from "@/components/deck/deck-slides";
import { EpisodeResources } from "@/components/episode-resources";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { EPISODES, formatDate, getEpisode, pad } from "@/content/episodes";
import { getResource } from "@/content/resources";

export const Route = createFileRoute("/episodes/$slug")({
  loader: ({ params }) => {
    const ep = getEpisode(params.slug);
    if (!ep) throw notFound();
    return { slug: ep.slug };
  },
  head: ({ params, loaderData }) => {
    const ep = loaderData ? getEpisode(loaderData.slug) : undefined;
    if (!ep) return { meta: [{ title: "Episode not found — CodeShift" }, { name: "robots", content: "noindex" }] };
    const title = `EP${pad(ep.number)}: ${ep.title} — CodeShift`;
    return {
      meta: [
        { title },
        { name: "description", content: ep.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: ep.summary },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/episodes/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/episodes/${params.slug}` }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org", "@type": "PodcastEpisode", episodeNumber: ep.number, name: ep.title,
        description: ep.summary, datePublished: ep.scheduledDate, url: `/episodes/${ep.slug}`,
        associatedMedia: { "@type": "VideoObject", embedUrl: `https://www.youtube.com/embed/${ep.youtubeVideoId}`, name: ep.title, uploadDate: ep.scheduledDate },
        partOfSeries: { "@type": "PodcastSeries", name: "CodeShift" },
      }) }],
    };
  },
  notFoundComponent: () => (
    <PageShell><div className="mx-auto max-w-xl px-5 py-32 text-center"><h1 className="text-3xl font-bold">Episode not found</h1>
      <Link to="/episodes" className="mt-6 inline-block text-primary hover:underline">Browse all episodes →</Link></div></PageShell>
  ),
  component: EpisodePage,
});

function EpisodePage() {
  const { slug } = Route.useLoaderData();
  const ep = getEpisode(slug)!;
  const ordered = [...EPISODES].sort((a, b) => a.number - b.number);
  const idx = ordered.findIndex((e) => e.id === ep.id);
  const prev = ordered[idx - 1], next = ordered[idx + 1];
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(0);
  const deck = buildDeck(ep);
  const resources = ep.resourceIds.map(getResource).filter((r) => !!r);

  const copy = async () => { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); };

  return (
    <>
      <PageShell>
        <article className="mx-auto max-w-6xl px-5 py-12">
          <Link to="/episodes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All episodes</Link>
          <header className="mt-6 max-w-4xl">
            <p className="eyebrow">EP{pad(ep.number)} · {formatDate(ep.scheduledDate)} · 7:00 PM Cairo</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-5xl">{ep.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{ep.summary}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">{[...ep.topics, ...ep.audienceLevels].map((t) => <Tag key={t}>{t}</Tag>)}</div>
          </header>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <YouTubeEmbed id={ep.youtubeVideoId} title={ep.title} thumbnail={ep.thumbnail} />
            <div className="flex flex-col gap-3">
              <ExtLink href={ep.youtubeUrl} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-3 font-semibold text-primary-foreground"><Youtube className="h-4 w-4" /> Open on YouTube</ExtLink>
              <a href="#resources" className="inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 font-semibold hover:bg-secondary">Explore resources</a>
              <Link to="/episodes/$slug/slides" params={{ slug: ep.slug }} className="inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 font-semibold hover:bg-secondary"><Maximize2 className="h-4 w-4" /> View presentation</Link>
              <DownloadPdfButton ep={ep} className="inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 font-semibold hover:bg-secondary disabled:opacity-60" />
              <button onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 font-semibold hover:bg-secondary"><Copy className="h-4 w-4" /> {copied ? "Link copied" : "Copy episode link"}</button>
            </div>
          </div>

          <section className="mt-16 grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">Overview</h2>
              <p className="mt-1 text-xs text-muted-foreground">Editorial notes — not a verbatim transcript.</p>
              <div className="mt-4 space-y-4 text-muted-foreground">{ep.overview.map((p) => <p key={p}>{p}</p>)}</div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Key takeaways</h2>
              <ul className="mt-4 space-y-3">{ep.takeaways.map((t) => <li key={t} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gradient-brand" />{t}</li>)}</ul>
            </div>
          </section>

          <section className="mt-16">
            <h2 className="text-2xl font-bold">Action items</h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">{ep.actionItems.map((a) => <li key={a} className="flex gap-3 rounded-xl border bg-card p-4"><CheckCircle2 className="h-5 w-5 shrink-0 text-teal" />{a}</li>)}</ul>
          </section>

          <section className="mt-16">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold">Presentation</h2>
              <Link to="/episodes/$slug/slides" params={{ slug: ep.slug }} search={{ slide: deck[preview]!.id }} className="text-sm font-semibold text-primary hover:underline">Open presentation →</Link>
            </div>
            <div className="mt-4"><Scaled className="rounded-xl border"><SlideFrame ep={ep} slide={deck[preview]!} index={preview} total={deck.length} /></Scaled></div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <button aria-label="Previous slide" disabled={preview === 0} onClick={() => setPreview(preview - 1)} className="rounded-full border p-2 disabled:opacity-30"><ArrowLeft className="h-4 w-4" /></button>
              <span className="font-mono text-sm text-muted-foreground">{String(preview + 1).padStart(2, "0")} / {String(deck.length).padStart(2, "0")}</span>
              <button aria-label="Next slide" disabled={preview === deck.length - 1} onClick={() => setPreview(preview + 1)} className="rounded-full border p-2 disabled:opacity-30"><ArrowRight className="h-4 w-4" /></button>
            </div>
          </section>

          <EpisodeResources ep={ep} />

          <section className="mt-16">
            <h2 className="text-2xl font-bold">{ep.brief ? "Further reading" : "Curated resources"}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((r) => (
                <ExtLink key={r.id} href={r.url} className="group rounded-2xl border bg-card p-5 transition hover:border-primary/60">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-teal">{r.resourceType} · {r.level}</p>
                  <p className="mt-2 flex items-start justify-between gap-2 font-semibold">{r.title}<ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" /></p>
                  <p className="text-sm text-muted-foreground">by {r.provider}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{r.summary}</p>
                </ExtLink>
              ))}
            </div>
          </section>

          <nav className="mt-16 grid gap-4 border-t pt-8 sm:grid-cols-2" aria-label="Episode navigation">
            {prev ? <Link to="/episodes/$slug" params={{ slug: prev.slug }} className="rounded-xl border p-4 hover:border-primary/60"><span className="text-xs text-muted-foreground">← Previous · EP{pad(prev.number)}</span><p className="font-semibold">{prev.shortTitle}</p></Link> : <span />}
            {next && <Link to="/episodes/$slug" params={{ slug: next.slug }} className="rounded-xl border p-4 text-right hover:border-primary/60"><span className="text-xs text-muted-foreground">Next · EP{pad(next.number)} →</span><p className="font-semibold">{next.shortTitle}</p></Link>}
          </nav>
        </article>
      </PageShell>
    </>
  );
}
