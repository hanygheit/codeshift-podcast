import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ handler: (fn: unknown) => fn }),
}));

const request = vi.fn();
const broadcast = (id: string, time: string, status = "upcoming", privacyStatus = "public") => ({
  id,
  snippet: { title: `Broadcast ${id}`, liveBroadcastContent: status, thumbnails: { high: { url: "https://i.ytimg.com/vi/example/hqdefault.jpg" } } },
  status: { privacyStatus },
  liveStreamingDetails: { scheduledStartTime: time },
});

beforeEach(() => {
  vi.resetModules();
  request.mockReset();
  vi.stubGlobal("fetch", request);
  vi.stubEnv("YOUTUBE_API_KEY", "test-key-not-a-credential");
});

describe("YouTube upcoming schedule", () => {
  it("checks the CodeShift Podcast uploads, not the host's personal channel, and returns the nearest broadcast", async () => {
    request.mockResolvedValueOnce(Response.json({ items: [{ contentDetails: { videoId: "later" } }, { contentDetails: { videoId: "nearest" } }] }))
      .mockResolvedValueOnce(Response.json({ items: [broadcast("later", "2099-11-02T17:00:00Z"), broadcast("nearest", "2099-11-01T17:00:00Z")] }));
    const { getUpcomingLive, CODESHIFT_CHANNEL_ID } = await import("@/lib/youtube.functions");
    const result = await getUpcomingLive();
    expect(CODESHIFT_CHANNEL_ID).toBe("UCRjaB0a3R2gqIgo-UpJZHwA");
    expect(new URL(request.mock.calls[0]?.[0]).searchParams.get("playlistId")).toBe("UURjaB0a3R2gqIgo-UpJZHwA");
    expect(result).toMatchObject({ status: "ok", event: { videoId: "nearest", scheduledStart: "2099-11-01T17:00:00Z", url: "https://www.youtube.com/watch?v=nearest" } });
    await getUpcomingLive();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("prioritizes a live public broadcast and excludes private and finished broadcasts", async () => {
    request.mockResolvedValueOnce(Response.json({ items: [{ contentDetails: { videoId: "live" } }] }))
      .mockResolvedValueOnce(Response.json({ items: [
        broadcast("upcoming", "2099-11-01T17:00:00Z"),
        broadcast("private", "2099-11-01T16:00:00Z", "live", "private"),
        { ...broadcast("finished", "2099-11-01T15:00:00Z", "live"), liveStreamingDetails: { actualEndTime: "2099-11-01T16:00:00Z" } },
        broadcast("live", "2099-11-01T17:00:00Z", "live"),
      ] }));
    const { getUpcomingLive } = await import("@/lib/youtube.functions");
    expect(await getUpcomingLive()).toMatchObject({ status: "ok", event: { videoId: "live", status: "live" } });
  });

  it("distinguishes an empty schedule from a YouTube API failure", async () => {
    request.mockResolvedValueOnce(Response.json({ items: [] }));
    const { getUpcomingLive } = await import("@/lib/youtube.functions");
    expect(await getUpcomingLive()).toMatchObject({ status: "ok", event: null });
    vi.resetModules();
    request.mockResolvedValueOnce(Response.json({ error: { message: "not found" } }, { status: 404 }));
    const retry = await import("@/lib/youtube.functions");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await retry.getUpcomingLive()).toMatchObject({ status: "error" });
    log.mockRestore();
  });
});