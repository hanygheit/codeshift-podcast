import { useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import type { Episode } from "@/content/types";
import { Button } from "@/components/ui/button";

/** Searchable, filterable resource directory scoped to one episode's brief. */
export function EpisodeResources({ ep }: { ep: Episode }) {
  const groups = ep.brief?.resourceGroups ?? [];
  const all = groups.flatMap((g) => g.items.map((r) => ({ ...r, group: g.label })));
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");
  if (!all.length) return null;
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = all.filter((r) => (!group || r.group === group)
    && words.every((w) => `${r.title} ${r.provider} ${r.group} ${r.ref ?? ""}`.toLowerCase().includes(w)));
  const isPlaybook = !!ep.brief?.packages;
  return (
    <section id="resources" className="mt-16 scroll-mt-20">
      <p className="eyebrow">{isPlaybook ? "Developer Learning Playbook" : "Curated references"}</p>
      <h2 className="mt-2 text-2xl font-bold">Learning resources</h2>
      {ep.brief?.resourcesNote && <p className="mt-2 text-sm text-muted-foreground">{ep.brief.resourcesNote}</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        <label className="relative min-w-48 flex-1">
          <span className="sr-only">Search this episode's resources</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses or providers…" className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm" />
        </label>
        <select aria-label={isPlaybook ? "Learning package" : "Category"} value={group} onChange={(e) => setGroup(e.target.value)} className="max-w-full rounded-lg border bg-card px-3 py-2 text-sm">
          <option value="">{isPlaybook ? "All packages" : "All categories"}</option>
          {groups.map((g) => <option key={g.label}>{g.label}</option>)}
        </select>
      </div>
      <p aria-live="polite" className="mt-4 text-xs text-muted-foreground">{matches.length} of {all.length} resources</p>
      {groups.filter((g) => !group || g.label === group).map((g) => {
        const items = matches.filter((r) => r.group === g.label);
        if (!items.length) return null;
        return (
          <div key={g.label} className="mt-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-teal">{g.label}</h3>
            <div className="mt-2 grid gap-x-8 sm:grid-cols-2">
              {items.map((r) => (
                <a key={r.url + r.title} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 border-b py-3 hover:text-teal">
                  <span className="min-w-0"><span className="block text-sm font-semibold">{r.ref && <span className="mr-2 font-mono text-xs text-primary">{r.ref}</span>}{r.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{r.provider}</span></span>
                  <span className="flex shrink-0 items-center gap-2"><span className="text-xs text-teal">{r.access}</span><ExternalLink className="h-4 w-4 text-muted-foreground" /></span>
                </a>
              ))}
            </div>
          </div>
        );
      })}
      {matches.length === 0 && <div className="py-8 text-center"><p className="text-muted-foreground">No matching resources.</p><Button variant="outline" className="mt-3" onClick={() => { setQuery(""); setGroup(""); }}>Reset filters</Button></div>}
    </section>
  );
}
