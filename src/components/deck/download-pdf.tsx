import { useState } from "react";
import { FileDown, Loader2, RotateCcw } from "lucide-react";
import type { Episode } from "@/content/types";
import { pdfFilename } from "@/lib/pdf";

/** Downloads the backend-rendered PDF for an episode deck. */
export function DownloadPdfButton({ ep, className }: { ep: Episode; className?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const run = async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/public/pdf/${ep.slug}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "PDF generation failed.");
      }
      const blob = await res.blob();
      if (blob.type !== "application/pdf" || blob.size === 0) throw new Error("The server did not return a valid PDF.");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = pdfFilename(ep);
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setState("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF generation failed.");
      setState("error");
    }
  };
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button onClick={run} disabled={state === "loading"} className={className} aria-live="polite">
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "error" ? <RotateCcw className="h-4 w-4" /> : <FileDown className="h-4 w-4" />}
        {state === "loading" ? "Generating PDF…" : state === "error" ? "Retry PDF" : "Download PDF"}
      </button>
      {state === "error" && <span role="alert" className="text-xs text-destructive">{error}</span>}
    </span>
  );
}
