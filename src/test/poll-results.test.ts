import { describe, expect, it } from "vitest";
import { calculatePollResults } from "@/lib/poll-results";

describe("poll result aggregation", () => {
  it("calculates totals and rounded percentages from database counts", () => {
    expect(
      calculatePollResults([
        { optionId: "a", count: 2 },
        { optionId: "b", count: 1 },
      ]),
    ).toEqual({
      total: 3,
      results: [
        { optionId: "a", count: 2, percent: 67 },
        { optionId: "b", count: 1, percent: 33 },
      ],
    });
  });

  it("returns empty results when the poll has no votes", () => {
    expect(calculatePollResults([])).toEqual({ total: 0, results: [] });
  });
});
