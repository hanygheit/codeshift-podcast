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
- Institutional support artwork uses the shared SupportBadge overlaid at the bottom-left corner of the hero host-photo frame and in the existing footer, always smaller than the navbar logo, separate from Logo and never in the navbar or a standalone section. Why: preserve supplied artwork and keep CodeShift the primary identity.
- The uploaded logo file has the "Supported by iti" line baked into its lower band; the navbar logo masks that band with the badge's own white field (Logo hideSupport) while the footer logo stays untouched. Why: the header must carry no ITI wording without redrawing the supplied mark.

- Episode presentations are built by buildDeck() (src/components/deck) from episode data and rendered on a fixed 1920×1080 SlideFrame; the player, thumbnails and the `?export=1` view share it. Why: one visual source for web and PDF.
- PDFs are rendered server-side by Browserless via /api/public/pdf/$slug loading the published `?export=1` view from a fixed origin; never use window.print or client PDF libraries. Bump DECK_DESIGN_VERSION when slide design changes. Why: slide-accurate downloadable PDFs, cache invalidation.
- Learning resources live on each episode (EpisodeResources) — never a global directory on the home page. Why: user requirement.
- Home and /episodes share EpisodeExplorer + filterEpisodes (URL search params, 10/page, default episode number desc). Why: one discovery logic.
- Upcoming Episode is fetched server-side (getUpcomingLive) from the YouTube Data API via the channel uploads playlist + videos.list (low quota), cached 20 min; needs YOUTUBE_API_KEY. Never hardcode upcoming episodes. Why: automatic schedule sync.
- Episode library (EpisodeExplorer) merges editorial EPISODES with getYoutubeRecordings (completed public videos ≥10 min, YOUTUBE_PLAYLIST_ID if set else uploads filtered to 'CodeShift' titles, cached 45 min), matched by youtubeVideoId; YouTube-only items get Watch only, no page. Why: auto-discovery without fabricating editorial content.
