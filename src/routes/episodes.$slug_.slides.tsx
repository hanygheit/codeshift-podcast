import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { DeckPlayer, ExportDeck } from "@/components/deck/deck-player";
import { SiteHeader } from "@/components/site";
import { getEpisode, pad } from "@/content/episodes";

export const Route = createFileRoute("/episodes/$slug_/slides")({
  validateSearch: z.object({
    slide: z.string().optional().catch(undefined),
    export: z.coerce.number().optional().catch(undefined),
  }),
  loader: ({ params }) => {
    const ep = getEpisode(params.slug);
    if (!ep) throw notFound();
    return { slug: ep.slug };
  },
  head: ({ params, loaderData }) => {
    const ep = loaderData ? getEpisode(loaderData.slug) : undefined;
    if (!ep) return { meta: [{ title: "Slides unavailable — CodeShift" }, { name: "robots", content: "noindex" }] };
    const kind = ep.brief?.packages ? "Developer Learning Playbook" : "Executive Summary";
    const title = `EP${pad(ep.number)} ${kind} — CodeShift Slides`;
    const desc = `Slide-by-slide ${kind.toLowerCase()} for “${ep.title}” — key lessons, action items and learning resources.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/episodes/${params.slug}/slides` }],
    };
  },
  component: Slides,
});

function Slides() {
  const { slug } = Route.useLoaderData();
  const ep = getEpisode(slug);
  if (!ep) return null;
  const s = Route.useSearch();
  if (s.export) return <ExportDeck ep={ep} />;
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <DeckPlayer ep={ep} slideId={s.slide} />
    </div>
  );
}
