import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, BookOpen, Youtube } from 'lucide-react';
import { PageShell } from '@/components/page-shell';
import { Tag } from '@/components/site';
import { Button } from '@/components/ui/button';
import { YouTubeEmbed } from '@/components/youtube-embed';
import { EPISODES, formatDate, getEpisode, pad } from '@/content/episodes';

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
        ...(ep.thumbnail.startsWith("https://") ? [{ property: "og:image", content: ep.thumbnail }, { name: "twitter:image", content: ep.thumbnail }] : []),
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
  const ep = getEpisode(slug);
  if (!ep) return null;
  const ordered = [...EPISODES].sort((a, b) => a.number - b.number);
  const idx = ordered.findIndex(e => e.id === ep.id);
  const prev = ordered[idx - 1], next = ordered[idx + 1];
  const ideas = ep.brief?.packages ? [
    { title: 'Six learning packages for the AI era', body: ep.takeaways[0] ?? '' },
    { title: 'Priorities by career level', body: ep.takeaways[1] ?? '' },
    { title: 'AI-assisted and agentic learning', body: ep.takeaways[2] ?? '' },
    { title: 'A practical company adoption roadmap', body: ep.takeaways[4] ?? '' },
  ] : (ep.brief?.lessons ?? ep.takeaways.map(title => ({ title, body: '' }))).slice(0, 4);
  return <PageShell>
    <article className="mx-auto max-w-6xl px-5 py-8 md:py-10">
      <Link to="/episodes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All episodes</Link>
      <header className="mt-7 grid items-center gap-8 lg:grid-cols-[1.8fr_1fr]">
        <div>
          <p className="eyebrow">EP{pad(ep.number)} / {formatDate(ep.scheduledDate)}</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">{ep.title}</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">{ep.description} {ep.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">{ep.topics.slice(0, 3).map(t => <Tag key={t}>{t}</Tag>)}</div>
          <div className="mt-6 flex flex-wrap gap-3" aria-label="Episode actions">
            <Button asChild size="lg"><a href={ep.youtubeUrl} target="_blank" rel="noopener noreferrer"><Youtube /> Watch Episode</a></Button>
            <Button asChild size="lg" variant="outline"><Link to="/episodes/$slug/slides" params={{ slug: ep.slug }} title="Presentation, lessons, action items, learning resources, references and downloadable PDF"><BookOpen /> {ep.presentationLabel ?? 'Summary & Resources'}</Link></Button>
          </div>
        </div>
        <img src={ep.thumbnail} alt={`CodeShift EP${pad(ep.number)} episode cover`} className="w-full max-w-sm justify-self-center rounded-md border lg:max-w-none" />
      </header>
      <section className="mt-10 border-t pt-7">
        <p className="eyebrow">Inside this episode</p><h2 className="mt-2 text-2xl font-semibold">What you’ll learn</h2>
        <div className="mt-5 grid gap-x-10 gap-y-6 md:grid-cols-2">{ideas.map((idea, i) => <div key={idea.title} className="flex gap-4"><span className="font-mono text-sm text-teal">0{i + 1}</span><div><h3 className="font-semibold">{idea.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{idea.body}</p></div></div>)}</div>
      </section>
      <details className="mt-8 border-y py-4"><summary className="cursor-pointer text-sm font-semibold">Watch here</summary><div className="mt-4 max-w-2xl"><YouTubeEmbed id={ep.youtubeVideoId} title={ep.title} thumbnail={ep.thumbnail} /></div></details>
      <nav aria-label="Episode navigation" className="mt-7 grid gap-5 sm:grid-cols-2">
        {prev ? <Link to="/episodes/$slug" params={{ slug: prev.slug }} className="flex items-center gap-3 py-3 hover:text-teal"><ArrowLeft className="h-5 w-5 shrink-0" /><span><span className="block text-xs text-muted-foreground">Previous / EP{pad(prev.number)}</span><span className="mt-1 block text-sm font-semibold">{prev.shortTitle}</span></span></Link> : <span />}
        {next && <Link to="/episodes/$slug" params={{ slug: next.slug }} className="flex items-center justify-end gap-3 py-3 text-right hover:text-teal"><span><span className="block text-xs text-muted-foreground">Next / EP{pad(next.number)}</span><span className="mt-1 block text-sm font-semibold">{next.shortTitle}</span></span><ArrowRight className="h-5 w-5 shrink-0" /></Link>}
      </nav>
    </article>
  </PageShell>;
}
