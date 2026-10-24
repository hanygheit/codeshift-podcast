import { useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { EPISODES, pad } from "@/content/episodes";
import { Button } from "@/components/ui/button";

const resources = EPISODES.flatMap((ep) => ep.brief?.resourceGroups.flatMap((group) =>
  group.items.map((r) => ({ ...r, group: group.label, episode: `EP${pad(ep.number)}` }))) ?? []);
const groups = [...new Set(resources.map((r) => r.group))];

export function HomeResources() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");
  const [episode, setEpisode] = useState("");
  const matches = resources.filter((r) => (!group || r.group === group) && (!episode || r.episode === episode)
    && query.toLowerCase().trim().split(/\s+/).every((word) => `${r.title} ${r.provider} ${r.group}`.toLowerCase().includes(word)));
  return (
    <section id="learning-resources" className="scroll-mt-20 border-y bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <p className="eyebrow">Learning directory</p>
        <h2 className="mt-2 text-2xl font-bold">Learning resources</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <label className="relative min-w-48 flex-1">
            <span className="sr-only">Search learning resources</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search resources or providers…" className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm" />
          </label>
          <select aria-label="Resource episode" value={episode} onChange={(e) => setEpisode(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm"><option value="">All episodes</option>{EPISODES.map((ep) => <option key={ep.id}>EP{pad(ep.number)}</option>)}</select>
          <select aria-label="Resource category" value={group} onChange={(e) => setGroup(e.target.value)} className="max-w-full rounded-lg border bg-card px-3 py-2 text-sm"><option value="">All categories</option>{groups.map((g) => <option key={g}>{g}</option>)}</select>
        </div>
        <p aria-live="polite" className="mt-4 text-xs text-muted-foreground">{matches.length} resource{matches.length === 1 ? "" : "s"}</p>
        <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
          {matches.map((r) => (
            <a key={`${r.episode}-${r.url}-${r.title}`} href={r.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 border-b py-4 hover:text-teal">
              <span className="min-w-0"><span className="block text-sm font-semibold">{r.title}</span><span className="mt-1 block text-xs text-muted-foreground">{r.provider} · {r.episode} · {r.group}</span></span>
              <span className="flex shrink-0 items-center gap-2"><span className="text-xs text-teal">{r.access}</span><ExternalLink className="h-4 w-4 text-muted-foreground" /></span>
            </a>
          ))}
        </div>
        {matches.length === 0 && <div className="py-8 text-center"><p className="text-muted-foreground">No matching resources.</p><Button variant="outline" className="mt-3" onClick={() => { setQuery(""); setGroup(""); setEpisode(""); }}>Reset filters</Button></div>}
      </div>
    </section>
  );
}