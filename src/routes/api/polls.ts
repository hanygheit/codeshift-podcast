import { createHmac, createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import type { Json, Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { calculatePollResults } from "@/lib/poll-results";

type Poll = Tables<"polls">;
type PollOption = { id: string; label: string; description: string };
type Result = { optionId: string; count: number; percent: number };
type Operation =
  | "vote"
  | "create"
  | "update"
  | "open"
  | "close"
  | "reveal"
  | "hide"
  | "duplicate"
  | "admin-login"
  | "admin-logout";

class PollInputError extends Error {}

const COOKIE_NAME = "codeshift_poll_voter";
const ADMIN_COOKIE_NAME = "codeshift_poll_admin";
const cookieAge = 60 * 60 * 24 * 365;
const adminCookieAge = 60 * 60 * 8;

function json(data: unknown, status = 200, headers?: HeadersInit): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Cache-Control", "no-store");
  return Response.json(data, { status, headers: responseHeaders });
}

function failure(message: string, status = 400) {
  return json({ error: message }, status);
}

function slugIsValid(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function parseOptions(value: unknown): PollOption[] | null {
  if (!Array.isArray(value) || value.length < 2 || value.length > 6) return null;
  const options: PollOption[] = [];
  for (const item of value) {
    if (
      !item ||
      typeof item !== "object" ||
      !("id" in item) ||
      !("label" in item) ||
      !("description" in item) ||
      typeof item.id !== "string" ||
      !/^[a-z0-9-]{1,32}$/.test(item.id) ||
      typeof item.label !== "string" ||
      !item.label.trim() ||
      item.label.length > 100 ||
      typeof item.description !== "string" ||
      item.description.length > 260
    )
      return null;
    options.push({ id: item.id, label: item.label.trim(), description: item.description.trim() });
  }
  return new Set(options.map((option) => option.id)).size === options.length ? options : null;
}

function jsonOptions(options: PollOption[]): Json {
  return options.map((option) => ({
    id: option.id,
    label: option.label,
    description: option.description,
  }));
}

function getVoterSecret(): string {
  const secret = process.env["POLL_VOTE_SECRET"];
  if (!secret || secret.length < 32)
    throw new Error("POLL_VOTE_SECRET must be configured with at least 32 characters.");
  return secret;
}

function issueVoterCookie(request: Request): { value: string; cookie?: string } {
  const secret = getVoterSecret();
  const existing = request.headers
    .get("cookie")
    ?.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))?.[1];
  if (existing) {
    const [id, signature] = existing.split(".");
    if (id && signature) {
      const expected = createHmac("sha256", secret).update(id).digest("hex");
      const actual = Buffer.from(signature, "hex");
      const expectedBytes = Buffer.from(expected, "hex");
      if (actual.length === expectedBytes.length && timingSafeEqual(actual, expectedBytes))
        return { value: id };
    }
  }

  const id = randomUUID();
  const signature = createHmac("sha256", secret).update(id).digest("hex");
  const secure = process.env["NODE_ENV"] === "production" ? "; Secure" : "";
  return {
    value: id,
    cookie: `${COOKIE_NAME}=${id}.${signature}; Path=/; Max-Age=${cookieAge}; HttpOnly; SameSite=Lax${secure}`,
  };
}

function isAuthorized(request: Request): boolean {
  const secret = process.env["POLL_ADMIN_TOKEN"];
  if (!secret || secret.length < 32) return false;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (tokensMatch(supplied, secret)) return true;
  const cookie = request.headers
    .get("cookie")
    ?.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`))?.[1];
  if (!cookie) return false;
  const [expires, signature] = cookie.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < Date.now())
    return false;
  const expected = createHmac("sha256", secret).update(expires).digest("hex");
  const actualBytes = Buffer.from(signature, "hex");
  const expectedBytes = Buffer.from(expected, "hex");
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

function tokensMatch(supplied: string, expected: string): boolean {
  return timingSafeEqual(
    createHash("sha256").update(supplied).digest(),
    createHash("sha256").update(expected).digest(),
  );
}

function adminCookie(token: string): string | null {
  const secret = process.env["POLL_ADMIN_TOKEN"];
  if (!secret || secret.length < 32 || !tokensMatch(token, secret)) return null;
  const expires = String(Date.now() + adminCookieAge * 1000);
  const signature = createHmac("sha256", secret).update(expires).digest("hex");
  const secure = process.env["NODE_ENV"] === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=${expires}.${signature}; Path=/; Max-Age=${adminCookieAge}; HttpOnly; SameSite=Strict${secure}`;
}

async function getPollsClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function countVotes(pollId: string): Promise<{ results: Result[]; total: number }> {
  const db = await getPollsClient();
  const { data, error } = await db.rpc("poll_result_counts", { p_poll_id: pollId });
  if (error) throw error;
  return calculatePollResults(
    (data ?? []).map((row) => ({ optionId: row.option_id, count: row.vote_count })),
  );
}

