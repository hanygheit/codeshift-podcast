import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { HostCard } from "@/components/site";
import { HOSTS, SITE } from "@/content/site";
import logoAsset from "@/assets/codeshift-logo.png.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About CodeShift and its hosts" },
      { name: "description", content: "Why CodeShift exists, and the two engineering practitioners who host it: Hany Saad and Ahmed Mamdoh." },
      { property: "og:title", content: "About CodeShift" },
      { property: "og:description", content: "An independent community podcast on software engineering in the AI era." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <PageShell>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="eyebrow">About</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-tight">A permanent companion to every <span className="text-gradient">live conversation</span>.</h1>
          <div className="mt-6 space-y-4 text-lg text-muted-foreground">
            <p>{SITE.description}</p>
            <p>Episodes are delivered in conversational Egyptian Arabic; notes, slides and resources here are in English so they're easy to search and share.</p>
            <p>CodeShift is a knowledge-sharing community initiative. It is not a course marketplace or commercial training platform, and the hosts speak for themselves rather than their employers.</p>
          </div>
        </div>
        <div className="relative mx-auto">
          <div className="absolute inset-0 -m-6 rounded-full bg-primary/25 blur-3xl" />
          <img src={logoAsset.url} alt="CodeShift logo" className="relative w-64 rounded-full shadow-glow" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5">
        <h2 className="text-3xl font-bold">The hosts</h2>
        <p className="mt-2 text-muted-foreground">Equal co-hosts sharing experience from the field.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">{HOSTS.map((h) => <HostCard key={h.name} host={h} />)}</div>
      </section>
    </PageShell>
  );
}
