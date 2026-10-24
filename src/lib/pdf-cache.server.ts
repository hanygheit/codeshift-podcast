/** Caching is optional: cache service failures must never prevent a PDF download. */
export async function readPdfCache(cache: Cache | undefined, key: Request): Promise<Response | undefined> {
  try { return await cache?.match(key); }
  catch (error) { console.warn('PDF cache read unavailable', error); return undefined; }
}

export async function writePdfCache(cache: Cache | undefined, key: Request, response: Response): Promise<void> {
  try { await cache?.put(key, response.clone()); }
  catch (error) { console.warn('PDF cache write unavailable', error); }
}