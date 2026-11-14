import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Check, Lightbulb, Loader2, RotateCcw, Share2, Timer, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EpisodePoll as EpisodePollContent } from "@/content/episode-polls";
import { cn } from "@/lib/utils";

type PollResult = { optionId: string; count: number; percent: number };
type PollResponse = {
  poll?: { slug: string; status: "draft" | "live" | "open" | "closed" } | null;
  total?: number;
  results?: PollResult[];
  myVote?: string;
  alreadyVoted?: boolean;
  error?: string;
};
type Phase = "loading" | "ready" | "submitting" | "voted" | "closed" | "unavailable";

const UNAVAILABLE = "Voting is temporarily unavailable. Please try again in a moment.";
const OFFLINE = "We couldn’t reach the server. Check your connection and try again.";

async function readJson(response: Response): Promise<PollResponse> {
  try {
    return (await response.json()) as PollResponse;
  } catch {
    return {};
  }
}

export function EpisodePoll({ poll, watchUrl }: { poll: EpisodePollContent; watchUrl: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [selected, setSelected] = useState("");
  const [data, setData] = useState<PollResponse | null>(null);
  const [message, setMessage] = useState("");
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const titleId = `${poll.anchor}-title`;

  const load = useCallback(async () => {
    setPhase("loading");
    setMessage("");
    try {
      const response = await fetch(`/api/polls?slug=${encodeURIComponent(poll.slug)}`, {
        cache: "no-store",
      });
      const body = await readJson(response);
      if (!response.ok || !body.poll) {
        setMessage(response.ok ? "This poll isn’t open yet. Please check back soon." : UNAVAILABLE);
        setPhase("unavailable");
        return;
      }
      setData(body);
      if (body.myVote) setSelected(body.myVote);
      const accepting = body.poll.status === "open" || body.poll.status === "live";
      setPhase(body.myVote ? "voted" : accepting ? "ready" : "closed");
    } catch {
      setMessage(OFFLINE);
      setPhase("unavailable");
    }
  }, [poll.slug]);

  useEffect(() => {
    void load();
  }, [load]);

  // Shared links land on #anchor; re-align once late images above the poll have loaded,
  // unless the visitor has already started scrolling or typing.
  useEffect(() => {
    if (window.location.hash !== `#${poll.anchor}`) return;
    const align = () => document.getElementById(poll.anchor)?.scrollIntoView({ block: "start" });
    align();
    if (document.readyState === "complete") return;
    const userEvents = ["wheel", "touchstart", "keydown"] as const;
    const stop = () => {
      window.removeEventListener("load", align);
      userEvents.forEach((name) => window.removeEventListener(name, stop));
    };
    window.addEventListener("load", align, { once: true });
    userEvents.forEach((name) => window.addEventListener(name, stop, { passive: true }));
    return stop;
  }, [poll.anchor]);

  async function castVote() {
    if (!selected || phase !== "ready") return;
    setPhase("submitting");
    setMessage("");
    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "vote", slug: poll.slug, optionId: selected }),
      });
      const body = await readJson(response);
      if (!response.ok) {
        setMessage(body.error ?? UNAVAILABLE);
        setPhase(response.status === 409 ? "closed" : "ready");
        return;
      }
      setData(body);
      if (body.myVote) setSelected(body.myVote);
      setPhase("voted");
      requestAnimationFrame(() => resultsHeading.current?.focus({ preventScroll: true }));
    } catch {
      setMessage(OFFLINE);
      setPhase("ready");
    }
  }

  // A closed poll whose results the hosts revealed shows them read-only.
  const showResults = phase === "voted" || (phase === "closed" && Array.isArray(data?.results));
  const locked = phase === "submitting" || phase === "closed" || phase === "unavailable";

  return (
    <section
      id={poll.anchor}
      aria-labelledby={titleId}
      className="mt-10 scroll-mt-24 rounded-xl border bg-card/70 p-5 shadow-lg sm:p-7 md:p-8"
    >
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-6">
        <div className="min-w-0 sm:flex-1">
          <p className="eyebrow">Architecture challenge</p>
          <h2 id={titleId} className="mt-2 text-2xl font-bold leading-tight md:text-3xl">
            <span aria-hidden="true">{poll.marker} </span>
            {poll.title}
          </h2>
          <p className="mt-2 text-muted-foreground">{poll.subtitle}</p>
        </div>
        <ShareButton poll={poll} />
      </div>

      <div className="mt-6 rounded-lg border-l-2 border-teal bg-background/50 px-4 py-4 sm:px-5">
        <p className="text-sm leading-relaxed text-muted-foreground">{poll.scenario.context}</p>
        <blockquote className="mt-2 text-base leading-relaxed text-foreground md:text-lg">
          “{poll.scenario.quote}”
        </blockquote>
      </div>

      {showResults ? (
        <Results poll={poll} data={data} myVote={data?.myVote ?? ""} headingRef={resultsHeading} />
      ) : (
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            void castVote();
          }}
        >
          <fieldset disabled={locked}>
            <legend className="text-lg font-semibold">{poll.scenario.question}</legend>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {poll.options.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border bg-background/40 p-4 transition-colors",
                    "hover:border-primary/70 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                    "has-[:disabled]:cursor-default has-[:disabled]:hover:border-border",
                    selected === option.id && "border-primary bg-primary/10",
                  )}
                >
                  <input
                    type="radio"
                    name={`${poll.anchor}-option`}
                    value={option.id}
                    checked={selected === option.id}
                    onChange={() => setSelected(option.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                      selected === option.id ? "border-primary" : "border-muted-foreground/60",
                    )}
                  >
                    {selected === option.id && (
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </span>
                  <span aria-hidden="true" className="text-xl leading-none">
                    {option.marker}
                  </span>
                  <span className="min-w-0 text-sm leading-snug sm:text-base">
                    <strong className="font-semibold">{option.letter}.</strong> {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-brand font-semibold text-primary-foreground hover:opacity-90"
              disabled={!selected || phase !== "ready"}
            >
              {phase === "submitting" || phase === "loading" ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Check aria-hidden="true" />
              )}
              {phase === "submitting"
                ? "Casting your vote…"
                : phase === "loading"
                  ? "Loading poll…"
                  : "Cast Your Vote"}
            </Button>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4 text-teal" aria-hidden="true" />
              Takes less than 30 seconds · anonymous · no sign-up
            </p>
          </div>
        </form>
      )}

      <div aria-live="polite" className="empty:hidden">
        {message && (
          <p
            role={phase === "unavailable" ? "alert" : undefined}
            className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
          >
            {message}
          </p>
        )}
        {phase === "closed" && !message && (
          <p className="mt-4 text-sm text-muted-foreground">
            This poll is closed. Thanks for being part of the conversation.
          </p>
        )}
      </div>
      {phase === "unavailable" && (
        <Button type="button" variant="outline" className="mt-3" onClick={() => void load()}>
          <RotateCcw aria-hidden="true" /> Try again
        </Button>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal hover:underline"
        >
          <Youtube className="h-4 w-4" aria-hidden="true" /> {poll.watchLabel}
        </a>
        <p className="text-xs text-muted-foreground">
          One anonymous vote per browser · real community results
        </p>
      </div>
    </section>
  );
}

