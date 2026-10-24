import { createServerFn } from "@tanstack/react-start";

/** Official CodeShift channel ID (provided by the channel owner). */
export const CODESHIFT_CHANNEL_ID = "UCRjaB0a3R2gqIgo-UpJZHwA";

export interface LiveEvent {
  videoId: string;
  title: string;
  thumbnail: string;
  url: string;
  scheduledStart: string;
  status: "upcoming" | "live";
}
export type UpcomingResult =
  | { status: "ok"; event: LiveEvent | null; checkedAt: string }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

const TTL_MS = 20 * 60 * 1000;
let cache: { at: number; value: UpcomingResult } | null = null;

type Thumbs = Record<string, { url: string } | undefined>;
interface VideoItem {
  id: string;
  snippet: { title: string; liveBroadcastContent: string; thumbnails: Thumbs };
  liveStreamingDetails?: { scheduledStartTime?: string; actualStartTime?: string; actualEndTime?: string };
  status?: { privacyStatus?: string };
}

async function yt<T>(path: string, params: Record<string, string>, key: string): Promise<T> {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  Object.entries({ ...params, key }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`YouTube ${path} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json() as Promise<T>;
}

/**
 * Nearest scheduled or currently-live public broadcast on the CodeShift channel.
 * Uses the channel's uploads playlist + videos.list (2 quota units) instead of search (100 units).
 */
export const getUpcomingLive = createServerFn({ method: "GET" }).handler(async (): Promise<UpcomingResult> => {
  const key = process.env["YOUTUBE_API_KEY"];
  if (!key) return { status: "unconfigured" };
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
  try {
    const uploads = "UU" + CODESHIFT_CHANNEL_ID.slice(2);
    const list = await yt<{ items?: { contentDetails: { videoId: string } }[] }>("playlistItems",
      { part: "contentDetails", playlistId: uploads, maxResults: "15" }, key);
    const ids = (list.items ?? []).map((i) => i.contentDetails.videoId);
    let event: LiveEvent | null = null;
    if (ids.length) {
      const vids = await yt<{ items?: VideoItem[] }>("videos", { part: "snippet,liveStreamingDetails,status", id: ids.join(",") }, key);
      const now = Date.now();
      const candidates = (vids.items ?? [])
        .filter((v) => v.status?.privacyStatus === "public" && v.liveStreamingDetails && !v.liveStreamingDetails.actualEndTime)
        .filter((v) => v.snippet.liveBroadcastContent === "live" || v.snippet.liveBroadcastContent === "upcoming")
        .map((v): LiveEvent => {
          const d = v.liveStreamingDetails!;
          const t = v.snippet.thumbnails;
          return {
            videoId: v.id, title: v.snippet.title,
            thumbnail: (t["maxres"] ?? t["standard"] ?? t["high"] ?? t["medium"] ?? t["default"])?.url ?? "",
            url: `https://www.youtube.com/watch?v=${v.id}`,
            scheduledStart: d.scheduledStartTime ?? d.actualStartTime ?? "",
            status: v.snippet.liveBroadcastContent === "live" ? "live" : "upcoming",
          };
        })
        // Drop stale "upcoming" entries whose start passed more than 12h ago without going live.
        .filter((e) => e.status === "live" || !e.scheduledStart || Date.parse(e.scheduledStart) > now - 12 * 3600_000)
        .sort((a, b) => (a.status === "live" ? -1 : b.status === "live" ? 1 : a.scheduledStart.localeCompare(b.scheduledStart)));
      event = candidates[0] ?? null;
    }
    const value: UpcomingResult = { status: "ok", event, checkedAt: new Date().toISOString() };
    cache = { at: Date.now(), value };
    return value;
  } catch (e) {
    console.error("Upcoming live lookup failed", e);
    return { status: "error", message: "We couldn't reach YouTube right now." };
  }
});
