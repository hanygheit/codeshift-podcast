import { describe, expect, it } from "vitest";
import { filterEpisodes, PAGE_SIZE } from "@/lib/archive";
import { EPISODES } from "@/content/episodes";

const many: typeof EPISODES = Array.from({ length: 23 }, (_, i) => ({ ...EPISODES[0]!, id: `x${i}`, number: i + 1, scheduledDate: `2026-01-${String(i + 1).padStart(2, "0")}` }));

describe("archive", () => {
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
});
