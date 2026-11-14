// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EP004_ARCHITECTURE_POLL, EPISODE_POLLS } from "@/content/episode-polls";
import { EPISODES } from "@/content/episodes";
import { clientNetworkHash, networkOf } from "@/lib/poll-network";

const migrations = path.resolve(__dirname, "../../supabase/migrations");
const seedFile = readdirSync(migrations).find((name) => name.endsWith("_open_episode_polls.sql"));
const seed = readFileSync(path.join(migrations, seedFile ?? ""), "utf8");

describe("EP004 architecture poll content", () => {
  it("is embedded on EP004 only", () => {
    expect(Object.keys(EPISODE_POLLS)).toEqual(["ep004"]);
    expect(EPISODES.filter((ep) => EPISODE_POLLS[ep.id]).map((ep) => ep.id)).toEqual(["ep004"]);
  });

  it("matches the poll record seeded by the migration", () => {
    const options = JSON.parse(seed.match(/'(\[\s*\{"id"[\s\S]*?\])'::jsonb/)?.[1] ?? "[]") as {
      id: string;
      label: string;
    }[];
    expect(seed).toMatch(new RegExp(`'${EP004_ARCHITECTURE_POLL.slug}',\\s*4,`));
    expect(seed).toMatch(/'open',\s*false\s*\)\s*on conflict \(slug\) do nothing;/);
    expect(options.map((option) => option.id)).toEqual(
      EP004_ARCHITECTURE_POLL.options.map((option) => option.id),
    );
    expect(options.map((option) => option.label.slice(0, 1))).toEqual(["A", "B", "C", "D"]);
  });

  it("offers the four scenario choices, the insight and the closing message", () => {
    expect(EP004_ARCHITECTURE_POLL.options.map((o) => `${o.letter}. ${o.label}`)).toEqual([
      "A. Start with Microservices for maximum scalability.",
      "B. Start with a Modular Monolith and evolve when needed.",
      "C. Build on Kubernetes from day one.",
      "D. Ask more questions before choosing the architecture.",
    ]);
    for (const option of EP004_ARCHITECTURE_POLL.options) {
      expect(option.feedback.headline.length).toBeGreaterThan(10);
      expect(option.feedback.body.length).toBeGreaterThan(60);
      expect(`${option.feedback.headline} ${option.feedback.body}`).not.toMatch(
        /\b(correct|wrong|score|right answer)\b/i,
      );
    }
    expect(EP004_ARCHITECTURE_POLL.insight.takeaway).toBe(
      "Great architecture starts with questions, not technologies.",
    );
    expect(EP004_ARCHITECTURE_POLL.closing).toBe(
      "There is no one-size-fits-all architecture. Context and trade-offs matter!",
    );
  });

  it("shares the episode anchor and links the EP004 recording", () => {
    expect(EP004_ARCHITECTURE_POLL.shareUrl).toBe(
      "https://codeshift-podcast.lovable.app/episodes/ep004#architecture-poll",
    );
    expect(EP004_ARCHITECTURE_POLL.anchor).toBe("architecture-poll");
    expect(EP004_ARCHITECTURE_POLL.watchLabel).toBe("Watch EP004: Inside Software Architecture");
    expect(EPISODES.find((ep) => ep.id === "ep004")?.youtubeUrl).toBe(
      "https://youtube.com/live/GnvFox330Sg",
    );
  });
});

describe("vote network hash", () => {
  const secret = "test-secret-that-is-at-least-32-characters-long";
  const day = new Date("2026-11-14T12:00:00Z");
  const hash = (headers: Record<string, string>, now = day) =>
    clientNetworkHash(new Request("https://x.test", { headers }), secret, now);

  it("prefers the edge-provided client IP and never returns the address itself", () => {
    const value = hash({ "cf-connecting-ip": "203.0.113.7", "x-forwarded-for": "10.0.0.1" });
    expect(value).toMatch(/^[0-9a-f]{64}$/);
    expect(value).toBe(hash({ "cf-connecting-ip": "203.0.113.7" }));
    expect(value).not.toBe(hash({ "x-forwarded-for": "10.0.0.1" }));
  });

  it("rotates daily and groups IPv6 clients by /64", () => {
    expect(hash({ "cf-connecting-ip": "203.0.113.7" })).not.toBe(
      hash({ "cf-connecting-ip": "203.0.113.7" }, new Date("2026-11-15T12:00:00Z")),
    );
    expect(networkOf("2001:db8:85a3:12::1")).toBe("2001:db8:85a3:12::/64");
    expect(networkOf("2001:0db8:85a3:0012:ffff:1:2:3")).toBe("2001:db8:85a3:12::/64");
    expect(networkOf("::ffff:198.51.100.4")).toBe("198.51.100.4");
  });

  it("returns null when no client address is available", () => {
    expect(hash({})).toBeNull();
  });
});
