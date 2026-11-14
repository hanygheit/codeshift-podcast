import { calculatePollResults, type PollOptionResult } from "@/lib/poll-results";

/**
 * Browser client for always-open episode polls. Votes go straight to the database functions
 * `get_open_poll` / `cast_open_poll_vote` with the site's publishable key; the database enforces
 * one vote per browser token, valid options, open status and per-network caps, and returns
 * results only after voting. No server secret is involved.
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

type RawState = Omit<OpenPollState, "total" | "results"> & {
  counts?: { optionId: string; count: number }[];
};

const VOTER_KEY = "codeshift-poll-voter";
const TOKEN = /^[A-Za-z0-9-]{16,100}$/;
let memoryToken: string | undefined;

function newToken(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

/** Random per-browser voter token; kept in memory when storage is unavailable. */
export function voterToken(): string {
  try {
    const saved = window.localStorage.getItem(VOTER_KEY);
    if (saved && TOKEN.test(saved)) return saved;
  } catch {
    // Storage blocked (private mode, embedded browsers): fall back to this page's memory.
  }
  memoryToken ??= newToken();
  try {
    window.localStorage.setItem(VOTER_KEY, memoryToken);
  } catch {
    // Ignore; the in-memory token still allows one vote from this page.
  }
  return memoryToken;
}

export function toOpenPollError(
  error: { message?: string; code?: string } | null | undefined,
): OpenPollError {
  if (error instanceof OpenPollError) return error;
  const message = error?.message ?? "";
  // The poll tables/functions have not been created in the database yet.
  if (
    /PGRST20[25]|42P01|42883|Could not find the (function|table)/.test(`${error?.code} ${message}`)
  )
    return new OpenPollError("Community voting opens soon.", "not-ready");
  if (message.includes("poll_network_rate_limited"))
    return new OpenPollError(
      "Too many votes have come from your network recently. Please try again later.",
      "rate-limited",
    );
  if (message.includes("poll_not_open")) return new OpenPollError("This poll is closed.", "closed");
  if (message.includes("poll_invalid_option"))
    return new OpenPollError("Select a valid answer.", "invalid");
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

export function toOpenPollState(raw: unknown): OpenPollState {
  const { counts, ...state } = (raw ?? { poll: null }) as RawState;
  return Array.isArray(counts) ? { ...state, ...calculatePollResults(counts) } : state;
}

async function client() {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
}

export async function getOpenPoll(slug: string): Promise<OpenPollState> {
  let result;
  try {
    result = await (await client()).rpc("get_open_poll", { p_slug: slug, p_voter: voterToken() });
  } catch (error) {
    throw toOpenPollError(error instanceof Error ? error : null);
  }
  if (result.error) throw toOpenPollError(result.error);
  return toOpenPollState(result.data);
}

export async function castOpenPollVote(slug: string, optionId: string): Promise<OpenPollState> {
  let result;
  try {
    result = await (
      await client()
    ).rpc("cast_open_poll_vote", { p_slug: slug, p_option: optionId, p_voter: voterToken() });
  } catch (error) {
    throw toOpenPollError(error instanceof Error ? error : null);
  }
  if (result.error) throw toOpenPollError(result.error);
  return toOpenPollState(result.data);
}
