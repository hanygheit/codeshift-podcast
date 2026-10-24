import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, Radio, RefreshCw, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import { getUpcomingLive, type LiveEvent } from "@/lib/youtube.functions";
import { SITE } from "@/content/site";
import { Button } from "@/components/ui/button";
import { ExtLink } from "@/components/site";

const cairo = (iso: string) => new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Cairo", weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
}).format(new Date(iso));

function Countdown({ iso }: { iso: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (now === null) return null;
  const ms = Date.parse(iso) - now;
  if (ms <= 0) return <p className="font-mono text-sm text-teal">Starting soon</p>;
  const parts = [[Math.floor(ms / 86400000), "days"], [Math.floor(ms / 3600000) % 24, "hrs"], [Math.floor(ms / 60000) % 60, "min"], [Math.floor(ms / 1000) % 60, "sec"]] as const;
  return (
    <div className="flex gap-2" aria-label="Time until broadcast">
      {parts.map(([v, l]) => (
        <div key={l} className="min-w-16 rounded-xl border bg-surface px-3 py-2 text-center">
          <p className="font-mono text-2xl font-bold tabular-nums">{String(v).padStart(2, "0")}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</p>
        </div>
      ))}
    </div>
  );
}

function EventCard({ e }: { e: LiveEvent }) {
  const live = e.status === "live";
  const num = e.title.match(/EP\s?0*(\d{1,3})/i)?.[1];
  return (
    <div className="grid items-center gap-6 overflow-hidden rounded-3xl border bg-card p-4 md:grid-cols-[1.1fr_1fr] md:p-6">
      <ExtLink href={e.url} className="relative block overflow-hidden rounded-2xl border">
        {e.thumbnail && <img src={e.thumbnail} alt={e.title} className="aspect-video w-full object-cover" />}
        <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${live ? "bg-destructive text-destructive-foreground" : "bg-background/85 text-teal backdrop-blur"}`}>
          <Radio className={`h-3.5 w-3.5 ${live ? "animate-pulse" : ""}`} /> {live ? "LIVE NOW" : "Upcoming Live"}
        </span>
      </ExtLink>
      <div>
        {num && <p className="font-mono text-xs text-teal">EP{num.padStart(3, "0")}</p>}
        <h3 className="mt-1 text-2xl font-bold leading-tight">{e.title}</h3>
        {e.scheduledStart && <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><CalendarClock className="h-4 w-4 text-teal" /> {cairo(e.scheduledStart)} · Cairo time</p>}
        {!live && e.scheduledStart && <div className="mt-5"><Countdown iso={e.scheduledStart} /></div>}
        <Button asChild className="mt-6 bg-gradient-brand"><ExtLink href={e.url}><Youtube /> {live ? "Join Live" : "Watch / Set Reminder"}</ExtLink></Button>
        {!live && <p className="mt-2 text-xs text-muted-foreground">Opens YouTube, where you can tap “Notify me”.</p>}
      </div>
    </div>
  );
}

function Compact({ title, body, onRetry, busy }: { title: string; body: string; onRetry?: () => void; busy?: boolean }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-dashed bg-surface/50 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <CalendarClock className="mt-0.5 h-6 w-6 shrink-0 text-teal" />
        <div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-muted-foreground">{body}</p></div>
      </div>
      <div className="flex shrink-0 gap-2">
        {onRetry && <Button variant="ghost" size="sm" onClick={onRetry} disabled={busy}><RefreshCw className={busy ? "animate-spin" : ""} /> Retry</Button>}
        <Button asChild variant="outline" size="sm"><ExtLink href={SITE.youtube}><Youtube /> CodeShift on YouTube</ExtLink></Button>
      </div>
    </div>
  );
}

export function UpcomingEpisode() {
  const fetchUpcoming = useServerFn(getUpcomingLive);
  const q = useQuery({ queryKey: ["upcoming-live"], queryFn: () => fetchUpcoming(), refetchInterval: 20 * 60 * 1000, staleTime: 5 * 60 * 1000 });
  const d = q.data;
  return (
    <section aria-labelledby="upcoming-title" className="mx-auto max-w-6xl px-5 pt-14">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><p className="eyebrow">Next live session</p><h2 id="upcoming-title" className="mt-2 text-2xl font-bold">Upcoming Episode</h2></div>
        {d?.status === "ok" && <Button variant="ghost" size="sm" onClick={() => q.refetch()} disabled={q.isFetching} aria-label="Refresh upcoming episode"><RefreshCw className={q.isFetching ? "animate-spin" : ""} /> Refresh</Button>}
      </div>
      {q.isPending ? (
        <div className="h-28 animate-pulse rounded-2xl border bg-surface/60" aria-label="Loading upcoming episode" />
      ) : d?.status === "ok" && d.event ? (
        <EventCard e={d.event} />
      ) : d?.status === "ok" ? (
        <Compact title="Next Episode — Coming Soon" body="Our next live session hasn't been scheduled yet. Follow CodeShift on YouTube for updates." />
      ) : d?.status === "unconfigured" ? (
        <Compact title="Live schedule not connected yet" body="Live schedule from YouTube isn't set up yet. Check our YouTube channel for the next live session." />
      ) : (
        <Compact title="Schedule temporarily unavailable" body="We couldn't check the YouTube live schedule right now — this doesn't mean nothing is scheduled." onRetry={() => q.refetch()} busy={q.isFetching} />
      )}
    </section>
  );
}
