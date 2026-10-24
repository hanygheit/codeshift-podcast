import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { EpisodeExplorer, patchSearch } from "@/components/episode-explorer";
import { archiveSearchSchema } from "@/lib/archive";

export const Route = createFileRoute("/episodes/")({
  validateSearch: (s) => archiveSearchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Episode Archive — CodeShift Podcast" },
      { name: "description", content: "Browse every CodeShift episode by topic, audience and year, with summaries, slides and resources." },
      { property: "og:title", content: "CodeShift Episode Archive" },
      { property: "og:description", content: "Every CodeShift episode with summaries, presentation slides and curated resources." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/episodes" }],
  }),
  component: Archive,
});

function Archive() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/episodes/" });
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="eyebrow">Archive</p>
        <h1 className="mt-3 mb-8 text-4xl font-extrabold md:text-5xl">All episodes</h1>
        <EpisodeExplorer filters search={s} onChange={(patch, reset) => navigate({ search: (prev) => patchSearch(prev, patch, reset), replace: true })} />
      </section>
    </PageShell>
  );
}