function Results({
  poll,
  data,
  myVote,
  headingRef,
}: {
  poll: EpisodePollContent;
  data: PollResponse | null;
  myVote: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const counts = new Map((data?.results ?? []).map((result) => [result.optionId, result]));
  const hasResults = Array.isArray(data?.results);
  const total = data?.total ?? 0;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 ref={headingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
          {hasResults ? "Community results" : "Your vote is in"}
        </h3>
        {hasResults && (
          <p className="font-mono text-sm text-muted-foreground">
            {total.toLocaleString("en-US")} {total === 1 ? "vote" : "votes"}
          </p>
        )}
      </div>
      {data?.alreadyVoted && (
        <p className="mt-2 text-sm text-muted-foreground">
          You already voted from this browser — here’s how the community answered.
        </p>
      )}
      {hasResults ? (
        <ul className="mt-4 space-y-3" aria-label="Community results">
          {poll.options.map((option) => {
            const result = counts.get(option.id);
            const percent = result?.percent ?? 0;
            const count = result?.count ?? 0;
            const mine = option.id === myVote;
            return (
              <li
                key={option.id}
                className={cn(
                  "rounded-lg border px-4 py-3",
                  mine ? "border-primary bg-primary/10" : "bg-background/40",
                )}
              >
                <div className="flex items-start justify-between gap-3 text-sm sm:text-base">
                  <span className="min-w-0">
                    <span aria-hidden="true">{option.marker} </span>
                    <strong className="font-semibold">{option.letter}.</strong> {option.label}
                    {mine && (
                      <span className="ml-2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary/20 px-2 py-0.5 align-middle text-xs font-semibold text-primary">
                        <Check className="h-3 w-3" aria-hidden="true" /> Your choice
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-right">
                    <strong className="font-mono">{percent}%</strong>
                    <span className="block text-xs text-muted-foreground">
                      {count.toLocaleString("en-US")} {count === 1 ? "vote" : "votes"}
                    </span>
                  </span>
                </div>
                <div
                  className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted"
                  role="img"
                  aria-label={`${option.letter}: ${percent}% (${count} ${count === 1 ? "vote" : "votes"})`}
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none",
                      mine ? "bg-gradient-brand" : "bg-muted-foreground/50",
                    )}
                    style={{ width: grown ? `${percent}%` : "0%" }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks — community results will appear once the hosts reveal them.
        </p>
      )}

      <aside
        aria-labelledby={`${poll.anchor}-insight`}
        className="mt-6 rounded-lg border border-teal/40 bg-teal/5 p-5"
      >
        <h3 id={`${poll.anchor}-insight`} className="flex items-center gap-2 font-semibold">
          <Lightbulb className="h-5 w-5 text-teal" aria-hidden="true" />
          {poll.insight.title}
        </h3>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {poll.insight.points.map((point) => (
            <li key={point.text}>
              {point.lead && <strong className="text-foreground">{point.lead}</strong>} {point.text}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-semibold text-foreground">{poll.insight.takeaway}</p>
      </aside>
      <p className="mt-5 text-center text-base font-semibold text-gradient">{poll.closing}</p>
    </div>
  );
}

function ShareButton({ poll }: { poll: EpisodePollContent }) {
  const [status, setStatus] = useState("");

  async function share() {
    const payload = {
      title: `CodeShift — ${poll.title}`,
      text: poll.shareText,
      url: poll.shareUrl,
    };
    const touch = window.matchMedia?.("(pointer: coarse)").matches;
    if (touch && typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(poll.shareUrl);
      setStatus("Link copied!");
    } catch {
      setStatus(`Copy this link: ${poll.shareUrl}`);
    }
    window.setTimeout(() => setStatus(""), 4000);
  }

  return (
    <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
      <Button type="button" variant="outline" size="sm" onClick={() => void share()}>
        <Share2 aria-hidden="true" /> Share This Challenge
      </Button>
      <span role="status" className="max-w-64 break-all text-xs text-teal sm:text-right">
        {status}
      </span>
    </div>
  );
}
