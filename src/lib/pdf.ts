import type { Episode } from "@/content/types";
import { pad } from "@/content/episodes";

/** Published origin the PDF renderer loads; never taken from user input. */
export const PDF_SOURCE_ORIGIN = "https://codeshift-podcast.lovable.app";

/** Bump when slide design changes so cached PDFs are regenerated. */
export const DECK_DESIGN_VERSION = "deck-1";

export function pdfFilename(ep: Episode) {
  return `CodeShift_EP${pad(ep.number)}_${ep.brief?.packages ? "Learning_Playbook" : "Executive_Summary"}.pdf`;
}

/** Stable short hash of episode content + design version, used for cache invalidation. */
export function contentVersion(ep: Episode) {
  const s = DECK_DESIGN_VERSION + JSON.stringify(ep);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
