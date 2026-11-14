// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown> & {
  poll_id?: unknown;
  participant_hash?: unknown;
  option_id?: unknown;
  network_hash?: unknown;
  status?: unknown;
};
type DbError = { code: string; message: string };

/** In-memory stand-in for the service-role Supabase client used by /api/polls. */
const db = vi.hoisted(() => {
  const state = {
    polls: [] as Row[],
    poll_votes: [] as Row[],
    insertError: null as DbError | null,
  };

  class Query {
    private filters: ((row: Row) => boolean)[] = [];
    private write?: { kind: "insert" | "upsert"; row: Row };
    constructor(private table: "polls" | "poll_votes") {}
    select() {
      return this;
    }
    eq(column: string, value: unknown) {
      this.filters.push((row) => row[column] === value);
      return this;
    }
    in(column: string, values: unknown[]) {
      this.filters.push((row) => values.includes(row[column]));
      return this;
    }
    order() {
      return this;
    }
    insert(row: Row) {
      this.write = { kind: "insert", row };
      return this;
    }
    upsert(row: Row) {
      this.write = { kind: "upsert", row };
      return this;
    }
    private rows() {
      return state[this.table].filter((row) => this.filters.every((filter) => filter(row)));
    }
    async maybeSingle() {
      const rows = this.rows();
      return { data: rows[0] ?? null, error: null };
    }
    async single() {
      const rows = this.rows();
      return rows[0]
        ? { data: rows[0], error: null }
        : { data: null, error: { code: "PGRST116", message: "not found" } };
    }
    private run(): { data: unknown; error: DbError | null } {
      if (!this.write) return { data: this.rows(), error: null };
      const { kind, row } = this.write;
      const existing = state.poll_votes.find(
        (vote) => vote.poll_id === row.poll_id && vote.participant_hash === row.participant_hash,
      );
      if (kind === "upsert" && existing) {
        Object.assign(existing, row);
        return { data: null, error: null };
      }
      if (state.insertError) return { data: null, error: state.insertError };
      if (existing) return { data: null, error: { code: "23505", message: "duplicate key value" } };
      state.poll_votes.push({ id: crypto.randomUUID(), ...row });
      return { data: null, error: null };
    }
    then<T>(resolve: (value: { data: unknown; error: DbError | null }) => T) {
      return Promise.resolve(this.run()).then(resolve);
    }
  }

  const client = {
    from: (table: "polls" | "poll_votes") => new Query(table),
    rpc: async (_name: string, args: { p_poll_id: string }) => {
      const counts = new Map<string, number>();
      for (const vote of state.poll_votes.filter((vote) => vote.poll_id === args.p_poll_id))
        counts.set(String(vote.option_id), (counts.get(String(vote.option_id)) ?? 0) + 1);
      return {
        data: [...counts].map(([option_id, vote_count]) => ({ option_id, vote_count })),
        error: null,
      };
    },
  };
  return { state, client };
});

vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: db.client }));

const { Route } = await import("@/routes/api/polls");
const handlers = (
  Route.options as unknown as {
    server: { handlers: Record<"GET" | "POST", (ctx: { request: Request }) => Promise<Response>> };
  }
).server.handlers;

const ORIGIN = "https://codeshift-podcast.lovable.app";
const OPEN_SLUG = "ep004-first-architecture-decision";
const options = ["a", "b", "c", "d"].map((id) => ({
  id,
  label: id.toUpperCase(),
  description: "",
}));

function get(query: string, cookie?: string) {
  return handlers.GET({
    request: new Request(`${ORIGIN}/api/polls?${query}`, {
      headers: cookie ? { cookie } : {},
    }),
  });
}

