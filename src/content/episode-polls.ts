/**
 * Always-open audience polls embedded on episode pages.
 *
 * Each poll is a row in the `polls` table with status `open` (seeded by a migration). The episode
 * page renders the copy below and reads/writes votes through `/api/polls`; option ids must match
 * the database record. Results are real aggregates and are shown only after a visitor votes.
 */
export interface EpisodePollOption {
  id: string;
  letter: string;
  marker: string;
  label: string;
}

export interface EpisodePoll {
  /** Slug of the poll record in the `polls` table. */
  slug: string;
  /** Element id on the episode page; the share link is `<shareUrl>` and ends with `#<anchor>`. */
  anchor: string;
  shareUrl: string;
  marker: string;
  title: string;
  subtitle: string;
  scenario: { context: string; quote: string; question: string };
  options: EpisodePollOption[];
  insight: {
    title: string;
    points: { lead?: string; text: string }[];
    takeaway: string;
  };
  closing: string;
  watchLabel: string;
  shareText: string;
}

export const EP004_ARCHITECTURE_POLL: EpisodePoll = {
  slug: "ep004-first-architecture-decision",
  anchor: "architecture-poll",
  shareUrl: "https://codeshift-podcast.lovable.app/episodes/ep004#architecture-poll",
  marker: "🏗️",
  title: "You’re the Architect. What Would YOU Build?",
  subtitle: "One scenario. Four choices. What’s your architecture mindset?",
  scenario: {
    context: "Your team is building a new E-Commerce platform. The CEO says:",
    quote:
      "We’re starting with 1,000 users, but we might reach 1 million. I want the system scalable, reliable, and ready for growth!",
    question: "What’s your FIRST architectural decision?",
  },
  options: [
    {
      id: "a",
      letter: "A",
      marker: "🚀",
      label: "Start with Microservices for maximum scalability.",
    },
    {
      id: "b",
      letter: "B",
      marker: "🏗️",
      label: "Start with a Modular Monolith and evolve when needed.",
    },
    { id: "c", letter: "C", marker: "☁️", label: "Build on Kubernetes from day one." },
    {
      id: "d",
      letter: "D",
      marker: "🤔",
      label: "Ask more questions before choosing the architecture.",
    },
  ],
  insight: {
    title: "Architecture Insight",
    points: [
      {
        text: "Before selecting an architecture, clarify the real requirements, expected traffic, growth patterns, availability targets, budget, and team capabilities.",
      },
      {
        lead: "D — Ask more questions",
        text: "demonstrates the strongest architectural thinking at this stage.",
      },
      {
        lead: "B — Modular Monolith",
        text: "could be an excellent starting architecture once the requirements justify it.",
      },
      {
        text: "Microservices and Kubernetes may become useful, but they aren’t automatically necessary because a system might eventually serve 1 million users.",
      },
    ],
    takeaway: "Great architecture starts with questions, not technologies.",
  },
  closing: "There is no one-size-fits-all architecture. Context and trade-offs matter!",
  watchLabel: "Watch EP004: Inside Software Architecture",
  shareText:
    "You’re the Architect. What would YOU build? One scenario, four choices — take the CodeShift EP004 architecture challenge.",
};

/** Episode id → embedded poll. Episodes without an entry render no poll. */
export const EPISODE_POLLS: Readonly<Record<string, EpisodePoll>> = {
  ep004: EP004_ARCHITECTURE_POLL,
};
