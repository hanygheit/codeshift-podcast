import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Check,
  Lightbulb,
  Loader2,
  RotateCcw,
  Share2,
  Timer,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EpisodePoll as EpisodePollContent } from "@/content/episode-polls";
import {
  castOpenPollVote,
  getHostResults,
  getOpenPoll,
  type HostResults,
  type OpenPollState as PollResponse,
  toOpenPollError,
} from "@/lib/open-poll";
import { cn } from "@/lib/utils";

// "preview"/"previewed": the poll database is not set up yet, so an answer reveals the insight
// only — nothing is recorded and no community results are shown until voting opens.
type Phase =
  "loading" | "ready" | "submitting" | "voted" | "closed" | "unavailable" | "preview" | "previewed";

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
      const body = await getOpenPoll(poll.slug);
      if (!body.poll) {
        setMessage("This poll isn’t open yet. Please check back soon.");
        setPhase("unavailable");
        return;
      }
      setData(body);
      if (body.myVote) setSelected(body.myVote);
      // Votes from the episode page are accepted only while the poll is "open".
      setPhase(body.myVote ? "voted" : body.poll.status === "open" ? "ready" : "closed");
    } catch (error) {
      const failure = toOpenPollError(error as { message?: string; code?: string } | null);
      if (failure.kind === "not-ready") {
        setPhase("preview");
        return;
      }
      setMessage(failure.message);
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
    if (selected && phase === "preview") {
      setPhase("previewed");
      requestAnimationFrame(() => resultsHeading.current?.focus({ preventScroll: true }));
      return;
    }
    if (!selected || phase !== "ready") return;
    setPhase("submitting");
    setMessage("");
    try {
      const body = await castOpenPollVote(poll.slug, selected);
      setData(body);
      if (body.myVote) setSelected(body.myVote);
      setPhase("voted");
      requestAnimationFrame(() => resultsHeading.current?.focus({ preventScroll: true }));
    } catch (error) {
      const failure = toOpenPollError(error instanceof Error ? error : null);
      if (failure.kind === "not-ready") {
        setPhase("previewed");
        return;
      }
      setMessage(failure.message);
      setPhase(failure.kind === "closed" ? "closed" : "ready");
    }
  }

  // A closed poll whose results the hosts revealed shows them read-only.
  const showResults = phase === "voted" || phase === "previewed";
  const accepting = phase === "ready" || phase === "preview";
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
        <Results
          poll={poll}
          data={phase === "previewed" ? null : data}
          myVote={phase === "previewed" ? selected : (data?.myVote ?? "")}
          preview={phase === "previewed"}
          headingRef={resultsHeading}
        />
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
              disabled={!selected || !accepting}
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
                  : phase === "preview"
                    ? "Reveal the Insight"
                    : "Cast Your Vote"}
            </Button>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4 text-teal" aria-hidden="true" />
              {phase === "preview"
                ? "Community voting opens soon · pick an answer to see the insight"
                : "Takes less than 30 seconds · anonymous · no sign-up"}
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
        <p className="text-xs text-muted-foreground">One anonymous vote per browser</p>
        <HostResultsPanel poll={poll} />
      </div>
    </section>
  );
}