function vote(slug: string, optionId: string, cookie?: string, ip = "203.0.113.7") {
  return handlers.POST({
    request: new Request(`${ORIGIN}/api/polls`, {
      method: "POST",
      headers: {
        origin: ORIGIN,
        "content-type": "application/json",
        "cf-connecting-ip": ip,
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify({ operation: "vote", slug, optionId }),
    }),
  });
}

/** Opens the poll like the browser does and returns the signed voter cookie it set. */
async function visitor(): Promise<string> {
  const response = await get(`slug=${OPEN_SLUG}`);
  const setCookie = response.headers.get("set-cookie") ?? "";
  expect(setCookie).toMatch(/HttpOnly/);
  return setCookie.split(";")[0] ?? "";
}

beforeEach(() => {
  vi.stubEnv("POLL_VOTE_SECRET", "test-secret-that-is-at-least-32-characters-long");
  db.state.insertError = null;
  db.state.poll_votes = [
    { poll_id: "open-1", participant_hash: "earlier-1", option_id: "d" },
    { poll_id: "open-1", participant_hash: "earlier-2", option_id: "d" },
    { poll_id: "open-1", participant_hash: "earlier-3", option_id: "b" },
  ];
  db.state.polls = [
    {
      id: "open-1",
      slug: OPEN_SLUG,
      episode_number: 4,
      title: "You're the Architect. What Would YOU Build?",
      question: "What's your FIRST architectural decision?",
      options,
      status: "open",
      results_revealed: false,
      updated_at: "2026-11-14T00:00:00Z",
    },
    {
      id: "live-1",
      slug: "ep003-agent-autonomy",
      episode_number: 3,
      title: "Live poll",
      question: "Live question",
      options,
      status: "live",
      results_revealed: false,
      updated_at: "2026-11-14T00:00:00Z",
    },
  ];
});

describe("always-open episode poll API", () => {
  it("hides community results until the visitor has voted", async () => {
    const response = await get(`slug=${OPEN_SLUG}`);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.poll).toMatchObject({ slug: OPEN_SLUG, status: "open" });
    expect(body).not.toHaveProperty("results");
    expect(body).not.toHaveProperty("total");
    expect(body).not.toHaveProperty("myVote");
  });

  it("stores one vote and answers with the real aggregate results", async () => {
    const cookie = await visitor();
    const response = await vote(OPEN_SLUG, "b", cookie);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ voted: true, myVote: "b", total: 4 });
    expect(body.results).toEqual(
      expect.arrayContaining([
        { optionId: "d", count: 2, percent: 50 },
        { optionId: "b", count: 2, percent: 50 },
      ]),
    );
    expect(db.state.poll_votes).toHaveLength(4);
  });

  it("keeps the first vote final and reports it when the same browser votes again", async () => {
    const cookie = await visitor();
    await vote(OPEN_SLUG, "a", cookie);
    const response = await vote(OPEN_SLUG, "c", cookie);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ alreadyVoted: true, myVote: "a", total: 4 });
    expect(db.state.poll_votes.filter((row) => row.option_id === "c")).toHaveLength(0);
  });

  it("restores the vote and results after a page refresh", async () => {
    const cookie = await visitor();
    await vote(OPEN_SLUG, "d", cookie);
    const body = await (await get(`slug=${OPEN_SLUG}`, cookie)).json();
    expect(body).toMatchObject({ myVote: "d", total: 4 });
    expect(body.results).toContainEqual({ optionId: "d", count: 3, percent: 75 });
  });

  it("requires the signed voter cookie issued by the poll page", async () => {
    const response = await vote(OPEN_SLUG, "a");
    expect(response.status).toBe(403);
    expect(response.headers.get("set-cookie")).toMatch(/codeshift_poll_voter=/);
    expect(db.state.poll_votes).toHaveLength(3);

    const forged = await vote(OPEN_SLUG, "a", "codeshift_poll_voter=attacker.0000");
    expect(forged.status).toBe(403);
    expect(db.state.poll_votes).toHaveLength(3);
  });

  it("stores a keyed network hash, never the raw IP address", async () => {
    const cookie = await visitor();
    await vote(OPEN_SLUG, "a", cookie, "198.51.100.23");
    const stored = db.state.poll_votes.at(-1);
    expect(stored?.network_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(stored)).not.toContain("198.51.100.23");
  });

  it("maps the database network cap to a 429 without storing the vote", async () => {
    const cookie = await visitor();
    db.state.insertError = { code: "P0001", message: "poll_network_rate_limited" };
    const response = await vote(OPEN_SLUG, "a", cookie);
    expect(response.status).toBe(429);
    expect((await response.json()).error).toMatch(/network/);
    expect(db.state.poll_votes).toHaveLength(3);
  });

  it("treats a concurrent duplicate insert as already voted", async () => {
    const cookie = await visitor();
    db.state.insertError = { code: "23505", message: "duplicate key value" };
    const response = await vote(OPEN_SLUG, "a", cookie);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ alreadyVoted: true });
  });

  it("rejects unknown options, closed polls and cross-site posts", async () => {
    const cookie = await visitor();
    expect((await vote(OPEN_SLUG, "z", cookie)).status).toBe(400);

    const crossSite = await handlers.POST({
      request: new Request(`${ORIGIN}/api/polls`, {
        method: "POST",
        headers: { origin: "https://evil.example", "content-type": "application/json", cookie },
        body: JSON.stringify({ operation: "vote", slug: OPEN_SLUG, optionId: "a" }),
      }),
    });
    expect(crossSite.status).toBe(403);

    db.state.polls[0]!.status = "closed";
    expect((await vote(OPEN_SLUG, "a", cookie)).status).toBe(409);
    expect(db.state.poll_votes).toHaveLength(3);
  });
});

describe("host-controlled live poll API (unchanged)", () => {
  it("still lets a live voter change their answer and keeps results hidden until revealed", async () => {
    const cookie = await visitor();
    const first = await vote("ep003-agent-autonomy", "a", cookie);
    expect(await first.json()).toEqual({ voted: true });
    await vote("ep003-agent-autonomy", "b", cookie);

    const liveVotes = db.state.poll_votes.filter((row) => row.poll_id === "live-1");
    expect(liveVotes).toEqual([expect.objectContaining({ option_id: "b" })]);
    expect(liveVotes[0]).not.toHaveProperty("network_hash");

    const body = await (await get("slug=ep003-agent-autonomy", cookie)).json();
    expect(body.myVote).toBe("b");
    expect(body).not.toHaveProperty("results");
  });

  it("serves only the live poll on /poll, never the open episode poll", async () => {
    const body = await (await get("")).json();
    expect(body.poll.slug).toBe("ep003-agent-autonomy");
  });
});
