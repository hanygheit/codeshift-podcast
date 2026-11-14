import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { OpenPollError, toOpenPollError, toOpenPollState, voterToken } from "@/lib/open-poll";

describe("open poll browser client", () => {
  beforeEach(() => window.localStorage.clear());

  it("keeps one random voter token per browser", () => {
    const token = voterToken();
    expect(token).toMatch(/^[A-Za-z0-9-]{16,100}$/);
    expect(voterToken()).toBe(token);
    expect(window.localStorage.getItem("codeshift-poll-voter")).toBe(token);
  });

  it("turns database counts into real percentages and totals", () => {
    expect(
      toOpenPollState({
        poll: { slug: "s", status: "open" },
        myVote: "d",
        counts: [
          { optionId: "d", count: 3 },
          { optionId: "b", count: 1 },
        ],
      }),
    ).toEqual({
      poll: { slug: "s", status: "open" },
      myVote: "d",
      total: 4,
      results: [
        { optionId: "d", count: 3, percent: 75 },
        { optionId: "b", count: 1, percent: 25 },
      ],
    });
    expect(toOpenPollState({ poll: { slug: "s", status: "open" } })).not.toHaveProperty("results");
  });

  it("maps database errors to visitor-facing messages", () => {
    expect(toOpenPollError({ message: "poll_network_rate_limited" }).kind).toBe("rate-limited");
    expect(toOpenPollError({ message: "poll_not_open" }).kind).toBe("closed");
    expect(toOpenPollError({ message: "poll_invalid_option" }).kind).toBe("invalid");
    expect(toOpenPollError({ message: "TypeError: Failed to fetch" }).kind).toBe("offline");
    expect(toOpenPollError({ code: "PGRST202", message: "x" }).kind).toBe("not-ready");
    expect(
      toOpenPollError({ message: "Could not find the table 'public.polls' in the schema cache" })
        .kind,
    ).toBe("not-ready");
    expect(toOpenPollError({ message: "upstream request timeout" }).kind).toBe("unavailable");
    const mapped = new OpenPollError("x", "rate-limited");
    expect(toOpenPollError(mapped)).toBe(mapped);
  });
});

describe("secret-free poll migration", () => {
  const dir = path.resolve(__dirname, "../../supabase/migrations");
  const file = readdirSync(dir).find((name) => name.endsWith("_secret_free_open_polls.sql"));
  const sql = readFileSync(path.join(dir, file ?? ""), "utf8");

  it("exposes only the two poll functions to the publishable key", () => {
    const grants = [...sql.matchAll(/grant execute on function public\.(\w+)/g)].map((m) => m[1]);
    expect(grants).toEqual(["get_open_poll", "cast_open_poll_vote"]);
    expect(sql).toMatch(
      /revoke all on public\.poll_private_settings from public, anon, authenticated/,
    );
    expect(sql).toMatch(
      /revoke all on function public\.poll_private_hash\(text\) from public, anon/,
    );
    expect(sql).not.toMatch(/grant (select|insert|update|delete)/i);
  });
});
