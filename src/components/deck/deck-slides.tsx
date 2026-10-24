import type { ReactNode } from "react";
import { ArrowUpRight, CheckCircle2, Quote, Youtube } from "lucide-react";
import type { BriefResource, Episode } from "@/content/types";
import { formatDate, pad } from "@/content/episodes";
import { HOSTS } from "@/content/site";
import { SlideView } from "@/components/slide";
import logoAsset from "@/assets/codeshift-logo.png.asset.json";

/** One slide of a deck. Content is authored at a fixed 1920×1080 canvas. */
export interface DeckSlide {
  id: string;
  section: string;
  title: string;
  body: ReactNode;
}

const chunk = <T,>(list: T[], size: number) =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));

function Kicker({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[22px] uppercase tracking-[0.2em] text-teal">{children}</p>;
}
function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-[64px] font-bold leading-[1.06] tracking-tight">{children}</h2>
      {sub && <p className="mt-4 max-w-[1500px] text-[28px] leading-snug text-muted-foreground">{sub}</p>}
    </div>
  );
}
function Access({ a }: { a: BriefResource["access"] }) {
  return <span className="whitespace-nowrap rounded-full border border-teal/50 px-4 py-1 font-mono text-[18px] text-teal">{a}</span>;
}
function WatchLink({ ep, label }: { ep: Episode; label?: string }) {
  return (
    <a href={ep.youtubeUrl} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-3 rounded-full bg-gradient-brand px-8 py-4 text-[26px] font-semibold text-primary-foreground">
      <Youtube className="h-8 w-8" /> {label ?? ep.brief?.watchLabel ?? "Watch Full Episode"}
    </a>
  );
}

