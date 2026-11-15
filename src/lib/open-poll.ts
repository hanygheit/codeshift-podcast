import type { PollOptionResult } from "@/lib/poll-results";

/**
 * Browser client for always-open episode polls. Votes go through `/api/polls`, which stores them
 * server-side (see episode-poll-store.server.ts): one vote per browser, per-network caps, community
 * results are never sent to visitors, only to hosts who enter the results PIN. When the server has no vote store configured it
 * answers `notReady`, and the page falls back to its insight-only mode.
 */
export type OpenPollStatus = "draft" | "live" | "open" | "closed";
export type OpenPollState = {
  poll: { slug: string; status: OpenPollStatus } | null;
  myVote?: string;
  total?: number;
  results?: PollOptionResult[];
  voted?: boolean;
  alreadyVoted?: boolean;
};
export type OpenPollErrorKind =
  "closed" | "rate-limited" | "invalid" | "offline" | "not-ready" | "unavailable";

export class OpenPollError extends Error {
  constructor(
    message: string,
    readonly kind: OpenPollErrorKind,
  ) {
    super(message);
  }
}

type Reply = OpenPollState & { notReady?: boolean; error?: string; code?: string };

export function toOpenPollError(
  error:
    | { message?: string | undefined; code?: string | undefined; status?: number | undefined }
    | null
    | undefined,
): OpenPollError {
  if (error instanceof OpenPollError) return error;
  const message = error?.message ?? "";
  const code = error?.code ?? "";
  if (code === "not_ready") return new OpenPollError("Community voting opens soon.", "not-ready");
  if (code === "rate_limited" || error?.status === 429)
    return new OpenPollError(
      message || "Too many votes have come from your network recently. Please try again later.",
      "rate-limited",
    );
  if (code === "closed" || error?.status === 409)
    return new OpenPollError("This poll is closed.", "closed");
  if (code === "invalid_option") return new OpenPollError("Select a valid answer.", "invalid");
  if (/fetch|network|load failed/i.test(message))
    return new OpenPollError(
      "We couldn’t reach the server. Check your connection and try again.",
      "offline",
    );
  return new OpenPollError(
    "Voting is temporarily unavailable. Please try again in a moment.",
    "unavailable",
  );
}

async function request(init?: RequestInit, query = ""): Promise<OpenPollState> {
  let response: Response;
  try {
    response = await fetch(`/api/polls${query}`, { cache: "no-store", ...init });
  } catch (error) {
    throw toOpenPollError(error instanceof Error ? error : { message: "network" });
  }
  let reply: Reply;
  try {
    reply = (await response.json()) as Reply;
  } catch {
    reply = { poll: null };
  }
  if (!response.ok)
    throw toOpenPollError({ message: reply.error, code: reply.code, status: response.status });
  if (reply.notReady) throw toOpenPollError({ code: "not_ready" });
  const { notReady: _notReady, error: _error, code: _code, ...state } = reply;
  return state;
}

export function getOpenPoll(slug: string): Promise<OpenPollState> {
  return request(undefined, `?episodePoll=${encodeURIComponent(slug)}`);
}

export function castOpenPollVote(slug: string, optionId: string): Promise<OpenPollState> {
  return request({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation: "episode-vote", slug, optionId }),
  });
}

export type HostResults = { total: number; results: PollOptionResult[] };

/** Host-only: real community results, released by the server for the correct PIN. */
export async function getHostResults(slug: string, pin: string): Promise<HostResults> {
  let response: Response;
  try {
    response = await fetch("/api/polls", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "episode-results", slug, pin }),
    });
  } catch {
    throw new OpenPollError("We couldn’t reach the server. Try again.", "offline");
  }
  const reply = (await response.json().catch(() => ({}))) as Partial<HostResults> & {
    notReady?: boolean;
  };
  if (response.status === 401) throw new OpenPollError("That PIN is not correct.", "invalid");
  if (!response.ok || reply.notReady || !Array.isArray(reply.results))
    throw new OpenPollError("Results are not available right now.", "unavailable");
  return { total: reply.total ?? 0, results: reply.results };
}
