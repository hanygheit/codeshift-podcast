import { Link } from "@tanstack/react-router";
import { Facebook, Linkedin, Youtube } from "lucide-react";
import type { ReactNode } from "react";
import { SITE, HOSTS } from "@/content/site";

export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="csg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--teal)" />
        </linearGradient>
      </defs>
      <path d="M22 8a12 12 0 1 0 0 24" fill="none" stroke="url(#csg)" strokeWidth="5" strokeLinecap="round" />
      <path d="M33 13c-1.5-2-4-3-6.5-3-3 0-5 1.6-5 4 0 5.5 11.5 3 11.5 9.5 0 2.6-2.4 4.5-6 4.5-2.7 0-5-1-6.5-3" fill="none" stroke="var(--teal)" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="CodeShift home">
      <BrandMark />
      <span className="font-display text-lg font-bold tracking-tight">
        Code<span className="text-gradient">Shift</span>
      </span>
    </Link>
  );
}

const nav = [
  { to: "/", label: "Home" },
  { to: "/episodes", label: "Episodes" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  return (
    <header className="screen-only sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Wordmark />
        <nav className="flex items-center gap-1 text-sm">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}>
              {n.label}
            </Link>
          ))}
          <ExtLink href={SITE.youtube}
            className="ml-2 hidden items-center gap-2 rounded-full bg-gradient-brand px-4 py-2 font-semibold text-primary-foreground sm:inline-flex">
            <Youtube className="h-4 w-4" /> Watch
          </ExtLink>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="screen-only mt-24 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <Wordmark />
          <p className="text-sm text-muted-foreground">{SITE.descriptor}. An independent, community knowledge-sharing initiative — not a commercial training platform.</p>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3">Explore</p>
          <ul className="space-y-2">
            {nav.map((n) => <li key={n.to}><Link to={n.to} className="text-muted-foreground hover:text-foreground">{n.label}</Link></li>)}
          </ul>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3">Connect</p>
          <ul className="space-y-2">
            <li><ExtLink href={SITE.facebook} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"><Facebook className="h-4 w-4" /> Facebook</ExtLink></li>
            <li><ExtLink href={SITE.youtube} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"><Youtube className="h-4 w-4" /> Watch on YouTube</ExtLink></li>
            {HOSTS.map((h) => <li key={h.name}><ExtLink href={h.linkedin} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"><Linkedin className="h-4 w-4" /> {h.name}</ExtLink></li>)}
          </ul>
          <p className="mt-4 text-muted-foreground">{SITE.schedule}</p>
        </div>
      </div>
      <p className="border-t py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} CodeShift · {SITE.tagline}</p>
    </footer>
  );
}

export function ExtLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full border bg-secondary/60 px-2.5 py-1 font-mono text-[11px] text-secondary-foreground">{children}</span>;
}

export function HostCard({ host }: { host: (typeof HOSTS)[number] }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-brand font-display text-lg font-bold text-primary-foreground">{host.initials}</div>
        <div>
          <h3 className="text-lg font-semibold">{host.name}</h3>
          <p className="text-sm text-teal">{host.role}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{host.bio}</p>
      <ExtLink href={host.linkedin} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
        <Linkedin className="h-4 w-4" /> LinkedIn profile
      </ExtLink>
    </div>
  );
}
