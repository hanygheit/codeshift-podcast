// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { readPdfCache, writePdfCache } from '@/lib/pdf-cache.server';

const key = new Request('https://codeshift-podcast.lovable.app/__pdf-cache/ep001/test');

describe('optional PDF cache', () => {
  it('allows generation when cache lookup rejects', async () => {
    const cache = { match: vi.fn().mockRejectedValue(new Error('Cache unavailable')) } as unknown as Cache;
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(await readPdfCache(cache, key)).toBeUndefined();
    expect(cache.match).toHaveBeenCalledWith(key);
    vi.restoreAllMocks();
  });

  it('preserves the successful PDF response when cache storage rejects', async () => {
    const cache = { put: vi.fn().mockRejectedValue(new Error('Storage unavailable')) } as unknown as Cache;
    const response = new Response('%PDF-1.7', { headers: { 'Content-Type': 'application/pdf' } });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(writePdfCache(cache, key, response)).resolves.toBeUndefined();
    expect(cache.put).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('%PDF-1.7');
    vi.restoreAllMocks();
  });

  it('reads an available cached PDF without changing it', async () => {
    const response = new Response('%PDF-1.7');
    const cache = { match: vi.fn().mockResolvedValue(response) } as unknown as Cache;
    expect(await readPdfCache(cache, key)).toBe(response);
  });
});