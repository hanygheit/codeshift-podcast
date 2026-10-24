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
- Institutional support artwork uses the shared SupportBadge in the footer only — never in the navbar, hero, or a standalone section — always smaller than the navbar logo and separate from Logo. Why: preserve supplied artwork and keep CodeShift the primary identity.

- Episode presentations use the pure buildDeck() declarative primitive model in src/lib/deck-model.ts; SVG SlideFrame and the local pdf-lib backend consume the same 1920×1080 geometry, font metrics, palette, assets and link nodes. Why: vector fidelity without HTML conversion.
- PDFs are generated directly by pdf-lib and fontkit inside /api/public/pdf/$slug using bundled fonts and original artwork, with link annotations and versioned caching; never use browser printing, browser automation or external conversion services. Bump DECK_DESIGN_VERSION when design or fonts change. Why: selectable, slide-accurate backend downloads without paid infrastructure.
- Episode pages are discovery-only; full resources and editorial education live in the presentation, with adaptive semantic reading on portrait phones. Why: short episode pages and readable resource access.
- Presentation navigation is URL-driven with history entries, bounded indices and input-aware keyboard/touch handlers. Why: direct links and natural browser Back preserve slide position.
- Vector slides scale natively through their fixed SVG viewBox and aspect-ratio wrapper rather than JavaScript measurement. Why: avoid blank initial slides and resize races while sharing exact PDF coordinates.
- Home and /episodes share EpisodeExplorer + filterEpisodes (URL search params, 10/page, default episode number desc). Why: one discovery logic.
- Upcoming Episode is fetched server-side (getUpcomingLive) from the YouTube Data API via the channel uploads playlist + videos.list (low quota), cached 20 min; needs YOUTUBE_API_KEY. Never hardcode upcoming episodes. Why: automatic schedule sync.
- Episode library (EpisodeExplorer) merges editorial EPISODES with getYoutubeRecordings (completed public videos ≥10 min, YOUTUBE_PLAYLIST_ID if set else uploads filtered to 'CodeShift' titles, cached 45 min), matched by youtubeVideoId; YouTube-only items get Watch only, no page. Why: auto-discovery without fabricating editorial content.
