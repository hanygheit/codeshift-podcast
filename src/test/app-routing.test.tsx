import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
  it.each(["ep001", "ep002", "ep003"])(
    "preserves episode and presentation routes for %s",
    (slug) => {
      const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
      expect(router.matchRoutes(`/episodes/${slug}`).at(-1)?.routeId).toBe("/episodes/$slug");
      expect(router.matchRoutes(`/episodes/${slug}/slides`).at(-1)?.routeId).toBe(
        "/episodes/$slug_/slides",
      );
      expect(router.matchRoutes(`/api/public/pdf/${slug}`).at(-1)?.routeId).toBe(
        "/api/public/pdf/$slug",
      );
    },
  );
  it.each([
    ["/poll", "/poll"],
    ["/polls/ep003-agent-autonomy", "/polls/$slug"],
    ["/polls/ep003-agent-autonomy/results", "/polls/$slug/results"],
    ["/admin/polls", "/admin/polls"],
    ["/api/polls", "/api/polls"],
  ])("matches poll route %s", (path, routeId) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes(path).at(-1)?.routeId).toBe(routeId);
  });
});
