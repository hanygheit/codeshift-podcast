import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { castOpenPollVote, getOpenPoll, OpenPollError, toOpenPollError } from "@/lib/open-poll";

const fetchMock = vi.fn<typeof fetch>();
const reply = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("open poll browser client", () => {
  it("reads the poll through /api/polls and passes results through", async () => {
    fetchMock.mockImplementationOnce(() =>
      reply({ poll: { slug: "s", status: "open" }, myVote: "d", total: 1, results: [] }),
    );
    expect(await getOpenPoll("s")).toEqual({
      poll: { slug: "s", status: "open" },
      myVote: "d",
      total: 1,
      results: [],
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/polls?episodePoll=s");
  });

  it("posts the vote as an episode-vote operation", async () => {
    fetchMock.mockImplementationOnce(() => reply({ poll: { slug: "s", status: "open" } }));
    await castOpenPollVote("s", "b");
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("/api/polls");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      operation: "episode-vote",
      slug: "s",
      optionId: "b",
    });
  });

  it("turns a server without a vote store into the insight-only mode", async () => {
    fetchMock.mockImplementationOnce(() =>
      reply({ poll: { slug: "s", status: "open" }, notReady: true }),
    );
    await expect(getOpenPoll("s")).rejects.toMatchObject({ kind: "not-ready" });
  });

  it("maps server errors to visitor-facing messages", async () => {
    fetchMock.mockImplementationOnce(() =>
      reply({ error: "Too many.", code: "rate_limited" }, 429),
    );
    await expect(castOpenPollVote("s", "a")).rejects.toMatchObject({ kind: "rate-limited" });
    fetchMock.mockImplementationOnce(() => reply({ error: "x", code: "invalid_option" }, 400));
    await expect(castOpenPollVote("s", "z")).rejects.toMatchObject({ kind: "invalid" });
    fetchMock.mockImplementationOnce(() => reply({ error: "down" }, 503));
    await expect(getOpenPoll("s")).rejects.toMatchObject({ kind: "unavailable" });
    fetchMock.mockImplementationOnce(() => Promise.reject(new TypeError("Failed to fetch")));
    await expect(getOpenPoll("s")).rejects.toMatchObject({ kind: "offline" });
    const mapped = new OpenPollError("x", "rate-limited");
    expect(toOpenPollError(mapped)).toBe(mapped);
  });
});
