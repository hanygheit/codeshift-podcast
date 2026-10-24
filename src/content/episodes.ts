import ep001Thumb from "@/assets/ep001.png.asset.json";
import ep002Thumb from "@/assets/ep002.png.asset.json";
import type { Episode } from "./types";

/**
 * Editorial episode records. To add an episode, append a record here —
 * routes, archive, slides and PDF export all read from this list.
 * Notes are editorial summaries, not verbatim transcripts.
 */
export const EPISODES: Episode[] = [
  {
    id: "ep001",
    number: 1,
    slug: "ep001",
    title: "If AI Can Write the Code, What Should Developers Learn Now?",
    shortTitle: "What Should Developers Learn Now?",
    scheduledDate: "2026-10-17",
    youtubeVideoId: "bJTXs9y39Lw",
    youtubeUrl: "https://www.youtube.com/live/bJTXs9y39Lw",
    thumbnail: ep001Thumb.url,
    description:
      "The opening CodeShift discussion on how the developer role is changing as AI writes more of the code.",
    summary:
      "Hany and Ahmed explore the changing developer role, why engineering fundamentals matter more than ever, and how juniors and seniors can learn with AI without outsourcing their judgment.",
    overview: [
      "AI tools can now produce working code quickly. The episode asks what that means for the value a developer brings, and where learning effort should go.",
      "The discussion covers AI-assisted learning, coding agents, the position of junior developers, senior engineering judgment, system thinking and ownership of outcomes.",
    ],
    topics: ["AI-Native Engineering", "Engineering Fundamentals", "Coding Agents", "Career Growth"],
    audienceLevels: ["Students", "Juniors", "Seniors"],
    tags: ["developer role", "fundamentals", "AI-assisted learning", "ownership", "system thinking"],
    takeaways: [
      "Generating code is becoming cheap; judging, integrating and owning code is where value concentrates.",
      "Fundamentals — data structures, design, debugging, testing — are what let you evaluate AI output.",
      "Use AI as a tutor that explains and challenges you, not only as a generator that answers for you.",
      "Senior judgment shows in trade-offs, review quality and understanding the whole system.",
      "Ownership means being accountable for behaviour in production, regardless of who or what wrote the code.",
    ],
    actionItems: [
      "Pick one fundamentals area you rely on AI for and study it until you can explain it without help.",
      "For your next AI-generated change, review it line by line and write the tests yourself.",
      "Ask an AI assistant to quiz you on a concept instead of solving the task for you.",
      "Draw the architecture of a system you work on and identify where AI-written code enters it.",
    ],
    resourceIds: ["roadmap-sh", "github-copilot-docs", "anthropic-effective-agents", "fowler-architecture", "ms-learn"],
    slides: [
      { id: "cover", type: "cover", section: "Episode 001", title: "If AI Can Write the Code, What Should Developers Learn Now?", subtitle: "CodeShift · Reference deck", blocks: [] },
      {
        id: "summary", type: "summary", section: "Overview", title: "Executive summary",
        blocks: [{ kind: "bullets", items: [
          "AI lowers the cost of producing code, not the cost of being wrong.",
          "The developer's role shifts toward judgment, integration and ownership.",
          "Fundamentals become the lens for evaluating what AI produces.",
        ] }],
      },
      {
        id: "role-shift", type: "comparison", section: "The changing role", title: "From writing code to owning outcomes",
        blocks: [{ kind: "compare",
          left: { title: "Emphasis shrinking", items: ["Typing boilerplate", "Memorising syntax", "Isolated tickets"] },
          right: { title: "Emphasis growing", items: ["Reviewing and verifying", "System and domain understanding", "Accountability in production"] },
        }],
      },
      {
        id: "fundamentals", type: "insight", section: "Fundamentals", title: "Fundamentals are the review toolkit",
        blocks: [{ kind: "cards", items: [
          { title: "Data & algorithms", body: "Spot inefficient or incorrect logic." },
          { title: "Design", body: "Recognise coupling and poor boundaries." },
          { title: "Testing", body: "Prove behaviour instead of trusting it." },
          { title: "Debugging", body: "Diagnose what generated code actually does." },
        ] }],
      },
      {
        id: "learning-loop", type: "process", section: "Learning with AI", title: "A healthier AI-assisted learning loop",
        blocks: [{ kind: "steps", items: [
          { title: "Attempt", body: "Try the problem yourself first." },
          { title: "Ask", body: "Use AI to explain, not just answer." },
          { title: "Verify", body: "Test and read the result critically." },
          { title: "Explain", body: "Teach it back without assistance." },
        ] }],
      },
      { id: "takeaways", type: "checklist", section: "Takeaways", title: "Action items", blocks: [{ kind: "checklist", items: [] }] },
      { id: "resources", type: "resources", section: "Learn more", title: "Curated resources", blocks: [{ kind: "resources", ids: ["roadmap-sh", "github-copilot-docs", "anthropic-effective-agents", "fowler-architecture"] }] },
      { id: "closing", type: "closing", section: "CodeShift", title: "Think Beyond the Code.", subtitle: "Join us live every Saturday at 7:00 PM Cairo time.", blocks: [] },
    ],
  },
  {
    id: "ep002",
    number: 2,
    slug: "ep002",
    title: "The New Developer Playbook: What to Learn in the AI Era",
    shortTitle: "The New Developer Playbook",
    scheduledDate: "2026-10-24",
    youtubeVideoId: "CohumEwctE4",
    youtubeUrl: "https://www.youtube.com/live/CohumEwctE4",
    thumbnail: ep002Thumb.url,
    description:
      "A practical playbook of learning packages and priorities for developers and software companies in the AI era.",
    summary:
      "A structured look at six learning packages, learning priorities by career level, agentic coding, junior learning, leadership and domain knowledge — plus a 90-day adoption playbook for software companies.",
    overview: [
      "Building on episode one, this discussion turns questions into a playbook: what to learn, in what order, depending on where you are in your career.",
      "It closes with a company perspective — a 90-day approach to adopting AI-assisted engineering across teams.",
    ],
    topics: ["Career Growth", "Coding Agents", "Leadership & AI Adoption", "AI-Native Engineering"],
    audienceLevels: ["Juniors", "Seniors", "Tech Leads", "Companies"],
    tags: ["learning packages", "agentic coding", "90-day playbook", "domain knowledge", "leadership"],
    takeaways: [
      "Learning can be organised into packages rather than an endless list of tools.",
      "Priorities differ by level: juniors build foundations, seniors deepen judgment, leads shape teams.",
      "Agentic coding is a skill — scoping work, giving context and reviewing output.",
      "Business and domain knowledge differentiate engineers when code is easy to produce.",
      "Company adoption works best as a staged, measured programme rather than a tool rollout.",
    ],
    actionItems: [
      "Map yourself to a career level and choose one learning package to focus on for the next month.",
      "Run one small task end-to-end with a coding agent and document what context it needed.",
      "Spend time with a product or business stakeholder to learn one domain rule you didn't know.",
      "If you lead a team, draft goals for the first 30 days of an AI adoption plan.",
    ],
    resourceIds: ["anthropic-effective-agents", "mcp", "owasp-genai", "dora", "twelve-factor", "google-sre", "roadmap-sh"],
    slides: [
      { id: "cover", type: "cover", section: "Episode 002", title: "The New Developer Playbook: What to Learn in the AI Era", subtitle: "CodeShift · Reference deck", blocks: [] },
      {
        id: "summary", type: "summary", section: "Overview", title: "Executive summary",
        blocks: [{ kind: "bullets", items: [
          "Six learning packages give structure to what to learn next.",
          "Priorities differ by career level.",
          "Companies need a staged adoption plan, not just licences.",
        ] }],
      },
      {
        id: "levels", type: "pathway", section: "Career levels", title: "Learning priorities by level",
        blocks: [{ kind: "cards", items: [
          { title: "Students & juniors", body: "Foundations first; use AI to learn, verify everything." },
          { title: "Seniors", body: "Judgment, architecture and agentic workflows." },
          { title: "Tech leads & managers", body: "Team practices, quality gates and talent growth." },
        ] }],
      },
      {
        id: "agentic", type: "process", section: "Agentic coding", title: "Working with coding agents",
        blocks: [{ kind: "steps", items: [
          { title: "Scope", body: "Define a small, verifiable task." },
          { title: "Context", body: "Provide constraints, files and conventions." },
          { title: "Review", body: "Read diffs and run tests." },
          { title: "Own", body: "Merge only what you can explain." },
        ] }],
      },
      {
        id: "playbook-90", type: "roadmap", section: "For companies", title: "A 90-day adoption playbook",
        blocks: [{ kind: "steps", items: [
          { title: "Days 1–30", body: "Pilot with a small team; set guidelines and security rules." },
          { title: "Days 31–60", body: "Expand, share practices, measure delivery and quality." },
          { title: "Days 61–90", body: "Standardise workflows and invest in skills." },
        ] }],
      },
      { id: "takeaways", type: "checklist", section: "Takeaways", title: "Action items", blocks: [{ kind: "checklist", items: [] }] },
      { id: "resources", type: "resources", section: "Learn more", title: "Curated resources", blocks: [{ kind: "resources", ids: ["anthropic-effective-agents", "mcp", "owasp-genai", "dora"] }] },
      { id: "closing", type: "closing", section: "CodeShift", title: "Think Beyond the Code.", subtitle: "Join us live every Saturday at 7:00 PM Cairo time.", blocks: [] },
    ],
  },
];

// Checklist slides mirror each episode's actionItems so there is one source of truth.
for (const ep of EPISODES) {
  for (const s of ep.slides) {
    for (const b of s.blocks) if (b.kind === "checklist" && b.items.length === 0) b.items = ep.actionItems;
  }
}

export const getEpisode = (slug: string) => EPISODES.find((e) => e.slug === slug);

export const episodesNewestFirst = () =>
  [...EPISODES].sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));

export function formatDate(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export const pad = (n: number) => String(n).padStart(3, "0");
