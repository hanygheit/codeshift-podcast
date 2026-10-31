import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

type Option = { id: string; label: string; description: string };
type Result = { optionId: string; count: number; percent: number };
type Poll = {
  id: string;
  slug: string;
  episodeNumber: number | null;
  title: string;
  question: string;
  options: Option[];
  status: "draft" | "live" | "closed";
  resultsRevealed: boolean;
};
type PollSummary = { poll: Poll; total: number; results?: Result[] };
type PollListResponse = { polls?: PollSummary[]; error?: string };

function optionsToText(options: Option[]) {
  return options.map((option) => `${option.label} | ${option.description}`).join("\n");
}

function textToOptions(value: string): Option[] {
  return value
    .split("\n")
    .map((line, index) => {
      const [label, ...description] = line.split("|");
      return {
        id: String.fromCharCode(97 + index),
        label: (label ?? "").trim(),
        description: description.join("|").trim(),
      };
    })
    .filter((option) => option.label);
}

export function PollAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState("");
  const [polls, setPolls] = useState<PollSummary[]>([]);
  const [selected, setSelected] = useState<Poll | null>(null);
  const [selectedVoteCount, setSelectedVoteCount] = useState(0);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [question, setQuestion] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadPolls = useCallback(async () => {
    try {
      const response = await fetch("/api/polls?admin=1");
      const result = (await response.json()) as PollListResponse;
      if (!response.ok) {
        setAuthenticated(false);
        if (response.status !== 401) setMessage(result.error ?? "Could not load polls.");
        return;
      }
      setAuthenticated(true);
      setPolls(result.polls ?? []);
      setMessage("");
    } catch (reason) {
      setMessage(
        reason instanceof Error ? reason.message : "Could not connect to poll management.",
      );
    }
  }, []);

  useEffect(() => {
    void loadPolls();
  }, [loadPolls]);

  function fillEditor(poll: Poll | null, voteCount = 0) {
    setSelected(poll);
    setSelectedVoteCount(voteCount);
    setTitle(poll?.title ?? "");
    setSlug(poll?.slug ?? "");
    setQuestion(poll?.question ?? "");
    setEpisodeNumber(poll?.episodeNumber ? String(poll.episodeNumber) : "");
    setOptionsText(poll ? optionsToText(poll.options) : "");
  }

  async function send(body: Record<string, unknown>) {
    const response = await fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await response.json()) as { poll?: Poll; error?: string };
    if (!response.ok) throw new Error(result.error ?? "The request could not be completed.");
    await loadPolls();
    return result;
  }

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await send({ operation: "admin-login", token });
      setToken("");
      await loadPolls();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const options = textToOptions(optionsText);
      const payload = {
        operation: selected ? "update" : "create",
        slug: selected ? undefined : slug,
        newSlug: selected ? slug : undefined,
        title,
        question,
        episodeNumber: episodeNumber ? Number(episodeNumber) : null,
        options,
      };
      const result = await send(selected ? payload : { ...payload, slug });
      if (result.poll) fillEditor(result.poll);
      setMessage("Poll saved as a draft.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "The poll could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function action(operation: string, poll: Poll) {
    setBusy(true);
    setMessage("");
    try {
      if (operation === "duplicate") {
        const result = await send({ operation, slug: poll.slug });
        if (result.poll) fillEditor(result.poll);
        setMessage("A reusable draft has been created.");
      } else {
        await send({ operation, slug: poll.slug });
        setMessage("Poll updated.");
      }
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "The poll could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await send({ operation: "admin-logout" });
      setAuthenticated(false);
      setPolls([]);
      fillEditor(null);
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Could not sign out.");
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Audience URL copied.");
    } catch {
      setMessage("Could not copy the URL. Select and copy it manually.");
    }
  }

  if (!authenticated)
    return (
      <main className="poll-admin-page">
        <div className="poll-admin-brand">
          <Link to="/">CodeShift</Link>
          <span>Host access</span>
        </div>
        <form className="poll-admin-card poll-login-card" onSubmit={(event) => void login(event)}>
          <span className="poll-eyebrow">POLL MANAGEMENT</span>
          <h1>Host sign in</h1>
          <p>Enter the host access token configured for this deployment.</p>
          <label className="poll-admin-label">
            Host access token
            <input
              type="password"
              autoComplete="current-password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
            />
          </label>
          <button className="poll-submit" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          {message && (
            <p className="poll-admin-message" role="alert">
              {message}
            </p>
          )}
        </form>
      </main>
    );

  return (
    <main className="poll-admin-page">
      <header className="poll-admin-brand">
        <Link to="/">CodeShift</Link>
        <span>Live poll management</span>
        <button
          type="button"
          className="poll-text-button"
          onClick={() => void logout()}
          disabled={busy}
        >
          Sign out
        </button>
      </header>
      <div className="poll-admin-layout">
        <section className="poll-admin-card">
          <div className="poll-admin-section-heading">
            <div>
              <span className="poll-eyebrow">YOUR POLLS</span>
              <h1>Manage live polls</h1>
            </div>
            <button
              type="button"
              className="poll-secondary-button"
              onClick={() => fillEditor(null)}
            >
              New poll
            </button>
          </div>
          <div className="poll-admin-list">
            {polls.length ? (
              polls.map(({ poll, total }) => (
                <article className="poll-admin-item" key={poll.id}>
                  <div className="poll-admin-item-heading">
                    <div>
                      <span className={`poll-status ${poll.status}`}>{poll.status}</span>
                      {poll.episodeNumber && (
                        <span className="poll-admin-episode">
                          EP{String(poll.episodeNumber).padStart(3, "0")}
                        </span>
                      )}
                    </div>
                    <span>
                      {total} {total === 1 ? "vote" : "votes"}
                    </span>
                  </div>
                  <h2>{poll.title}</h2>
                  <p>{poll.question}</p>
                  <code>/polls/{poll.slug}</code>
                  <div className="poll-admin-actions">
                    <button
                      type="button"
                      onClick={() =>
                        void copyUrl(
                          `${window.location.origin}${poll.status === "live" ? "/poll" : `/polls/${poll.slug}`}`,
                        )
                      }
                    >
                      {poll.status === "live" ? "Copy /poll URL" : "Copy poll URL"}
                    </button>
                    <Link
                      to="/polls/$slug/results"
                      params={{ slug: poll.slug }}
                      search={{ host: "true" }}
                    >
                      Host results
                    </Link>
                    <button type="button" onClick={() => void action("duplicate", poll)}>
                      Duplicate
                    </button>
                    <button type="button" onClick={() => fillEditor(poll, total)}>
                      Edit
                    </button>
                  </div>
                  <div className="poll-admin-actions poll-admin-primary-actions">
                    {poll.status !== "live" && (
                      <button type="button" onClick={() => void action("open", poll)}>
                        Open poll
                      </button>
                    )}
                    {poll.status === "live" && (
                      <button type="button" onClick={() => void action("close", poll)}>
                        Close poll
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void action(poll.resultsRevealed ? "hide" : "reveal", poll)}
                    >
                      {poll.resultsRevealed ? "Hide results" : "Reveal results"}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="poll-admin-empty">No polls yet. Create a draft to get started.</p>
            )}
          </div>
        </section>

        <aside className="poll-admin-card poll-admin-editor">
          <span className="poll-eyebrow">{selected ? "EDIT POLL" : "CREATE POLL"}</span>
          <h2>{selected ? "Poll details" : "New reusable poll"}</h2>
          {selected && selectedVoteCount > 0 && (
            <p className="poll-admin-warning">
              This poll has votes. Duplicate it to make a new version without changing historical
              votes.
            </p>
          )}
          <form onSubmit={(event) => void save(event)}>
            <label className="poll-admin-label">
              Poll title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={160}
              />
            </label>
            <label className="poll-admin-label">
              URL slug
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
              />
            </label>
            <label className="poll-admin-label">
              Episode number{" "}
              <input
                type="number"
                min="1"
                max="999"
                value={episodeNumber}
                onChange={(event) => setEpisodeNumber(event.target.value)}
              />
            </label>
            <label className="poll-admin-label">
              Question
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                required
                maxLength={500}
                rows={3}
              />
            </label>
            <label className="poll-admin-label">
              Answer choices <span>One per line: label | explanation</span>
              <textarea
                value={optionsText}
                onChange={(event) => setOptionsText(event.target.value)}
                required
                rows={7}
                placeholder={"Suggest code only | I implement the changes myself."}
              />
            </label>
            <button
              className="poll-submit"
              type="submit"
              disabled={busy || (!!selected && selectedVoteCount > 0)}
            >
              {busy ? "Saving…" : selected ? "Save changes" : "Create draft"}
            </button>
          </form>
          <div className="poll-admin-qr">
            <a href="/poll" aria-label="Open the permanent live poll URL">
              <img src="/poll-qr.svg" alt="Permanent QR code linking to the live poll" />
            </a>
            <div>
              <strong>Scan to Vote Live</strong>
              <span>Permanent audience link</span>
            </div>
            <button type="button" onClick={() => void copyUrl(`${window.location.origin}/poll`)}>
              Copy /poll URL
            </button>
          </div>
          {message && (
            <p className="poll-admin-message" role="status">
              {message}
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