async function pollView(poll: Poll, host: boolean, participantHash?: string) {
  const options = parseOptions(poll.options);
  if (!options) throw new Error("Poll options are invalid.");
  const { results, total } = await countVotes(poll.id);
  let myVote: string | null = null;
  if (participantHash) {
    const db = await getPollsClient();
    const { data, error } = await db
      .from("poll_votes")
      .select("option_id")
      .eq("poll_id", poll.id)
      .eq("participant_hash", participantHash)
      .maybeSingle();
    if (error) throw error;
    myVote = data?.option_id ?? null;
  }
  return {
    poll: {
      id: poll.id,
      slug: poll.slug,
      episodeNumber: poll.episode_number,
      title: poll.title,
      question: poll.question,
      options,
      status: poll.status,
      resultsRevealed: poll.results_revealed,
      updatedAt: poll.updated_at,
    },
    ...(host || poll.results_revealed ? { total, results } : {}),
    ...(myVote ? { myVote } : {}),
  };
}

async function runGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const host = url.searchParams.get("admin") === "1" || url.searchParams.get("host") === "1";
  if (host && !isAuthorized(request)) return failure("Host authorization is required.", 401);

  const db = await getPollsClient();
  if (url.searchParams.get("admin") === "1") {
    const { data, error } = await db
      .from("polls")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    const polls = await Promise.all((data ?? []).map((poll) => pollView(poll, true)));
    return json({ polls });
  }

  const slug = url.searchParams.get("slug");
  const query = db.from("polls").select("*");
  const { data, error } = slug
    ? await query.eq("slug", slug).maybeSingle()
    : await query.eq("status", "live").maybeSingle();
  if (error) throw error;

  const voter = issueVoterCookie(request);
  if (!data)
    return json({ poll: null }, 200, voter.cookie ? { "Set-Cookie": voter.cookie } : undefined);

  const participantHash = createHmac("sha256", getVoterSecret()).update(voter.value).digest("hex");
  const view = await pollView(data, host, participantHash);
  return json(view, 200, voter.cookie ? { "Set-Cookie": voter.cookie } : undefined);
}

function isText(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.length <= max;
}

