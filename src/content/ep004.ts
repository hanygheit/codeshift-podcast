import type { BriefResource, Episode } from "./types";

const yt = (title: string, provider: string, id: string): BriefResource => ({
  title,
  provider,
  url: `https://www.youtube.com/watch?v=${id}`,
  access: "Free",
});

export const EP004: Episode = {
  id: "ep004",
  number: 4,
  slug: "ep004",
  title: "Inside Software Architecture: How Real Systems Work",
  shortTitle: "Inside Software Architecture",
  scheduledDate: "2026-11-14",
  youtubeVideoId: "GnvFox330Sg",
  youtubeUrl: "https://youtube.com/live/GnvFox330Sg",
  thumbnail: "https://i.ytimg.com/vi/GnvFox330Sg/maxresdefault.jpg",
  description:
    "Software architecture and system design go far beyond frontend, backend and database. Follow an illustrative e-commerce system as it evolves — and learn why each component exists and when it is worth adding.",
  summary:
    "Architecture is not about using every technology. It is about making the right decisions for a specific problem, under real constraints.",
  overview: [
    "Inside Software Architecture",
    "How real systems evolve from three boxes to a production architecture.",
  ],
  topics: ["Architecture & System Design", "Engineering Fundamentals", "Career Growth"],
  audienceLevels: ["Students", "Juniors", "Seniors", "Tech Leads"],
  tags: [
    "software architecture",
    "system design",
    "e-commerce",
    "load balancing",
    "caching",
    "message queues",
    "microservices",
    "modular monolith",
  ],
  takeaways: [
    "Software engineering is bigger than code.",
    "Architecture begins with requirements, not technologies.",
    "Understand why each component exists.",
    "Start simple and evolve based on actual needs.",
    "Architecture is a continuous decision-making process.",
  ],
  actionItems: [
    "Ask the requirement questions before picking a stack.",
    "Sketch your current system and name its constraints.",
    "Justify each component with the problem it solves.",
    "Write down trade-offs for every major decision.",
    "Follow the learning path from fundamentals to production.",
  ],
  presentationLabel: "Presentation & Resources",
  resourceIds: [],
  slides: [],
  presentationCover: {
    subtitle: "How Real Systems Work\nArchitecture = the right decisions for your constraints.",
    question: "Three Boxes or a Real System? Let's Design One.",
    stages: [
      { title: "Ask the questions", role: "Requirements" },
      { title: "Make decisions", role: "Architecture" },
      { title: "Weigh trade-offs", role: "Constraints" },
      { title: "Evolve the system", role: "Real needs" },
    ],
  },
  resourceSlideTitles: [
    "Learning Path: Fundamentals, Components & Data",
    "Learning Path: Styles, Production & Deployment",
  ],
  brief: {
    summaryHeadline: "Start simple. Evolve with real needs. Own the trade-offs.",
    summary: [
      "Architecture is not about including every technology. It is about making the right engineering decisions for a particular problem, under specific constraints.",
    ],
    lessons: [
      {
        title: "Bigger than three boxes",
        body: "Frontend, backend and database are a foundation — not the whole system.",
      },
      {
        title: "Requirements before technologies",
        body: "Users, traffic, data, availability, budget and team shape every decision.",
      },
      {
        title: "An evolving e-commerce system",
        body: "Load balancing, caching, CDN, queues and integrations — each added for a reason.",
      },
      {
        title: "Trade-offs, not fashion",
        body: "A well-structured modular monolith can be a great production choice.",
      },
    ],
    actions: [{ role: "Engineer", items: ["Ask", "Decide", "Justify", "Evolve"] }],
    finalMessage: "Think Beyond the Code.",
    watchLabel: "Watch Live / Replay",
    resourceGroups: [
      {
        label: "Steps 1–3 · Fundamentals, components, data, caching & messaging",
        items: [
          yt(
            "System Design for Beginners Course",
            "freeCodeCamp · Gaurav Sen · Beginner",
            "m8Icp_Cid5o",
          ),
          yt(
            "How to Become a Good Backend Engineer (Fundamentals)",
            "Hussein Nasser · Beginner",
            "V3ZPPPKEipA",
          ),
          yt("What Is a Load Balancer?", "IBM Technology · Beginner", "sCR3SAVdyCc"),
          yt("What Is a CDN? How Does It Work?", "ByteByteGo · Beginner", "RI9np1LWzqw"),
          yt("SQL vs. NoSQL: What's the Difference?", "IBM Technology · Beginner", "Q5aTUc7c4jg"),
          yt(
            "7 Must-know Strategies to Scale Your Database",
            "ByteByteGo · Intermediate",
            "_1IKwnbscQU",
          ),
          yt(
            "Caching Pitfalls Every Developer Should Know",
            "ByteByteGo · Intermediate",
            "wh98s0XhMmQ",
          ),
        ],
      },
      {
        label: "Steps 3–5 · Messaging, architectural styles & production",
        items: [
          yt("What Is a Message Queue?", "IBM Technology · Beginner", "xErwDaOc-Gs"),
          yt(
            "What Are Microservices Really All About? (And When Not To Use It)",
            "ByteByteGo · Intermediate",
            "lTAcCNbJ7KE",
          ),
          yt(
            "Modular Monoliths • Simon Brown • GOTO 2018",
            "GOTO Conferences · Advanced",
            "5OjqD-ow8GE",
          ),
          yt("CI/CD Explained in 5 Minutes", "TechWorld with Nana · Beginner", "ddDJxFnv-qs"),
          yt(
            "Kubernetes vs. Docker: It's Not an Either/Or Question",
            "IBM Technology · Beginner",
            "2vMEQ5zs1ko",
          ),
          yt(
            "Observability vs. APM vs. Monitoring",
            "IBM Technology · Intermediate",
            "CAQ_a2-9UOI",
          ),
          yt(
            "Cybersecurity Architecture: Five Principles to Follow",
            "IBM Technology · Intermediate",
            "jq_LZ1RFPfU",
          ),
        ],
      },
    ],
  },
};