function ResourceSlide({ group, items, part }: { group: string; items: BriefResource[]; part?: string }) {
  return (
    <div className="flex h-full flex-col">
      <Kicker>Learning resources{part ? ` · ${part}` : ""}</Kicker>
      <div className="mt-3"><Title>{group}</Title></div>
      <div className="mt-10 grid flex-1 grid-cols-2 content-start gap-6">
        {items.map((r) => (
          <a key={r.url + r.title} href={r.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between gap-6 rounded-2xl border bg-surface-raised px-8 py-6">
            <span className="min-w-0">
              <span className="flex items-center gap-3 text-[28px] font-semibold leading-tight">
                {r.ref && <span className="font-mono text-[20px] text-primary">{r.ref}</span>}{r.title}
              </span>
              <span className="mt-2 block text-[22px] text-muted-foreground">{r.provider}</span>
            </span>
            <span className="flex shrink-0 items-center gap-4"><Access a={r.access} /><ArrowUpRight className="h-8 w-8 text-teal" /></span>
          </a>
        ))}
      </div>
    </div>
  );
}

/** Splits an episode's brief into focused presentation slides. */
export function buildDeck(ep: Episode): DeckSlide[] {
  const b = ep.brief;
  if (!b) {
    return ep.slides.map((s, i) => ({
      id: s.id, section: s.section, title: s.title,
      body: <div className="-m-[72px] h-[1080px] w-[1920px]"><SlideView ep={ep} slide={s} index={i} /></div>,
    }));
  }
  const slides: DeckSlide[] = [];
  const isPlaybook = !!b.packages;

  slides.push({
    id: "cover", section: `Episode ${pad(ep.number)}`, title: ep.title,
    body: (
      <div className="grid h-full grid-cols-[1.05fr_1fr] items-center gap-16">
        <div>
          <Kicker>EP{pad(ep.number)} · {isPlaybook ? "Developer Learning Playbook" : "Executive Summary"}</Kicker>
          <h1 className="mt-6 font-display text-[76px] font-bold leading-[1.04] tracking-tight">{ep.title}</h1>
          <p className="mt-8 text-[28px] text-muted-foreground">{formatDate(ep.scheduledDate)} · {HOSTS.map((h) => h.name).join(" & ")}</p>
          <div className="mt-12"><WatchLink ep={ep} /></div>
        </div>
        <img src={ep.thumbnail} alt="" className="w-full rounded-3xl border shadow-glow" />
      </div>
    ),
  });

  slides.push({
    id: "summary", section: "Executive summary", title: b.summaryHeadline,
    body: (
      <div className="grid h-full grid-cols-[0.8fr_1.2fr] gap-20">
        <div className="flex flex-col justify-center">
          <Kicker>Executive summary</Kicker>
          <h2 className="mt-5 font-display text-[88px] font-bold leading-none tracking-tight text-gradient">{b.summaryHeadline}</h2>
        </div>
        <div className="flex flex-col justify-center gap-7 border-l-4 border-teal/70 pl-14">
          {b.summary.map((p) => <p key={p} className="text-[29px] leading-[1.38] text-foreground/90">{p}</p>)}
        </div>
      </div>
    ),
  });

  slides.push({
    id: "lessons", section: "Key lessons", title: "Key lessons",
    body: (
      <div className="flex h-full flex-col">
        <Kicker>Key lessons</Kicker>
        <div className="mt-3"><Title>Six ideas to take away</Title></div>
        <div className="mt-10 grid flex-1 grid-cols-3 grid-rows-2 gap-6">
          {b.lessons.map((l, i) => (
            <div key={l.title} className="flex flex-col rounded-2xl border bg-surface-raised p-8">
              <span className="font-mono text-[22px] text-teal">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 font-display text-[30px] font-semibold leading-tight">{l.title}</p>
              <p className="mt-3 text-[22px] leading-snug text-muted-foreground">{l.body}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  });

  if (b.packages) {
    slides.push({
      id: "packages", section: "Learning packages", title: "Six learning packages",
      body: (
        <div className="flex h-full flex-col">
          <Kicker>Learning map</Kicker>
          <div className="mt-3"><Title sub={b.packagesNote}>Six learning packages</Title></div>
          <div className="mt-10 grid flex-1 grid-cols-3 grid-rows-2 gap-6">
            {b.packages.map((p) => (
              <div key={p.id} className="flex flex-col rounded-2xl border bg-surface-raised p-7">
                <span className="w-fit rounded-full bg-gradient-brand px-4 py-1 font-mono text-[20px] font-bold text-primary-foreground">{p.id}</span>
                <p className="mt-4 font-display text-[29px] font-semibold leading-tight">{p.name}</p>
                <p className="mt-3 text-[20px] leading-snug text-muted-foreground">{p.topics}</p>
                <p className="mt-auto pt-3 text-[21px] font-medium text-teal">→ {p.outcome}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }

  if (b.juniorAi) {
    const j = b.juniorAi;
    slides.push({
      id: "ai-learning", section: "AI-assisted learning", title: "Should juniors use AI?",
      body: (
        <div className="flex h-full flex-col justify-center">
          <Kicker>AI-assisted learning & agentic coding</Kicker>
          <div className="mt-3"><Title>Should juniors use AI?</Title></div>
          <p className="mt-8 max-w-[1500px] font-display text-[44px] font-semibold leading-tight text-gradient">{j.message}</p>
          <div className="mt-14 flex items-center gap-5">
            {j.modes.map((m, i) => (
              <div key={m} className="flex items-center gap-5">
                <div className="rounded-2xl border bg-surface-raised px-10 py-8 text-center">
                  <span className="font-mono text-[20px] text-teal">Mode {i + 1}</span>
                  <p className="mt-2 font-display text-[34px] font-semibold">{m}</p>
                </div>
                {i < j.modes.length - 1 && <span className="text-[44px] text-primary">→</span>}
              </div>
            ))}
          </div>
          <p className="mt-12 text-[28px] text-muted-foreground">{j.emphasis}</p>
        </div>
      ),
    });
  }

  if (b.careerLevels) {
    slides.push({
      id: "career-levels", section: "Career levels", title: "Priorities by career level",
      body: (
        <div className="flex h-full flex-col">
          <Kicker>Career-specific priorities</Kicker>
          <div className="mt-3"><Title>Priorities by career level</Title></div>
          <div className="mt-12 flex flex-1 items-end gap-6">
            {b.careerLevels.map((c, i) => (
              <div key={c.level} className="flex flex-1 flex-col rounded-2xl border bg-surface-raised p-8" style={{ minHeight: `${340 + i * 90}px` }}>
                <span className="font-mono text-[22px] text-teal">Level {i + 1}</span>
                <p className="mt-3 font-display text-[30px] font-semibold leading-tight">{c.level}</p>
                <p className="mt-4 text-[23px] leading-snug text-muted-foreground">{c.priorities}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }

  if (b.adoption) {
    const a = b.adoption;
    slides.push({
      id: "adoption", section: "For software companies", title: "90-day AI adoption roadmap",
      body: (
        <div className="flex h-full flex-col">
          <Kicker>For software companies</Kicker>
          <div className="mt-3"><Title>The 90-day AI adoption roadmap</Title></div>
          <div className="relative mt-12 grid grid-cols-3 gap-8">
            <div className="absolute left-0 right-0 top-[34px] h-1 bg-gradient-brand opacity-60" />
            {a.phases.map((p) => (
              <div key={p.days} className="relative">
                <span className="relative inline-block rounded-full bg-gradient-brand px-6 py-3 font-mono text-[22px] font-bold text-primary-foreground">{p.days}</span>
                <p className="mt-6 font-display text-[38px] font-semibold">{p.title}</p>
                <p className="mt-3 text-[24px] leading-snug text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-end justify-between gap-10">
            <div>
              <p className="font-mono text-[20px] uppercase tracking-[0.18em] text-muted-foreground">Measure</p>
              <div className="mt-3 flex max-w-[1000px] flex-wrap gap-3">{a.metrics.map((m) => <span key={m} className="rounded-full border px-5 py-2 text-[22px]">{m}</span>)}</div>
            </div>
            <p className="max-w-[640px] rounded-2xl border border-teal/60 bg-accent/60 p-7 font-display text-[32px] font-semibold leading-tight">{a.highlight}</p>
          </div>
        </div>
      ),
    });
  }

  if (b.caseStudy) {
    const c = b.caseStudy;
    slides.push({
      id: "case-study", section: "Case study", title: c.headline,
      body: (
        <div className="grid h-full grid-cols-[1.2fr_0.8fr] items-center gap-16">
          <div>
            <Kicker>Case study · WorxForge</Kicker>
            <h2 className="mt-5 font-display text-[64px] font-bold leading-[1.06] tracking-tight">{c.headline}</h2>
            <div className="mt-8 space-y-6">{c.body.map((p) => <p key={p} className="text-[26px] leading-[1.4] text-muted-foreground">{p}</p>)}</div>
          </div>
          <div className="flex flex-col gap-6">
            {c.links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl border bg-surface-raised p-8 text-[30px] font-semibold">
                {l.label}<ArrowUpRight className="h-9 w-9 text-teal" />
              </a>
            ))}
          </div>
        </div>
      ),
    });
  }

  slides.push({
    id: "actions", section: "Action items", title: "Practical action items",
    body: (
      <div className="flex h-full flex-col">
        <Kicker>What to do next</Kicker>
        <div className="mt-3"><Title>Practical action items</Title></div>
        <div className="mt-10 grid flex-1 gap-6" style={{ gridTemplateColumns: `repeat(${b.actions.length}, minmax(0,1fr))` }}>
          {b.actions.map((a) => (
            <div key={a.role} className="flex flex-col rounded-2xl border bg-surface-raised p-8">
              <p className="font-display text-[30px] font-semibold leading-tight text-teal">{a.role}</p>
              <ul className="mt-6 space-y-5">
                {a.items.map((i) => <li key={i} className="flex gap-4 text-[25px] leading-snug"><CheckCircle2 className="mt-1 h-8 w-8 shrink-0 text-teal" />{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
  });

  b.resourceGroups.forEach((g, gi) => {
    const parts = chunk(g.items, 6);
    parts.forEach((items, pi) => slides.push({
      id: `resources-${gi + 1}${parts.length > 1 ? `-${pi + 1}` : ""}`, section: "Resources", title: g.label,
      body: <ResourceSlide group={g.label} items={items} part={parts.length > 1 ? `${pi + 1} of ${parts.length}` : undefined} />,
    }));
  });

  slides.push({
    id: "closing", section: "Final message", title: "Final message",
    body: (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <Quote className="h-16 w-16 text-teal" />
        <p className="mt-8 max-w-[1500px] font-display text-[60px] font-bold leading-[1.12] text-gradient">{b.finalMessage}</p>
        {b.resourcesNote && <p className="mt-8 max-w-[1300px] text-[22px] text-muted-foreground">{b.resourcesNote}</p>}
        <div className="mt-12 flex gap-6">
          <WatchLink ep={ep} />
          {b.nextEpisode && (
            <a href={b.nextEpisode.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-full border px-8 py-4 text-[26px] font-semibold">
              {b.nextEpisode.label} <ArrowUpRight className="h-7 w-7" />
            </a>
          )}
        </div>
      </div>
    ),
  });

  return slides;
}

/** The fixed 1920×1080 slide chrome shared by the player, thumbnails and PDF export. */
export function SlideFrame({ ep, slide, index, total }: { ep: Episode; slide: DeckSlide; index: number; total: number }) {
  return (
    <div className="deck-slide relative flex h-[1080px] w-[1920px] flex-col overflow-hidden bg-surface px-[72px] pb-[44px] pt-[40px] text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-hero" />
      <div className="relative flex items-center justify-between font-mono text-[20px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="flex items-center gap-4"><img src={logoAsset.url} alt="" className="h-14 w-14 rounded-full" /> CodeShift · EP{pad(ep.number)}</span>
        <span>{slide.section}</span>
      </div>
      <div className="relative min-h-0 flex-1 py-[36px]">{slide.body}</div>
      <div className="relative flex items-center justify-between font-mono text-[20px] text-muted-foreground">
        <span>Think Beyond the Code.</span>
        <span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[6px] bg-gradient-brand" />
    </div>
  );
}
