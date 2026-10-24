import { describe, expect, it } from "vitest";
import { filterEpisodes, PAGE_SIZE, HOME_PAGE_SIZE } from "@/lib/archive";
import { EPISODES } from "@/content/episodes";

const many: typeof EPISODES = Array.from({ length: 23 }, (_, i) => ({ ...EPISODES[0]!, id: `x${i}`, number: i + 1, scheduledDate: `2026-01-${String(i + 1).padStart(2, "0")}` }));

describe("archive", () => {
  it("paginates home episodes in groups of five", () => {
    expect(HOME_PAGE_SIZE).toBe(5);
    const first = filterEpisodes(many, { sort: "number" }, HOME_PAGE_SIZE);
    const next = filterEpisodes(many, { sort: "number", page: 2 }, HOME_PAGE_SIZE);
    expect(first.items.map((e) => e.number)).toEqual([1, 2, 3, 4, 5]);
    expect(next.items.map((e) => e.number)).toEqual([6, 7, 8, 9, 10]);
    expect(next.pageCount).toBe(5);
  });
  it("shows at most 10 per page", () => {
    expect(PAGE_SIZE).toBe(10);
    const r = filterEpisodes(many, { page: 3 });
    expect(r.pageCount).toBe(3);
    expect(r.items).toHaveLength(3);
  });
  it("filters before paginating", () => {
    const r = filterEpisodes(EPISODES, { audience: "Companies" });
    expect(r.total).toBe(1);
    expect(r.items[0]!.id).toBe("ep002");
  });
  it("sorts newest first by default", () => {
    expect(filterEpisodes(EPISODES, {}).items[0]!.id).toBe("ep002");
    expect(filterEpisodes(EPISODES, { sort: "oldest" }).items[0]!.id).toBe("ep001");
  });
  it("orders by episode number descending by default, regardless of date", () => {
    const mixed = many.map((e, i) => ({ ...e, scheduledDate: `2026-02-${String(28 - i).padStart(2, "0")}` }));
    expect(filterEpisodes(mixed, {}).items[0]!.number).toBe(23);
  });
  it("sorts by title and searches by episode number", () => {
    expect(filterEpisodes(EPISODES, { sort: "title-asc" }).items[0]!.id).toBe("ep001");
    expect(filterEpisodes(EPISODES, { sort: "title-desc" }).items[0]!.id).toBe("ep002");
    expect(filterEpisodes(EPISODES, { q: "EP001" }).items.map((e) => e.id)).toEqual(["ep001"]);
  });
});

describe("library sorting", () => {
  it("supports publication date newest first", () => {
    expect(filterEpisodes(EPISODES, { sort: "date-desc" }).items[0]!.id).toBe("ep002");
  });
  it("filters by topic", () => {
    const t = EPISODES[0]!.topics[0]!;
    expect(filterEpisodes(EPISODES, { topic: t }).items.every((e) => e.topics.includes(t))).toBe(true);
  });
});
