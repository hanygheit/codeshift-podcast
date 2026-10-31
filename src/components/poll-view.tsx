import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

type PollOption = { id: string; label: string; description: string };
type PollResult = { optionId: string; count: number; percent: number };
type PollData = {
  id: string;
  slug: string;
  episodeNumber: number | null;
  title: string;
  question: string;
  options: PollOption[];
  status: "draft" | "live" | "closed";
  resultsRevealed: boolean;
};
type PollResponse = {
  poll: PollData | null;
  total?: number;
  results?: PollResult[];
  myVote?: string;
  error?: string;
};

export function PollView({ slug, hostMode = false }: { slug?: string; hostMode?: boolean }) {
  const [data, setData] = useState<PollResponse | null>(null);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (slug) params.set("slug", slug);
      if (hostMode) params.set("host", "1");
      const response = await fetch(`/api/polls${params.size ? `?${params}` : ""}`);
      const result = (await response.json()) as PollResponse;
      if (!response.ok) throw new Error(result.error ?? "Live poll is not available.");
      setData(result);
      setError("");
      if (result.myVote) setSelected(result.myVote);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Live poll is not available.");
    } finally {
      setLoading(false);
    }
  }, [hostMode, slug]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function submitVote() {
    if (!data?.poll || !selected || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "vote", slug: data.poll.slug, optionId: selected }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Your vote could not be submitted.");
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your vote could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  const poll = data?.poll;
  const resultsVisible = !!poll && (hostMode || poll.resultsRevealed);
  const resultMap = new Map((data?.results ?? []).map((result) => [result.optionId, result]));
  const leader = resultsVisible
    ? (data?.results ?? []).reduce<PollResult | null>(
        (best, result) => (!best || result.count > best.count ? result : best),
        null,
      )
    : null;

  return (
    <main className={`poll-page ${hostMode ? "poll-results-screen" : ""}`}>
      <header className="poll-brand">
        <Link to="/" className="poll-brand-name">
          CodeShift
        </Link>
        <span>Software Engineering in the AI Era</span>
      </header>
      {loading ? (
        <section className="poll-card poll-state" aria-live="polite">
          Loading live poll…
        </section>
      ) : error && !poll ? (
        <section className="poll-card poll-state" role="alert">
          <h1>Poll unavailable</h1>
          <p>{error}</p>
        </section>
      ) : !poll ? (
        <section className="poll-card poll-state">
          <span className="poll-eyebrow">CODESHIFT LIVE</span>
          <h1>No live poll right now. Check back during our next CodeShift episode!</h1>
        </section>
      ) : (
        <section className="poll-card">
          <div className="poll-heading">
            <div>
              <span className="poll-eyebrow">
                {poll.episodeNumber ? `EP${String(poll.episodeNumber).padStart(3, "0")} · ` : ""}
                {poll.status === "live" ? "LIVE POLL" : "ARCHIVED POLL"}
              </span>
              <h1>{poll.title}</h1>
            </div>
            <span className={`poll-status ${poll.status}`}>{poll.status}</span>
          </div>
          <h2 className="poll-question">{poll.question}</h2>
          {poll.status === "live" && !hostMode ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void submitVote();
              }}
            >
              <fieldset className="poll-options" disabled={submitting}>
                <legend className="sr-only">Choose one answer</legend>
                {poll.options.map((option) => (
                  <label
                    className={`poll-option ${selected === option.id ? "selected" : ""}`}
                    key={option.id}
                  >
                    <input
                      type="radio"
                      name="poll-option"
                      value={option.id}
                      checked={selected === option.id}
                      onChange={() => setSelected(option.id)}
                    />
                    <span className="poll-option-copy">
                      <strong>{option.label}</strong>
                      <span>{option.description}</span>
                    </span>
                    {resultsVisible && (
                      <span className="poll-inline-percent">
                        {resultMap.get(option.id)?.percent ?? 0}%
                      </span>
                    )}
                  </label>
                ))}
              </fieldset>
              {data?.myVote && !resultsVisible && (
                <p className="poll-thanks" role="status">
                  Thanks — your vote is in. You can change it while the poll is live.
                </p>
              )}
              {resultsVisible && (
                <PollResults
                  poll={poll}
                  resultMap={resultMap}
                  leader={leader}
                  total={data?.total ?? 0}
                />
              )}
              <button type="submit" className="poll-submit" disabled={!selected || submitting}>
                {submitting ? "Submitting…" : data?.myVote ? "Update my vote" : "Vote"}
              </button>
            </form>
          ) : poll.status === "live" && hostMode ? (
            <PollResults
              poll={poll}
              resultMap={resultMap}
              leader={leader}
              total={data?.total ?? 0}
            />
          ) : (
            <>
              <p className="poll-closed-message">
                This poll is closed. Thanks for being part of the conversation.
              </p>
              {resultsVisible && (
                <PollResults
                  poll={poll}
                  resultMap={resultMap}
                  leader={leader}
                  total={data?.total ?? 0}
                />
              )}
            </>
          )}
          {error && (
            <p className="poll-error" role="alert">
              {error}
            </p>
          )}
          {!hostMode && poll.status === "live" && !resultsVisible && !data?.myVote && (
            <p className="poll-privacy">
              One anonymous answer per browser. No name or account required.
            </p>
          )}
          {hostMode && (
            <p className="poll-privacy">
              Host view · results refresh automatically ·{" "}
              {poll.resultsRevealed ? "public results revealed" : "public results hidden"}
            </p>
          )}
        </section>
      )}
      {!hostMode && (
        <a className="poll-qr-link" href="/poll-qr.svg">
          Scan to Vote Live · permanent QR
        </a>
      )}
      {hostMode && (
        <Link className="poll-back-link" to="/admin/polls">
          Back to poll management
        </Link>
      )}
    </main>
  );
}

function PollResults({
  poll,
  resultMap,
  leader,
  total,
}: {
  poll: PollData;
  resultMap: Map<string, PollResult>;
  leader: PollResult | null;
  total: number;
}) {
  return (
    <section className="poll-results" aria-label="Poll results">
      <div className="poll-results-heading">
        <h3>Live results</h3>
        <strong>
          {total} {total === 1 ? "vote" : "votes"}
        </strong>
      </div>
      {poll.options.map((option) => {
        const result = resultMap.get(option.id);
        const percent = result?.percent ?? 0;
        const isLeader = !!leader && result?.count === leader.count && leader.count > 0;
        return (
          <div className={`poll-result ${isLeader ? "leader" : ""}`} key={option.id}>
            <div className="poll-result-label">
              <span>
                {option.label}
                {isLeader && <b> LEADING</b>}
              </span>
              <strong>
                {percent}% <small>({result?.count ?? 0})</small>
              </strong>
            </div>
            <div
              className="poll-result-track"
              role="progressbar"
              aria-label={`${option.label}: ${percent}%`}
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </section>
  );
}
