// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EP004_ARCHITECTURE_POLL as POLL } from "@/content/episode-polls";
import {
  EpisodePollStore,
  VOTER_COOKIE,
  type StoredObject,
  type VoteStorage,
} from "@/lib/episode-poll-store.server";

/** In-memory Storage: create() is atomic per path, like an upload with upsert=false. */
class MemoryStorage implements VoteStorage {
  objects = new Map<string, string>();
  clock = () => new Date();
  async create(path: string) {
    if (this.objects.has(path)) return "exists" as const;
    this.objects.set(path, this.clock().toISOString());
    return "created" as const;
  }
  async list(
    prefix: string,
    { limit, offset, search }: { limit: number; offset: number; search?: string },
  ) {
    const children: StoredObject[] = [];
    for (const [path, created_at] of this.objects) {
      if (!path.startsWith(`${prefix}/`)) continue;
      const name = path.slice(prefix.length + 1);
      if (name.includes("/") || (search && !name.includes(search))) continue;
      children.push({ name, created_at });
    }
    return children.sort((a, b) => a.name.localeCompare(b.name)).slice(offset, offset + limit);
  }
}

const SITE = "https://codeshift-podcast.lovable.app";
let storage: MemoryStorage;
let store: EpisodePollStore;
let now: Date;

function req(cookie?: string, ip = "203.0.113.7") {
  return new Request(`${SITE}/api/polls`, {
    headers: { ...(cookie ? { cookie } : {}), ...(ip ? { "cf-connecting-ip": ip } : {}) },
  });
}
async function newVisitor(ip?: string): Promise<string> {
  const reply = await store.state(req(undefined, ip), POLL.slug);
  return reply.setCookie?.split(";")[0] ?? "";
}

beforeEach(() => {
  storage = new MemoryStorage();
  now = new Date("2026-11-15T10:00:00Z");
  storage.clock = () => now;
  store = new EpisodePollStore(storage, "server-only-key", () => now);
});

describe("episode poll vote store", () => {
  it("issues an HttpOnly voter cookie and hides results before voting", async () => {
    const reply = await store.state(req(), POLL.slug);
    expect(reply.status).toBe(200);
    expect(reply.setCookie).toMatch(new RegExp(`^${VOTER_COOKIE}=[0-9a-f-]{36}; .*HttpOnly`));
    expect(reply.body).toEqual({ poll: { slug: POLL.slug, status: "open" } });
  });

  it("stores a vote and answers with real counts", async () => {
    const first = await newVisitor();
    const second = await newVisitor("198.51.100.4");
    await store.vote(req(first), POLL.slug, "d");
    const reply = await store.vote(req(second, "198.51.100.4"), POLL.slug, "b");
    expect(reply.status).toBe(200);
    expect(reply.body).toMatchObject({ voted: true, myVote: "b", total: 2 });
    expect(reply.body["results"]).toEqual(
      expect.arrayContaining([
        { optionId: "b", count: 1, percent: 50 },
        { optionId: "d", count: 1, percent: 50 },
      ]),
    );
  });

  it("keeps the first vote and reports it when the same browser votes again", async () => {
    const cookie = await newVisitor();
    await store.vote(req(cookie), POLL.slug, "a");
    const again = await store.vote(req(cookie), POLL.slug, "c");
    expect(again.body).toMatchObject({ alreadyVoted: true, myVote: "a", total: 1 });
    expect([...storage.objects.keys()].filter((p) => p.includes("/options/c/"))).toHaveLength(0);
  });

  it("restores the vote and results after a refresh", async () => {
    const cookie = await newVisitor();
    await store.vote(req(cookie), POLL.slug, "d");
    const reply = await store.state(req(cookie), POLL.slug);
    expect(reply.setCookie).toBeUndefined();
    expect(reply.body).toMatchObject({ myVote: "d", total: 1 });
  });

  it("only one of two simultaneous votes from the same browser counts", async () => {
    const cookie = await newVisitor();
    await Promise.all([
      store.vote(req(cookie), POLL.slug, "a"),
      store.vote(req(cookie), POLL.slug, "b"),
    ]);
    const options = [...storage.objects.keys()].filter((p) => p.includes("/options/"));
    expect(options).toHaveLength(1);
  });

  it("caps votes per network at 15 per 10 minutes", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 17; i++) {
      const cookie = await newVisitor("192.0.2.50");
      statuses.push((await store.vote(req(cookie, "192.0.2.50"), POLL.slug, "a")).status);
    }
    expect(statuses.slice(0, 15).every((s) => s === 200)).toBe(true);
    expect(statuses.slice(15)).toEqual([429, 429]);
    const other = await newVisitor("198.51.100.77");
    expect((await store.vote(req(other, "198.51.100.77"), POLL.slug, "a")).status).toBe(200);
  });

  it("caps votes per network at 100 per day", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 101; i++) {
      if (i > 0 && i % 15 === 0) now = new Date(now.getTime() + 11 * 60 * 1000);
      const cookie = await newVisitor("192.0.2.60");
      statuses.push((await store.vote(req(cookie, "192.0.2.60"), POLL.slug, "b")).status);
    }
    expect(statuses.slice(0, 100).every((s) => s === 200)).toBe(true);
    expect(statuses[100]).toBe(429);
  });

  it("never stores raw IP addresses or voter cookies", async () => {
    const cookie = await newVisitor("198.51.100.23");
    await store.vote(req(cookie, "198.51.100.23"), POLL.slug, "a");
    const paths = [...storage.objects.keys()].join("\n");
    expect(paths).not.toContain("198.51.100.23");
    expect(paths).not.toContain(cookie.split("=")[1]);
  });

  it("rejects unknown polls and options without storing anything", async () => {
    const cookie = await newVisitor();
    expect((await store.vote(req(cookie), POLL.slug, "z")).status).toBe(400);
    expect((await store.vote(req(cookie), "nope", "a")).status).toBe(404);
    expect((await store.state(req(cookie), "nope")).status).toBe(404);
    expect(storage.objects.size).toBe(0);
  });
});

describe("/api/polls episode poll endpoints", () => {
  it("answers notReady (insight-only mode) when the deployment has no vote store", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const { Route } = await import("@/routes/api/polls");
    const handlers = (
      Route.options as unknown as {
        server: {
          handlers: Record<"GET" | "POST", (c: { request: Request }) => Promise<Response>>;
        };
      }
    ).server.handlers;
    const get = await handlers.GET({
      request: new Request(`${SITE}/api/polls?episodePoll=${POLL.slug}`),
    });
    expect(await get.json()).toMatchObject({ notReady: true });
    const post = await handlers.POST({
      request: new Request(`${SITE}/api/polls`, {
        method: "POST",
        headers: { origin: SITE, "content-type": "application/json" },
        body: JSON.stringify({ operation: "episode-vote", slug: POLL.slug, optionId: "a" }),
      }),
    });
    expect(await post.json()).toMatchObject({ notReady: true });
    vi.unstubAllEnvs();
  });
});
