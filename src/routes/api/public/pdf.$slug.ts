import { createFileRoute } from '@tanstack/react-router';
import { getEpisode } from '@/content/episodes';
import { contentVersion, PDF_SOURCE_ORIGIN, pdfFilename } from '@/lib/pdf';
import { readPdfCache, writePdfCache } from '@/lib/pdf-cache.server';

const memory = new Map<string, Uint8Array>();
const pending = new Map<string, Promise<Uint8Array>>();
export const Route = createFileRoute('/api/public/pdf/$slug')({
  server: { handlers: { GET: async ({ params, request }) => {
    const ep = getEpisode(params.slug);
    if (!ep) return Response.json({ error: 'Unknown episode' }, { status: 404 });
    const key = `${ep.slug}/${contentVersion(ep)}`;
    const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
    const cacheKey = new Request(`${PDF_SOURCE_ORIGIN}/__pdf-cache/${key}`);
     const cached = await readPdfCache(cache, cacheKey);
    if (cached) return cached;
    try {
      let data = memory.get(key);
      if (!data) {
        let job = pending.get(key);
        if (!job) {
          job = import('@/lib/deck-pdf.server').then(m => m.generateDeckPdf(ep));
          pending.set(key, job);
        }
        try { data = await job; } finally { pending.delete(key); }
        memory.set(key, data);
        if (memory.size > 6) { const first = memory.keys().next().value; if (first) memory.delete(first); }
      }
      if (request.signal.aborted) return new Response(null, { status: 499 });
      const response = new Response(new Uint8Array(data).buffer, { headers: {
        'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${pdfFilename(ep)}"`,
        'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff',
      } });
       await writePdfCache(cache, cacheKey, response);
      return response;
    } catch (error) {
      console.error('Local PDF generation failed', error);
      return Response.json({ error: 'We could not prepare the PDF. Please retry.' }, { status: 500 });
    }
  } } },
});
