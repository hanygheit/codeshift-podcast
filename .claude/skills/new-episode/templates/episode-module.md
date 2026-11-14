# Episode module template

Copy into `src/content/epNNN.ts`, rename `EPNNN`/`epNNN`, replace every `<…>` value, and delete
optional fields you do not use. Pattern source: `src/content/ep003.ts`.

```ts
import type { Episode } from "./types";
import cover from "@/assets/epNNN.jpg.asset.json";

export const EPNNN: Episode = {
  id: "epNNN",
  number: 0, // <episode number>
  slug: "epNNN",
  title: "<Full episode title>",
  shortTitle: "<≤ ~32 chars>",
  scheduledDate: "2026-01-01", // <Saturday, YYYY-MM-DD>
  youtubeVideoId: "<videoId>",
  youtubeUrl: "https://www.youtube.com/live/<videoId>",
  thumbnail: cover.url,
  description: "<1–2 sentences: what the listener will learn and why it matters now.>",
  summary: "<One sharp line.>",
  overview: ["<Short framing line>", "<The episode's central question?>"],
  topics: ["Coding Agents"], // existing Topic values, 2–4
  audienceLevels: ["Juniors", "Seniors"],
  tags: ["<tag>", "<tag>", "<tag>"],
  takeaways: ["<Imperative takeaway.>", "<…>", "<…>", "<…>"],
  actionItems: ["<Concrete action.>", "<…>", "<…>", "<…>"],
  presentationLabel: "Presentation & Resources",
  resourceIds: [],
  slides: [],

  // Optional live-session opening slide. Remove to use the standard artwork cover.
  presentationCover: {
    subtitle: "<Subtitle line one>\n<Subtitle line two>",
    question: "<Hook sentence one.> <Hook question two?>",
    stages: [
      { title: "<Stage>", role: "<Actor / What>", agent: true },
      { title: "<Stage>", role: "<Actor / What>" },
      { title: "<Stage>", role: "<Actor / What>" },
      { title: "<Stage>", role: "<Actor / What>" },
    ],
  },

  resourceSlideTitles: ["<First resource slide title>", "<Second resource slide title>"],

  brief: {
    summaryHeadline: "<Headline for the brief>",
    summary: ["<One to three short paragraphs.>"],
    lessons: [
      // ≥ 4: the episode page shows the first four under "What you'll learn".
      { title: "<Lesson>", body: "<One sentence.>" },
      { title: "<Lesson>", body: "<One sentence.>" },
      { title: "<Lesson>", body: "<One sentence.>" },
      { title: "<Lesson>", body: "<One sentence.>" },
    ],
    actions: [{ role: "<Audience>", items: ["<Action>", "<Action>"] }],
    finalMessage: "<Closing line.>",
    watchLabel: "Watch Live / Replay", // remove once the replay is confirmed
    resourceGroups: [
      {
        label: "<Group one — e.g. Official learning courses>",
        items: [
          {
            title: "<Resource title as the provider names it>",
            provider: "<Provider · what it is for>",
            url: "https://<verified-url>",
            access: "Free", // "Free" | "Free tier" | "Subscription"
          },
        ],
      },
      {
        label: "<Group two — e.g. Documentation & references>",
        items: [],
      },
    ],
  },
};
```
