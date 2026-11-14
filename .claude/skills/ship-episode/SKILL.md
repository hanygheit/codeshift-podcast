---
name: ship-episode
description: Publish a verified CodeShift episode — README episode table, roadmap, commit, push and pull request to main (which Lovable syncs) — plus the after-broadcast follow-ups. Use when an episode is ready to ship, when the user asks to commit/push/open a PR for an episode, or after the live show to wrap the episode up.
argument-hint: "[epNNN] [before|after]"
---

# Ship an episode

`main` is connected to Lovable: whatever merges there syncs to the Lovable project and is published
from it. Keep `main` working, and never rewrite pushed history (no force-push, rebase, amend or
squash of pushed commits).

## Before the PR

1. `/verify-episode epNNN` has passed on the final content (or its failures are understood and
   reported to the user).
2. **README.md** — add a row at the bottom of the "Episodes" table, same format:

   ```md
   | EPNNN — <Title> | <Month D, YYYY> | [Summary & resources](https://codeshift-podcast.lovable.app/episodes/epNNN) | [Watch](<youtubeUrl>) |
   ```

   Update the sentence that links an example presentation only if the user wants the newest episode
   there.
3. **roadmap.md** — add a short block in the existing style: done items `- [x]` with what was verified
   (slide count, tests passing), and open items `- [ ]` for anything waiting on publication
   (e.g. "Verify EPNNN artwork and PDF on the published site").
4. **AGENTS.md** — only if this episode introduced a new reusable mechanism (one line, same terse
   "rule. Why: reason." style). Lovable reads this file too.

## Commit, push, PR (only when the user asks or approves)

```bash
git switch -c epNNN/<short-slug>      # if not already on the episode branch
git add <explicit paths only>          # never `git add -A`: other sessions or temp files may be present
git commit                             # message: "Add EPNNN: <short title>" + body + attribution trailer
git push -u origin epNNN/<short-slug>
```

If `main` moved, merge it into the branch (`git merge origin/main`) — do not rebase pushed commits.

Open the PR to `main` with `gh pr create`. Body:
- What the episode adds (title, date, slide count, resource count, poll slug if any).
- Verification: tests (count), typecheck, build, browser walk-through, PDF page count.
- Not verified yet: e.g. artwork or PDF on the published site (needs Lovable publish).

## After merge

Lovable syncs `main`; the user publishes from Lovable. Then check on
https://codeshift-podcast.lovable.app: `/episodes/epNNN`, `/episodes/epNNN/slides`, the PDF
download, and the artwork. Tick the matching `roadmap.md` items in a follow-up commit.

## After the live broadcast

- The live URL becomes the replay. Once the replay is confirmed and the hosts agree, remove
  `brief.watchLabel` (so the button reads the default) — this is a content change, PDF cache
  refreshes automatically.
- Do not add the recording as a separate item: the YouTube library merges it with the editorial
  record by `youtubeVideoId`. If it shows twice, the ID in `epNNN.ts` is wrong.
- If a poll ran: the host closes it in `/admin/polls`; it remains viewable at `/polls/<slug>`.
- Apply any corrections the hosts send (wording, resources) as a small PR; keep slide ids stable so
  shared `?slide=` links keep working.
