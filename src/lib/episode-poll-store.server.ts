import { createHash, createHmac, randomUUID } from "node:crypto";
import { EPISODE_POLLS, type EpisodePoll } from "@/content/episode-polls";
import { networkOf } from "@/lib/poll-network";
import { calculatePollResults } from "@/lib/poll-results";

/**
 * Vote store for always-open episode polls (EP004 #architecture-poll), kept in a private
 * Supabase Storage bucket through the server's built-in service-role connection, so it needs no
 * database tables, no SQL migration and no extra secret.
 *
 * Layout inside the bucket, per poll slug:
 *   <slug>/voters/<participant>              one object per browser; created with upsert=false,
 *                                            so a second vote from the same browser is refused
 *   <slug>/options/<optionId>/<participant>  one object per vote; results = object counts
 *   <slug>/networks/<day>/<network>/<participant>  per-network caps (burst + daily)
 * <participant> and <network> are keyed hashes; raw cookies and IP addresses are never stored.
 * The bucket is private: visitors cannot read or write it directly, only through /api/polls.
 */
export const VOTES_BUCKET = "episode-poll-votes";
export const VOTER_COOKIE = "codeshift_episode_voter";
const COOKIE_AGE = 60 * 60 * 24 * 365;
const BURST_WINDOW_MS = 10 * 60 * 1000;
const BURST_LIMIT = 15;
const DAILY_LIMIT = 100;
const PAGE = 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type StoredObject = { name: string; created_at?: string | null };
export interface VoteStorage {
  /** Creates the object; "exists" when the path is already taken (atomic). */
  create(path: string): Promise<"created" | "exists">;
  /** Objects directly inside `prefix`, optionally only names containing `search`. */
  list(
    prefix: string,
    options: { limit: number; offset: number; search?: string },
  ): Promise<StoredObject[]>;
}

export type EpisodePollReply = {
  status: number;
  body: Record<string, unknown>;
  setCookie?: string | undefined;
};

function voter(request: Request): { token: string; setCookie?: string | undefined } {
  const existing = request.headers
    .get("cookie")
    ?.match(new RegExp(`(?:^|;\\s*)${VOTER_COOKIE}=([^;]+)`))?.[1];
  if (existing && UUID.test(existing)) return { token: existing };
  const token = randomUUID();
  const secure = process.env["NODE_ENV"] === "production" ? "; Secure" : "";
  return {
    token,
    setCookie: `${VOTER_COOKIE}=${token}; Path=/; Max-Age=${COOKIE_AGE}; HttpOnly; SameSite=Lax${secure}`,
  };
}

function clientAddress(request: Request): string | null {
  const header =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0];
  return header?.trim().toLowerCase() || null;
}

const visible = (objects: StoredObject[]) => objects.filter((o) => !o.name.startsWith("."));

async function listAll(storage: VoteStorage, prefix: string): Promise<StoredObject[]> {
  const all: StoredObject[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const page = await storage.list(prefix, { limit: PAGE, offset });
    all.push(...visible(page));
    if (page.length < PAGE) return all;
  }
}

export class EpisodePollStore {
  private readonly key: Buffer;

  constructor(
    private readonly storage: VoteStorage,
    /** Server-only secret the deployment already has (the service-role key); never exposed. */
    serverKey: string,
    private readonly now: () => Date = () => new Date(),
  ) {
    this.key = createHash("sha256").update(`codeshift-episode-poll:${serverKey}`).digest();
  }

  private hash(value: string): string {
    return createHmac("sha256", this.key).update(value).digest("hex");
  }

  private async hasVoted(slug: string, participant: string): Promise<boolean> {
    const found = await this.storage.list(`${slug}/voters`, {
      limit: 1,
      offset: 0,
      search: participant,
    });
    return visible(found).some((o) => o.name === participant);
  }

  /** Real counts plus the participant's own option, read from the per-option folders. */
  private async results(poll: EpisodePoll, participant: string) {
    const folders = await Promise.all(
      poll.options.map(async (option) => ({
        optionId: option.id,
        objects: await listAll(this.storage, `${poll.slug}/options/${option.id}`),
      })),
    );
    const myVote = folders.find((f) => f.objects.some((o) => o.name === participant))?.optionId;
    const counts = folders
      .filter((f) => f.objects.length > 0)
      .map((f) => ({ optionId: f.optionId, count: f.objects.length }));
    return { ...(myVote ? { myVote } : {}), ...calculatePollResults(counts) };
  }

