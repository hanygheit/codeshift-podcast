# Codeshift Podcast

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://codeshift-podcast.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/437097bb-702e-4a63-a16c-631f1881cb50).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## EP003: From Prompt to Pull Request

Episode content is repository-managed in `src/content/ep003.ts`, with the 13-slide
editorial sequence in `src/content/executive-briefs.ts`. The existing shared routes
serve `/episodes/ep003` and `/episodes/ep003/slides`; there is no database migration
or new secret required.

The viewer supports arrow keys, Home/End, a contents search, slide progress,
browser Back, and native fullscreen with an immersive fallback. Portrait phones
use the semantic reading view. Official learning and documentation links are on
the final two slides.

`/api/public/pdf/ep003` generates a downloadable vector PDF with `pdf-lib`, bundled
fonts, 13 pages at 1920×1080, and clickable links. SVG and PDF use the same
`buildDeck()` layout. Bump `DECK_DESIGN_VERSION` when changing the layout or fonts.

Validate with `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
The repository currently has pre-existing full-lint failures, primarily formatting.
Lovable artwork URLs require the hosted asset service; the original artwork
references are preserved. Automatic YouTube discovery retains its existing
server-side `YOUTUBE_API_KEY` requirement and optional `YOUTUBE_PLAYLIST_ID`.
Publish through the existing Lovable-connected deployment; no history rewriting
or infrastructure changes are needed.
