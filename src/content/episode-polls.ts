/**
 * Always-open audience polls embedded on episode pages.
 *
 * Each poll is a row in the `polls` table with status `open` (seeded by a migration). The episode
 * page renders the copy below and reads/writes votes through `/api/polls`; option ids must match
 * the database record. Votes are real and stored server-side; community results are visible to hosts only (results PIN).
 */
export interface EpisodePollOption {
  id: string;
  letter: string;
  marker: string;
  label: string;
  /** Shown to a visitor who picked this option: a short verdict and why. */
  feedback: { headline: string; body: string };
  /** One-line takeaway for this option, listed for every option after answering. */
  insight: string;
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
  /** The option the hosts consider the best answer; named explicitly after answering. */
  bestOptionId: string;
  insight: { title: string; intro: string; takeaway: string };
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
      feedback: {
        headline: "Ambitious — but probably too early.",
        body: "Microservices let parts of a system scale and deploy independently, but they bring network calls, distributed data, and heavier deployment and monitoring from day one. With 1,000 users and unclear requirements, you pay that cost long before you need the benefit.",
      },
      insight:
        "Valuable when many teams must deploy and scale parts of a large system independently. For 1,000 users it adds cost and complexity before there is a need.",
    },
    {
      id: "b",
      letter: "B",
      marker: "🏗️",
      label: "Start with a Modular Monolith and evolve when needed.",
      feedback: {
        headline: "A strong, pragmatic starting point.",
        body: "One application with clear module boundaries is simple to build and change, and you can split out services later if real load or team growth demands it. Just confirm the requirements actually point here before you commit.",
      },
      insight:
        "Usually the best architecture to start building with: simple to run, and easy to split later. It is the right second step, after the requirements are clear.",
    },
    {
      id: "c",
      letter: "C",
      marker: "☁️",
      label: "Build on Kubernetes from day one.",
      feedback: {
        headline: "Powerful — but it solves a problem you don’t have yet.",
        body: "Kubernetes is great for running many services at scale, but it adds real operational work. For 1,000 users, a managed platform or a simple deployment is usually enough; adopt Kubernetes when your deployment needs justify it.",
      },
      insight:
        "A deployment platform, not an architecture. Worth adopting once you run many services at real scale, not on day one.",
    },
    {
      id: "d",
      letter: "D",
      marker: "🤔",
      label: "Ask more questions before choosing the architecture.",
      feedback: {
        headline: "That’s the architect’s mindset.",
        body: "Traffic, growth, availability targets, budget and team skills decide the architecture. “We might reach 1 million” is a possibility, not a requirement — clarify it before you choose any technology.",
      },
      insight:
        "The best first decision. Real requirements, traffic, availability targets, budget and team skills decide everything that follows.",
    },
  ],
  bestOptionId: "d",
  insight: {
    title: "Architecture Insight",
    intro:
      "Before selecting an architecture, clarify the real requirements, expected traffic, growth patterns, availability targets, budget, and team capabilities. Here is how each choice holds up:",
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