function Results({
  poll,
  data,
  myVote,
  preview = false,
  headingRef,
}: {
  poll: EpisodePollContent;
  data: PollResponse | null;
  myVote: string;
  preview?: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const chosen = poll.options.find((option) => option.id === myVote);
  const best = poll.options.find((option) => option.id === poll.bestOptionId);
  const choseBest = !!chosen && chosen.id === best?.id;

  return (
    <div className="mt-6">
      {chosen && (
        <div className="rounded-lg border border-primary/60 bg-primary/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {data?.alreadyVoted ? "You already chose" : "You chose"}
          </p>
          <p className="mt-1 font-semibold sm:text-lg">
            <span aria-hidden="true">{chosen.marker} </span>
            {chosen.letter}. {chosen.label}
          </p>
          <h3
            ref={headingRef}
            tabIndex={-1}
            className="mt-4 text-xl font-bold leading-snug outline-none md:text-2xl"
          >
            {chosen.feedback.headline}
          </h3>
          <p className="mt-2 leading-relaxed text-muted-foreground">{chosen.feedback.body}</p>
        </div>
      )}

      {best && (
        <div className="mt-4 rounded-lg border border-teal/60 bg-teal/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal">
            {choseBest ? "You picked the best answer" : "The best answer"}
          </p>
          <p className="mt-1 font-semibold sm:text-lg">
            <span aria-hidden="true">{best.marker} </span>
            {best.letter}. {best.label}
          </p>
          {!choseBest && (
            <p className="mt-2 leading-relaxed text-muted-foreground">{best.feedback.body}</p>
          )}
        </div>
      )}

      <aside
        aria-labelledby={`${poll.anchor}-insight`}
        className="mt-6 rounded-lg border border-teal/40 bg-teal/5 p-5"
      >
        <h3 id={`${poll.anchor}-insight`} className="flex items-center gap-2 font-semibold">
          <Lightbulb className="h-5 w-5 text-teal" aria-hidden="true" />
          {poll.insight.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {poll.insight.intro}
        </p>
        <ul className="mt-4 space-y-3" aria-label="Insight for each option">
          {poll.options.map((option) => (
            <li
              key={option.id}
              className={cn(
                "rounded-md border px-4 py-3 text-sm leading-relaxed sm:text-base",
                option.id === myVote ? "border-primary/60 bg-primary/5" : "bg-background/40",
              )}
            >
              <p className="font-semibold text-foreground">
                <span aria-hidden="true">{option.marker} </span>
                {option.letter}. {option.label}
                {option.id === best?.id && (
                  <span className="ml-2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-teal/20 px-2 py-0.5 align-middle text-xs font-semibold text-teal">
                    <Check className="h-3 w-3" aria-hidden="true" /> Best answer
                  </span>
                )}
                {option.id === myVote && (
                  <span className="ml-2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary/20 px-2 py-0.5 align-middle text-xs font-semibold text-primary">
                    <Check className="h-3 w-3" aria-hidden="true" /> Your choice
                  </span>
                )}
              </p>
              <p className="mt-1 text-muted-foreground">{option.insight}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-semibold text-foreground">{poll.insight.takeaway}</p>
      </aside>
      <p className="mt-5 text-center text-base font-semibold text-gradient">{poll.closing}</p>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        {preview
          ? "Voting isn’t open yet, so this answer wasn’t counted."
          : "Thanks — your vote is counted. The hosts will share the community results."}
      </p>
    </div>
  );
}

/** Hosts only: the server releases the real community results for the correct PIN. */
function HostResultsPanel({ poll }: { poll: EpisodePollContent }) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<HostResults | null>(null);

  async function load() {
    if (!pin || busy) return;
    setBusy(true);
    setError("");
    try {
      setResults(await getHostResults(poll.slug, pin));
    } catch (reason) {
      setResults(null);
      setError(reason instanceof Error ? reason.message : "Results are not available right now.");
    } finally {
      setBusy(false);
    }
  }

  if (!open)
    return (
      <button
        type="button"
        className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        onClick={() => setOpen(true)}
      >
        Host results
      </button>
    );

  const counts = new Map((results?.results ?? []).map((result) => [result.optionId, result]));
  return (
    <div className="w-full rounded-lg border bg-background/50 p-4">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void load();
        }}
      >
        <label className="text-sm font-semibold">
          Host PIN
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            className="mt-1 block h-9 w-28 rounded-md border bg-background px-3 text-base"
          />
        </label>
        <Button type="submit" size="sm" disabled={!pin || busy}>
          <BarChart3 aria-hidden="true" />
          {busy ? "Loading…" : results ? "Refresh results" : "Show results"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Hide
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {results && (
        <>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            {results.total.toLocaleString("en-US")} {results.total === 1 ? "vote" : "votes"}
          </p>
          <ul className="mt-3 space-y-3" aria-label="Community results">
            {poll.options.map((option) => {
              const percent = counts.get(option.id)?.percent ?? 0;
              const count = counts.get(option.id)?.count ?? 0;
              return (
                <li key={option.id} className="rounded-lg border bg-background/40 px-4 py-3">
                  <div className="flex items-start justify-between gap-3 text-sm sm:text-base">
                    <span className="min-w-0">
                      <span aria-hidden="true">{option.marker} </span>
                      <strong className="font-semibold">{option.letter}.</strong> {option.label}
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
                      className="h-full rounded-full bg-gradient-brand"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
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
