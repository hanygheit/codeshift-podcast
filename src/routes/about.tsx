import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { HostCard } from "@/components/site";
import { HOSTS, SITE } from "@/content/site";
import logoAsset from "@/assets/codeshift-logo.png.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About CodeShift | Software Engineering in the AI Era" },
      { name: "description", content: "Meet the hosts of CodeShift, an independent Arabic podcast exploring software engineering in the AI era." },
      { property: "og:title", content: "About CodeShift" },
      { property: "og:description", content: "Meet the hosts of the independent Arabic podcast on software engineering in the AI era." },
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
          <p className="eyebrow">About CodeShift</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-tight">A podcast for the craft of building software in the <span className="text-gradient">AI era</span>.</h1>
          <div className="mt-6 space-y-4 text-lg text-muted-foreground">
            <p>{SITE.description}</p>
            <p>Join us live: {SITE.schedule}. Conversations are in Egyptian Arabic; episode notes, slides, and resources are in English so they are easy to search, revisit, and share.</p>
            <p>We explore the ideas and practices shaping software engineering: fundamentals, AI-native development, coding agents, architecture, career growth, and engineering leadership. Each conversation is designed to leave you with useful ideas to take back to your work.</p>
            <p>CodeShift is an independent community knowledge-sharing initiative, not a course marketplace or commercial training platform. The hosts speak for themselves, not on behalf of their employers.</p>
          </div>
        </div>
        <div className="relative mx-auto">
          <div className="absolute inset-0 -m-6 rounded-full bg-primary/25 blur-3xl" />
          <img src={logoAsset.url} alt="CodeShift logo" className="relative w-64 rounded-full shadow-glow" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5">
        <h2 className="text-3xl font-bold">Two practitioners, one conversation</h2>
        <p className="mt-2 text-muted-foreground">Hany and Ahmed bring their experience in software engineering, leadership, and developer growth to each episode.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">{HOSTS.map((h) => <HostCard key={h.name} host={h} />)}</div>
      </section>
    </PageShell>
  );
}
