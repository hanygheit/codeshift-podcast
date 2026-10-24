import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "./site";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="screen-only">{children}</main>
      <SiteFooter />
    </div>
  );
}