  async state(request: Request, slug: string): Promise<EpisodePollReply> {
    const poll = findPoll(slug);
    if (!poll) return { status: 404, body: { error: "Unknown poll.", code: "unknown_poll" } };
    const { token, setCookie } = voter(request);
    const participant = this.hash(`voter:${token}`);
    const body: Record<string, unknown> = { poll: { slug: poll.slug, status: "open" } };
    if (!setCookie && (await this.hasVoted(poll.slug, participant)))
      Object.assign(body, await this.results(poll, participant));
    return { status: 200, body, setCookie };
  }

  async vote(request: Request, slug: unknown, optionId: unknown): Promise<EpisodePollReply> {
    const poll = typeof slug === "string" ? findPoll(slug) : undefined;
    if (!poll) return { status: 404, body: { error: "Unknown poll.", code: "unknown_poll" } };
    if (!poll.options.some((option) => option.id === optionId) || typeof optionId !== "string")
      return { status: 400, body: { error: "Select a valid answer.", code: "invalid_option" } };

    const { token, setCookie } = voter(request);
    const participant = this.hash(`voter:${token}`);
    const reply = async (flag: "voted" | "alreadyVoted"): Promise<EpisodePollReply> => ({
      status: 200,
      body: {
        poll: { slug: poll.slug, status: "open" },
        ...(await this.results(poll, participant)),
        [flag]: true,
      },
      setCookie,
    });

    if (!setCookie && (await this.hasVoted(poll.slug, participant))) return reply("alreadyVoted");

    const address = clientAddress(request);
    let networkFolder: string | undefined;
    if (address) {
      const now = this.now();
      const day = now.toISOString().slice(0, 10);
      networkFolder = `${poll.slug}/networks/${day}/${this.hash(`network:${day}:${networkOf(address)}`)}`;
      const recent = visible(
        await this.storage.list(networkFolder, { limit: DAILY_LIMIT + 1, offset: 0 }),
      );
      const burst = recent.filter(
        (o) => o.created_at && now.getTime() - Date.parse(o.created_at) < BURST_WINDOW_MS,
      ).length;
      if (recent.length >= DAILY_LIMIT || burst >= BURST_LIMIT)
        return {
          status: 429,
          body: {
            error: "Too many votes have come from your network recently. Please try again later.",
            code: "rate_limited",
          },
          setCookie,
        };
    }

    // The voter object is the lock: only the first request for this browser can create it.
    if ((await this.storage.create(`${poll.slug}/voters/${participant}`)) === "exists")
      return reply("alreadyVoted");
    await this.storage.create(`${poll.slug}/options/${optionId}/${participant}`);
    if (networkFolder) await this.storage.create(`${networkFolder}/${participant}`);
    return reply("voted");
  }
}

function findPoll(slug: string): EpisodePoll | undefined {
  return Object.values(EPISODE_POLLS).find((poll) => poll.slug === slug);
}

type StorageErrorLike = {
  message?: string | undefined;
  status?: number | undefined;
  statusCode?: string | undefined;
} | null;
const isDuplicate = (e: StorageErrorLike) =>
  !!e &&
  (e.status === 409 || e.statusCode === "409" || /already exists|duplicate/i.test(e.message ?? ""));
const isMissingBucket = (e: StorageErrorLike) => !!e && /bucket not found/i.test(e.message ?? "");

/** Store backed by the deployment's Supabase service-role connection; null when not configured. */
export async function supabaseEpisodePollStore(): Promise<EpisodePollStore | null> {
  const serverKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!process.env["SUPABASE_URL"] || !serverKey) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const bucket = () => supabaseAdmin.storage.from(VOTES_BUCKET);
  const ensureBucket = async () => {
    const { error } = await supabaseAdmin.storage.createBucket(VOTES_BUCKET, { public: false });
    if (error && !isDuplicate(error)) throw error;
  };
  async function withBucket<T>(run: () => Promise<{ data: T; error: StorageErrorLike }>) {
    let result = await run();
    if (isMissingBucket(result.error)) {
      await ensureBucket();
      result = await run();
    }
    return result;
  }
  const storage: VoteStorage = {
    async create(path) {
      const { error } = await withBucket(() =>
        bucket().upload(path, new Blob(["1"], { type: "text/plain" }), {
          upsert: false,
          contentType: "text/plain",
        }),
      );
      if (!error) return "created";
      if (isDuplicate(error)) return "exists";
      throw error;
    },
    async list(prefix, { limit, offset, search }) {
      const { data, error } = await withBucket(() =>
        bucket().list(prefix, {
          limit,
          offset,
          ...(search ? { search } : {}),
          sortBy: { column: "name", order: "asc" },
        }),
      );
      if (error) throw error;
      return (data ?? []).map((o) => ({ name: o.name, created_at: o.created_at }));
    },
  };
  return new EpisodePollStore(storage, serverKey);
}
