import { createFileRoute } from "@tanstack/react-router";
import { getEpisode } from "@/content/episodes";
import { contentVersion, PDF_SOURCE_ORIGIN, pdfFilename } from "@/lib/pdf";

const json = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/public/pdf/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        // Only known episodes are rendered; the target URL is built from a fixed origin.
        const ep = getEpisode(params.slug);
        if (!ep) return json(404, "Unknown episode");
        const token = process.env['BROWSERLESS_API_KEY'];
        if (!token) return json(503, "The PDF service is not configured yet.");

        const version = contentVersion(ep);
        const filename = pdfFilename(ep);
        const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
        const cacheKey = new Request(`${PDF_SOURCE_ORIGIN}/__pdf-cache/${ep.slug}/${version}`);
        const cached = cache ? await cache.match(cacheKey) : undefined;
        if (cached) return cached;

        const target = `${PDF_SOURCE_ORIGIN}/episodes/${ep.slug}/slides?export=1&v=${version}`;
        let res: Response;
        try {
          res = await fetch(`https://production-sfo.browserless.io/pdf?token=${encodeURIComponent(token)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(55_000),
            body: JSON.stringify({
              url: target,
              emulateMediaType: "screen",
              viewport: { width: 1920, height: 1080 },
              gotoOptions: { waitUntil: "networkidle0", timeout: 45_000 },
              waitForSelector: { selector: "[data-export-ready]", timeout: 20_000 },
              options: {
                width: "1920px", height: "1080px", printBackground: true, preferCSSPageSize: true,
                margin: { top: "0", right: "0", bottom: "0", left: "0" },
              },
            }),
          });
        } catch (e) {
          console.error("PDF render request failed", e);
          return json(504, "PDF generation timed out. Please retry.");
        }
        if (!res.ok) {
          console.error("PDF render failed", res.status, (await res.text()).slice(0, 500));
          return json(502, "PDF generation failed. Please retry.");
        }
        const bytes = await res.arrayBuffer();
        const head = new TextDecoder().decode(bytes.slice(0, 5));
        if (head !== "%PDF-") return json(502, "PDF generation returned an invalid file.");

        const out = new Response(bytes, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "public, max-age=3600",
          },
        });
        if (cache) await cache.put(cacheKey, out.clone());
        return out;
      },
    },
  },
});
