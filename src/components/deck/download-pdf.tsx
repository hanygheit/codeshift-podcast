import { useState } from 'react';
import { FileDown, Loader2, RotateCcw } from 'lucide-react';
import type { Episode } from '@/content/types';
import { pdfFilename } from '@/lib/pdf';
import { deliverFile } from '@/lib/download';
import { Button } from '@/components/ui/button';

export function DownloadPdfButton({ ep, className }: { ep: Episode; className?: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState('');
  const [prepared, setPrepared] = useState<Blob | null>(null);
  const run = async () => {
    if (state === 'loading') return;
    if (prepared) { void deliverFile(prepared, pdfFilename(ep)); return; }
    setState('loading'); setError('');
    try {
      const res = await fetch(`/api/public/pdf/${ep.slug}`, { signal: AbortSignal.timeout(60_000) });
      if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.error ?? 'PDF generation failed. Please retry.'); }
      const blob = await res.blob();
      if (blob.type !== 'application/pdf' || blob.size === 0) throw new Error('The PDF could not be downloaded. Please retry.');
      if (matchMedia('(pointer: coarse)').matches) { setPrepared(blob); setState('ready'); }
      else { await deliverFile(blob, pdfFilename(ep)); setState('idle'); }
    } catch (e) { setError(e instanceof Error ? e.message : 'PDF generation failed.'); setState('error'); }
  };
  return <span className="relative inline-flex flex-col items-end">
    <Button variant="outline" onClick={run} disabled={state === 'loading'} className={className} aria-live="polite" title="Download the complete presentation as a PDF">
      {state === 'loading' ? <Loader2 className="animate-spin" /> : state === 'error' ? <RotateCcw /> : <FileDown />}
      <span className="hidden sm:inline">{state === 'loading' ? 'Generating PDF…' : state === 'error' ? 'Retry PDF' : state === 'ready' ? 'Save PDF' : 'Download PDF'}</span>
      <span className="sr-only sm:hidden">{state === 'loading' ? 'Generating PDF' : state === 'ready' ? 'Save PDF' : 'Download PDF'}</span>
    </Button>
    {state === 'error' && <span role="alert" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-md border bg-popover p-3 text-xs text-destructive">{error}</span>}
  </span>;
}
