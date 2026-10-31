import { createServerFn } from "@tanstack/react-start";

/** Verified by YouTube channels.list against the website's @CodeShiftPodcast link. */
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
let upcomingCacheV2: { at: number; value: UpcomingResult } | null = null;

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
  if (upcomingCacheV2 && Date.now() - upcomingCacheV2.at < TTL_MS) return upcomingCacheV2.value;
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
          const d = v.liveStreamingDetails;
          const t = v.snippet.thumbnails;
          return {
            videoId: v.id, title: v.snippet.title,
            thumbnail: (t["maxres"] ?? t["standard"] ?? t["high"] ?? t["medium"] ?? t["default"])?.url ?? "",
            url: `https://www.youtube.com/watch?v=${v.id}`,
            scheduledStart: d?.scheduledStartTime ?? d?.actualStartTime ?? "",
            status: v.snippet.liveBroadcastContent === "live" ? "live" : "upcoming",
          };
        })
        // Upcoming needs a real scheduled time (skips unscheduled placeholder streams).
        .filter((e) => e.status === "live" || !!e.scheduledStart)
        // Drop stale "upcoming" entries whose start passed more than 12h ago without going live.
        .filter((e) => e.status === "live" || !e.scheduledStart || Date.parse(e.scheduledStart) > now - 12 * 3600_000)
        .sort((a, b) => (a.status === "live" ? -1 : b.status === "live" ? 1 : a.scheduledStart.localeCompare(b.scheduledStart)));
      event = candidates[0] ?? null;
    }
    const value: UpcomingResult = { status: "ok", event, checkedAt: new Date().toISOString() };
    upcomingCacheV2 = { at: Date.now(), value };
    return value;
  } catch (e) {
    console.error("Upcoming live lookup failed", e);
    return { status: "error", message: "We couldn't reach YouTube right now." };
  }
});

export interface YtRecording {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
}
export type RecordingsResult = { status: "ok"; items: YtRecording[] } | { status: "unconfigured" } | { status: "error" };

const REC_TTL_MS = 45 * 60 * 1000;
let recordingsCache: { at: number; value: RecordingsResult } | null = null;

/** ISO-8601 duration (PT1H2M3S) to seconds. */
function seconds(d = ""): number {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(d);
  return m ? (+(m[1] ?? 0)) * 3600 + (+(m[2] ?? 0)) * 60 + (+(m[3] ?? 0)) : 0;
}

/**
 * Completed, public CodeShift recordings. Uses YOUTUBE_PLAYLIST_ID (the podcast playlist) when set;
 * otherwise falls back to channel uploads filtered to titles mentioning CodeShift.
 * Excludes upcoming/live streams, Shorts and clips under 10 minutes.
 */
export const getYoutubeRecordings = createServerFn({ method: "GET" }).handler(async (): Promise<RecordingsResult> => {
  const key = process.env["YOUTUBE_API_KEY"];
  if (!key) return { status: "unconfigured" };
  if (recordingsCache && Date.now() - recordingsCache.at < REC_TTL_MS) return recordingsCache.value;
  const playlist = process.env["YOUTUBE_PLAYLIST_ID"];
  const channel = process.env["YOUTUBE_CHANNEL_ID"] || CODESHIFT_CHANNEL_ID;
  try {
    const list = await yt<{ items?: { contentDetails: { videoId: string } }[] }>("playlistItems",
      { part: "contentDetails", playlistId: playlist || "UU" + channel.slice(2), maxResults: "50" }, key);
    const ids = (list.items ?? []).map((i) => i.contentDetails.videoId);
    let items: YtRecording[] = [];
    if (ids.length) {
      const vids = await yt<{ items?: (VideoItem & { snippet: { description: string; publishedAt: string }; contentDetails?: { duration?: string } })[] }>(
        "videos", { part: "snippet,liveStreamingDetails,status,contentDetails", id: ids.join(",") }, key);
      items = (vids.items ?? [])
        .filter((v) => v.status?.privacyStatus === "public" && v.snippet.liveBroadcastContent === "none")
        .filter((v) => seconds(v.contentDetails?.duration) >= 600)
        .filter((v) => !!playlist || /codeshift/i.test(v.snippet.title))
        .map((v) => {
          const t = v.snippet.thumbnails;
          return {
            videoId: v.id, title: v.snippet.title,
            description: v.snippet.description.split("\n").find((l) => l.trim())?.slice(0, 220) ?? "",
            thumbnail: (t["medium"] ?? t["high"] ?? t["default"])?.url ?? "",
            publishedAt: v.liveStreamingDetails?.actualStartTime ?? v.snippet.publishedAt,
            url: `https://www.youtube.com/watch?v=${v.id}`,
          };
        });
    }
    const value: RecordingsResult = { status: "ok", items };
    recordingsCache = { at: Date.now(), value };
    return value;
  } catch (e) {
    console.error("YouTube recordings lookup failed", e);
    return { status: "error" };
  }
});
