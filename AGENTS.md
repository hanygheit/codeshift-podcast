<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Content is repository-managed in src/content (episodes.ts, resources.ts, site.ts); routes render from it — add episodes by adding records, never by editing route components. Why: single source of truth for pages, slides and PDF.
- PDF export uses native window.print() with a print-only PrintDeck sharing the SlideView component; never add PDF libraries. Why: user requirement and identical web/print visuals.
- An episode with a `brief` field (EP001, EP002) renders a single scrollable BriefView instead of the SlideView deck on /episodes/$slug/slides — no deck controls; printing shows the brief itself. Briefs may add optional sections (packages, careerLevels, juniorAi, adoption, caseStudy) rendered by BriefView when present. Why: user requirement "one episode = one slide".
