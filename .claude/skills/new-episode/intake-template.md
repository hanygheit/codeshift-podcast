# Episode intake — EP___

Fill from the user's material. Mark anything unknown as `ASK` and batch those into one question.
Do not guess dates, URLs, video IDs, names, numbers or quotes.

## Identity (required)
- Number: EP___ (next after the highest number in `EPISODES`)
- Title:
- Short title (≤ ~32 characters, used on the cover and navigation):
- Scheduled date (Saturday, YYYY-MM-DD, 19:00 Cairo):
- YouTube URL (exact link the hosts publish):
- YouTube video ID:
- Guests (if any; full names and roles exactly as they want them shown):

## Artwork (required)
- Cover asset manifest: `src/assets/ep___.<ext>.asset.json` — uploaded via Lovable? yes / ASK
- Opening style: live-session cover (`presentationCover`) / standard cover with artwork

## Live-session cover (only if chosen)
- Subtitle (1–2 short lines):
- Hook question (one or two sentences; the second line renders in teal):
- 3–4 stages (title + role; mark the one delegated/automated stage as `agent`):

## Content
- One-line promise (becomes `summary`):
- What the listener learns (becomes `description`):
- Conversation outline, in order (4–8 chapters, each one sentence):
  1.
  2.
  3.
  4.
- Frameworks, checklists or comparisons the hosts will show:
- Key messages the hosts want on the closing slides:
- Audience levels (Students / Juniors / Seniors / Tech Leads / Companies):
- Topics (existing `Topic` values only unless approved):

## Resources
- Resources the hosts already chose (title + URL):
- Areas where we should research official resources:
- Paid tools mentioned (label `Subscription` or `Free tier` honestly):

## Poll
- Needed? yes / no
- Question:
- Options (2–6; label + one-line description):
- Slug (`ep___-<topic>`):

## Delivery
- Branch name: `ep___/<short-slug>`
- Anything from previous episodes to link (e.g., `nextEpisode` on the prior brief)?