async function createPoll(input: Record<string, unknown>, source?: Poll): Promise<Poll> {
  const options = parseOptions(input["options"] ?? source?.options);
  const title = input["title"] ?? (source ? `${source.title} (Copy)` : undefined);
  const question = input["question"] ?? source?.question;
  const slug = input["slug"];
  const episode = input["episodeNumber"] ?? source?.episode_number ?? null;
  if (!isText(title, 1, 160) || !isText(question, 1, 500) || !options)
    throw new PollInputError("Provide a title, question, and 2–6 valid choices.");
  if (!slugIsValid(slug)) throw new PollInputError("Use a lowercase, hyphenated poll URL slug.");
  if (
    episode !== null &&
    (typeof episode !== "number" || !Number.isInteger(episode) || episode < 1 || episode > 999)
  )
    throw new PollInputError("Episode number must be between 1 and 999.");

  const db = await getPollsClient();
  const row: TablesInsert<"polls"> = {
    slug,
    episode_number: episode,
    title: title.trim(),
    question: question.trim(),
    options: jsonOptions(options),
    status: "draft",
    results_revealed: false,
  };
  const { data, error } = await db.from("polls").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

async function runPost(request: Request): Promise<Response> {
  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin || requestOrigin !== new URL(request.url).origin)
    return failure("Requests must come from this site.", 403);
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return failure("Invalid request body.");
    body = parsed as Record<string, unknown>;
  } catch {
    return failure("Invalid request body.");
  }

  const operation = body["operation"] as Operation;
  if (operation === "admin-login") {
    if (typeof body["token"] !== "string") return failure("Enter the host access token.", 401);
    const cookie = adminCookie(body["token"]);
    return cookie
      ? json({ authenticated: true }, 200, { "Set-Cookie": cookie })
      : failure("The host access token is incorrect or not configured.", 401);
  }
  if (operation === "admin-logout") {
    const secure = process.env["NODE_ENV"] === "production" ? "; Secure" : "";
    return json({ authenticated: false }, 200, {
      "Set-Cookie": `${ADMIN_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${secure}`,
    });
  }
  if (operation === "vote") {
    let voter: ReturnType<typeof issueVoterCookie>;
    try {
      voter = issueVoterCookie(request);
    } catch (error) {
      return failure(error instanceof Error ? error.message : "Voting is not configured.", 503);
    }
    const slug = body["slug"];
    const optionId = body["optionId"];
    if (!slugIsValid(slug) || typeof optionId !== "string")
      return failure("Select a valid answer.");
    const secret = getVoterSecret();
    const participantHash = createHmac("sha256", secret).update(voter.value).digest("hex");
    const db = await getPollsClient();
    const { data: poll, error: pollError } = await db
      .from("polls")
      .select("*")
      .eq("slug", slug)
      .eq("status", "live")
      .maybeSingle();
    if (pollError) throw pollError;
    if (!poll) return failure("This poll is closed.", 409);
    const options = parseOptions(poll.options);
    if (!options?.some((option) => option.id === optionId))
      return failure("Select a valid answer.");

    const { error } = await db.from("poll_votes").upsert(
      {
        poll_id: poll.id,
        participant_hash: participantHash,
        option_id: optionId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "poll_id,participant_hash" },
    );
    if (error) throw error;
    return json({ voted: true }, 200, voter.cookie ? { "Set-Cookie": voter.cookie } : undefined);
  }

  if (!isAuthorized(request)) return failure("Host authorization is required.", 401);
  if (!isText(body["operation"], 1, 20)) return failure("Unknown poll action.");

  const db = await getPollsClient();
  const slug = body["slug"];
  try {
    if (operation === "create") return json({ poll: await createPoll(body) }, 201);
    if (operation === "duplicate") {
      if (typeof slug !== "string") return failure("Choose a poll to duplicate.");
      const { data: source, error } = await db.from("polls").select("*").eq("slug", slug).single();
      if (error) throw error;
      return json(
        {
          poll: await createPoll(
            { ...body, slug: `${source.slug}-copy-${Date.now().toString(36)}` },
            source,
          ),
        },
        201,
      );
    }
    if (!slugIsValid(slug)) return failure("Choose a valid poll.");
    const { data: poll, error: findError } = await db
      .from("polls")
      .select("*")
      .eq("slug", slug)
      .single();
    if (findError) throw findError;

    if (operation === "open") {
      const { error: closeError } = await db
        .from("polls")
        .update({ status: "closed", updated_at: new Date().toISOString() })
        .eq("status", "live")
        .neq("id", poll.id);
      if (closeError) throw closeError;
      const { data, error } = await db
        .from("polls")
        .update({ status: "live", updated_at: new Date().toISOString() })
        .eq("id", poll.id)
        .select("*")
        .single();
      if (error) throw error;
      return json({ poll: data });
    }
    if (operation === "close" || operation === "reveal" || operation === "hide") {
      const update: TablesUpdate<"polls"> =
        operation === "close" ? { status: "closed" } : { results_revealed: operation === "reveal" };
      const { data, error } = await db
        .from("polls")
        .update({ ...update, updated_at: new Date().toISOString() })
        .eq("id", poll.id)
        .select("*")
        .single();
      if (error) throw error;
      return json({ poll: data });
    }
    if (operation === "update") {
      const { count, error: countError } = await db
        .from("poll_votes")
        .select("id", { count: "exact", head: true })
        .eq("poll_id", poll.id);
      if (countError) throw countError;
      if ((count ?? 0) > 0)
        return failure("This poll has votes. Duplicate it to change its question or choices.", 409);
      const options = parseOptions(body["options"]);
      if (
        !isText(body["title"], 1, 160) ||
        !isText(body["question"], 1, 500) ||
        !options ||
        !slugIsValid(body["newSlug"])
      )
        return failure("Provide a valid title, question, slug, and 2–6 choices.");
      const episode = body["episodeNumber"] ?? null;
      if (
        episode !== null &&
        (typeof episode !== "number" || !Number.isInteger(episode) || episode < 1 || episode > 999)
      )
        return failure("Episode number must be between 1 and 999.");
      const changes: TablesUpdate<"polls"> = {
        slug: body["newSlug"],
        episode_number: episode,
        title: body["title"].trim(),
        question: body["question"].trim(),
        options: jsonOptions(options),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await db
        .from("polls")
        .update(changes)
        .eq("id", poll.id)
        .select("*")
        .single();
      if (error) throw error;
      return json({ poll: data });
    }
    return failure("Unknown poll action.");
  } catch (error) {
    if (error instanceof PollInputError) return failure(error.message);
    if (error && typeof error === "object" && "code" in error && error.code === "23505")
      return failure("That poll slug is already in use, or another poll is live.", 409);
    if (error && typeof error === "object" && "code" in error && error.code === "PGRST116")
      return failure("The requested poll was not found.", 404);
    console.error("Poll management request failed", error);
    return failure(
      "The poll could not be saved. Check the server configuration and try again.",
      500,
    );
  }
}

export const Route = createFileRoute("/api/polls")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return await runGet(request);
        } catch (error) {
          console.error("Poll read failed", error);
          return failure(
            "Live polls are not available right now. Check the server configuration.",
            503,
          );
        }
      },
      POST: async ({ request }) => {
        try {
          return await runPost(request);
        } catch (error) {
          if (error && typeof error === "object" && "code" in error && error.code === "P0001")
            return failure("Please wait a moment before submitting again.", 429);
          console.error("Poll submission failed", error);
          return failure(
            "Your request could not be completed. Check the server configuration.",
            503,
          );
        }
      },
    },
  },
});
