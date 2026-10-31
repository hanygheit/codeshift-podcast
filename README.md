# CodeShift Podcast

CodeShift is an independent weekly Arabic podcast about software engineering in the AI era. Each live conversation is paired with an episode archive, editorial notes, reference slides, downloadable PDFs, and curated learning resources.

**Live site:** [codeshift-podcast.lovable.app](https://codeshift-podcast.lovable.app) · **Schedule:** Saturdays at 7:00 PM Cairo time

## What is here

- Browse and search editorial episodes alongside eligible public CodeShift recordings from YouTube.
- Explore episode summaries, takeaways, and curated resources.
- Open responsive presentations and download selectable, vector-based PDFs.
- See the hosts, upcoming live session, and project information.

The podcast is delivered in conversational Egyptian Arabic. The written notes and resources are in English. CodeShift is a community knowledge-sharing initiative, not a commercial training platform.

## Development

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

Useful scripts:

```sh
npm run lint
npm test
npm run build
```

`YOUTUBE_API_KEY` enables the server-fetched upcoming session and YouTube recording discovery. `YOUTUBE_PLAYLIST_ID` is optional; when set, it selects the playlist used for completed recordings. Without a playlist ID, recordings are discovered from the channel uploads.

## Project structure

- `src/content/` — canonical site, episode, executive brief, and resource content. Add editorial episodes in `episodes.ts` or an episode module imported by it; routes, presentations, and PDFs consume those records.
- `src/routes/` — file-based TanStack Start routes, including the home page, episode archive, episode details, presentations, and About page.
- `src/lib/deck-model.ts` — shared presentation model used by the SVG slides and PDF export.
- `src/lib/youtube.functions.ts` — server-side YouTube API integration.

## Lovable

This project is connected to [Lovable](https://lovable.dev). You can also continue developing it in the [Lovable editor](https://lovable.dev/projects/437097bb-702e-4a63-a16c-631f1881cb50); changes made there sync with this repository.
