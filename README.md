# CodeShift — Think Beyond the Code.

<p align="center">
  <img src="https://codeshift-podcast.lovable.app/__l5e/assets-v1/96d5f751-d155-443e-bbfb-fae5280ce89b/codeshift-logo.png" alt="CodeShift logo" width="160">
</p>

**CodeShift** is a weekly Arabic tech podcast and knowledge hub exploring software engineering in the AI era. It is for software developers, students, engineering leaders, and teams working out how AI is changing the craft.

Each conversation is paired with an episode page, an editorial summary, practical takeaways, a presentation, and curated learning resources. The podcast is conversational Egyptian Arabic; the written notes and resources are in English.

**Website:** [codeshift-podcast.lovable.app](https://codeshift-podcast.lovable.app) · **Schedule:** Saturdays at 7:00 PM Cairo time

## Features

- Browse editorial episodes alongside eligible public CodeShift recordings discovered on YouTube. YouTube-only recordings link to the video; they do not get an editorial episode page automatically.
- Read episode summaries, key takeaways, and action items, then follow curated resources and references.
- Open responsive, fullscreen-friendly presentations. Slide position is URL-driven, so links can be shared and browser Back preserves navigation.
- Download presentation PDFs generated on the server from the same slide model as the on-site presentation. PDFs include selectable text and linked references.
- Search by keyword, episode number, or topic; filter by topic, audience, or year; sort results and navigate paginated lists.
- Use the site on desktop and mobile, including an adaptive reading layout for presentation content on portrait phones.

## Episodes

The editorial records currently define these episode pages. Dates are the scheduled dates in the content; each YouTube link is the configured live/replay URL, not a guarantee that a replay is available.

| Episode | Scheduled date | Episode page | YouTube |
| --- | --- | --- | --- |
| EP001 — If AI Can Write the Code, What Should Developers Learn Now? | October 17, 2026 | [Summary & resources](https://codeshift-podcast.lovable.app/episodes/ep001) | [Watch](https://www.youtube.com/live/bJTXs9y39Lw) |
| EP002 — The New Developer Playbook: What to Learn in the AI Era | October 24, 2026 | [Summary & resources](https://codeshift-podcast.lovable.app/episodes/ep002) | [Watch](https://www.youtube.com/live/CohumEwctE4) |
| EP003 — From Prompt to Pull Request: Working with AI Coding Agents | October 31, 2026 | [Summary & resources](https://codeshift-podcast.lovable.app/episodes/ep003) | [Watch](https://youtube.com/live/u114p0sd86I) |

Each editorial presentation is available at `/episodes/<slug>/slides`; for example, [EP003 presentation](https://codeshift-podcast.lovable.app/episodes/ep003/slides). Dates and episode content are maintained in the repository.

## Technology

- **Application:** React 19, TypeScript, TanStack Start and TanStack Router, built with Vite.
- **UI:** Tailwind CSS 4, Radix UI primitives, and project components in `src/components/ui/`.
- **Presentations and PDFs:** A shared TypeScript deck model rendered as SVG in the browser and as PDF on the server using `pdf-lib` and `fontkit`.
- **Episode discovery:** Optional server-side YouTube Data API integration for upcoming broadcasts and completed public recordings.
- **Content and persistence:** Editorial content is stored in TypeScript modules in the repository. The active episode and resource flows do not use a database.

## Project structure

```text
src/
  content/
    episodes.ts             Canonical editorial episode list
    ep003.ts                Episode-specific record example
    executive-briefs.ts     Executive-brief presentation copy
    resources.ts            Curated shared resources
    site.ts                 Site identity, social links, and host profiles
  components/              Shared site, episode discovery, and presentation UI
    deck/                  Presentation player, slide rendering, and PDF download
  routes/                  Home, archive, About, episode, and PDF API routes
  lib/
    archive.ts             Episode filtering, sorting, and pagination
    deck-model.ts          Shared presentation model and slide layout
    deck-pdf.server.ts     Server-side PDF generation
    youtube.functions.ts   Server-side YouTube Data API integration
public/fonts/              Bundled presentation fonts
drizzle/                   Database schema scaffold (currently empty)
supabase/                  Supabase project configuration scaffold
```

`src/content/episodes.ts` is the canonical editorial episode list. Episode-specific records can live in their own module, as EP003 does in `src/content/ep003.ts`. `src/content/executive-briefs.ts` holds additional presentation copy. The episode routes, presentations, and PDF endpoint consume this repository-managed content.

`src/lib/deck-model.ts` defines the shared presentation model; `src/components/deck/` renders it in the browser, and `src/lib/deck-pdf.server.ts` generates PDFs. The PDF endpoint is `src/routes/api/public/pdf.$slug.ts`; the YouTube integration is in `src/lib/youtube.functions.ts`.

## Getting started

**Requirement:** [Bun](https://bun.sh/). The repository includes `bun.lock`.

```sh
bun install --frozen-lockfile
bun run dev
```

The development server URL is printed by Vite. Other project commands:

```sh
bun run lint
bun run test
bun run build
bun run preview
```

`bun run preview` serves the production build locally. YouTube API credentials are optional; the editorial site and episodes do not require them.

## Configuration

| Variable | Requirement | Purpose |
| --- | --- | --- |
| `YOUTUBE_API_KEY` | Optional | Enables server-side upcoming-broadcast lookup and completed-recording discovery. Without it, those dynamic YouTube results are unconfigured; editorial episodes remain available. |
| `YOUTUBE_PLAYLIST_ID` | Optional | Selects the playlist for completed-recording discovery. If unset, the integration checks the configured channel's uploads and filters titles for “CodeShift.” |
| `YOUTUBE_CHANNEL_ID` | Optional | Overrides the channel used for completed-recording discovery when no playlist is set. Upcoming-broadcast lookup uses the CodeShift channel ID defined in source. |

Set these variables in the local environment or deployment provider; do not commit credentials. No environment variables are required for the editorial episode content or local development. Supabase client/auth and cron helper modules are present as scaffolding but are not connected to the current routes; their configuration is not needed to run the site.

## Adding episode content

1. Define an `Episode` record with its number, route slug, title, scheduled date, YouTube video ID and URL, description, summary, topics, audience, takeaways, and action items. The shape is defined in `src/content/types.ts`.
2. Add presentation content to the record. The current content model supports an executive brief or the legacy declarative slide format; shared templates use the episode's editorial content.
3. Add reusable curated resources to `src/content/resources.ts` and reference them from the episode. Episode-specific brief resource groups can also provide presentation references.
4. Add the record to `EPISODES` in `src/content/episodes.ts`, directly or by importing an episode module such as `src/content/ep003.ts`. The archive and episode routes are generated from this list.
5. Visit `/episodes/<slug>` and `/episodes/<slug>/slides`. The PDF download uses the same canonical deck model at `/api/public/pdf/<slug>`; no separate PDF layout or browser-print step is needed.

YouTube-discovered recordings can appear in the archive without an editorial record. Add an editorial record only when the episode page, summary, and presentation content are ready.

## Deployment

The website is published at [codeshift-podcast.lovable.app](https://codeshift-podcast.lovable.app) and the project is connected to Lovable. The Vite configuration uses the Lovable TanStack Start configuration; its Nitro build integration defaults to the Cloudflare target. Build with `bun run build`. This repository does not include a separate CI deployment workflow or provider-specific deployment guide, so production publishing is managed through the connected Lovable project.

## Hosts & community

- **Hany Saad:** [LinkedIn](https://www.linkedin.com/in/hanysaad)
- **Ahmed Mamdoh:** [LinkedIn](https://www.linkedin.com/in/ahmed-mamdoh-8563495a)
- **CodeShift:** [Website](https://codeshift-podcast.lovable.app) · [YouTube](https://www.youtube.com/@CodeShiftPodcast) · [Facebook](https://www.facebook.com/CodeShiftPodcast)

## License

No license file is currently included, so the repository does not declare a reuse license.
