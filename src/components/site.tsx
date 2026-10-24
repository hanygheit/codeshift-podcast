import { Link } from "@tanstack/react-router";
import { Facebook, Linkedin, Menu, X, Youtube } from "lucide-react";
import { useState, type ReactNode } from "react";
import { SITE, HOSTS } from "@/content/site";
import logoAsset from "@/assets/codeshift-logo.png.asset.json";
import itiSupport from "@/assets/iti-support.png.asset.json";
import { Button } from "@/components/ui/button";

export function SupportBadge({ className = "w-28 p-2", imgClassName = "h-auto w-full" }: { className?: string; imgClassName?: string }) {
  return (
    <div className={`inline-flex shrink-0 rounded-md border border-support-border bg-support ${className}`}>
      <img src={itiSupport.url} alt="Supported by — Information Technology Institute (ITI)" width={1124} height={705} className={`block ${imgClassName}`} />
    </div>
  );
}

/** The official CodeShift logo (uploaded asset, used as-is). */
export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return <span className={`${className} inline-flex shrink-0 overflow-hidden rounded-full bg-support ring-1 ring-border`}><img src={logoAsset.url} alt="" className="h-full w-full scale-[1.3] object-contain" /></span>;
}

export function Wordmark({ prominent = false }: { prominent?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="CodeShift home">
      <Logo className={prominent ? "h-14 w-14 lg:h-[58px] lg:w-[58px]" : "h-10 w-10"} />
      <span className="font-display text-lg font-bold">
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

const linkCls = "relative rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground";
const activeCls = "text-foreground after:absolute after:inset-x-3 after:-bottom-4 after:h-0.5 after:rounded-full after:bg-gradient-brand";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="screen-only sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 lg:h-[74px]">
        <Wordmark prominent />
        <nav aria-label="Main" className="hidden items-center gap-1 text-sm lg:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className={linkCls} activeProps={{ className: activeCls, "aria-current": "page" }}>
              {n.label}
            </Link>
          ))}
          <ExtLink href={SITE.facebook} className={`${linkCls} inline-flex items-center gap-2`}><Facebook className="h-4 w-4" /> Facebook</ExtLink>
          <ExtLink href={SITE.youtube} className="ml-2 inline-flex items-center gap-2 rounded-md bg-gradient-brand px-4 py-2 font-semibold text-primary-foreground">
            <Youtube className="h-4 w-4" /> YouTube
          </ExtLink>
        </nav>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      {open && (
        <nav aria-label="Mobile" className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t bg-background px-5 py-3 lg:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: n.to === "/" }}
              className="block rounded-md px-3 py-3 text-muted-foreground" activeProps={{ className: "bg-secondary text-foreground", "aria-current": "page" }}>
              {n.label}
            </Link>
          ))}
          <ExtLink href={SITE.facebook} className="flex items-center gap-2 rounded-md px-3 py-3 text-muted-foreground"><Facebook className="h-4 w-4" /> Facebook</ExtLink>
          <ExtLink href={SITE.youtube} className="flex items-center gap-2 rounded-md px-3 py-3 text-muted-foreground"><Youtube className="h-4 w-4" /> YouTube</ExtLink>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="screen-only mt-20 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <Wordmark />
          <p className="text-sm text-muted-foreground">{SITE.descriptor}. An independent, community knowledge-sharing initiative — not a commercial training platform.</p>
          <div className="pt-2"><SupportBadge className="p-2" imgClassName="h-9 w-auto" /></div>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3">Explore</p>
          <ul className="space-y-2">
            {nav.map((n) => <li key={n.to}><Link to={n.to} className="text-muted-foreground hover:text-foreground">{n.label}</Link></li>)}
            <li><ExtLink href={SITE.facebook} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"><Facebook className="h-4 w-4" /> Facebook</ExtLink></li>
            <li><ExtLink href={SITE.youtube} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"><Youtube className="h-4 w-4" /> YouTube</ExtLink></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="eyebrow mb-3">Hosts</p>
          <ul className="space-y-2">
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
    <div className="flex gap-5 rounded-2xl border bg-card p-6">
      <img src={host.photo} alt={`${host.name}`} loading="lazy" className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-2 ring-primary/40" />
      <div className="min-w-0">
        <h3 className="text-lg font-semibold">{host.name}</h3>
        <p className="text-sm text-teal">{host.role}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{host.bio}</p>
        <ExtLink href={host.linkedin} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <Linkedin className="h-4 w-4" /> LinkedIn profile
        </ExtLink>
      </div>
    </div>
  );
}
