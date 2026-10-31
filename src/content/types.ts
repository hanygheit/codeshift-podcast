export type Audience = "Students" | "Juniors" | "Seniors" | "Tech Leads" | "Companies";

export const AUDIENCES: Audience[] = ["Students", "Juniors", "Seniors", "Tech Leads", "Companies"];

export type Topic =
  | "AI-Native Engineering"
  | "Coding Agents"
  | "Architecture & System Design"
  | "Engineering Fundamentals"
  | "Career Growth"
  | "Leadership & AI Adoption";

export interface Resource {
  id: string;
  title: string;
  provider: string;
  resourceType: "Guide" | "Documentation" | "Book" | "Framework" | "Research" | "Roadmap";
  level: "All levels" | "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  topics: Topic[];
  url: string;
  relatedPackage?: string;
}

export type SlideBlock =
  | { kind: "text"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "cards"; items: { title: string; body: string }[] }
  | { kind: "compare"; left: { title: string; items: string[] }; right: { title: string; items: string[] } }
  | { kind: "steps"; items: { title: string; body?: string }[] }
  | { kind: "checklist"; items: string[] }
  | { kind: "resources"; ids: string[] }
  | { kind: "quote"; text: string; note?: string };

export type SlideType =
  | "cover" | "summary" | "insight" | "comparison" | "process" | "roadmap"
  | "pathway" | "resources" | "checklist" | "case" | "closing" | "mixed";

export interface Slide {
  id: string;
  type: SlideType;
  section: string;
  title: string;
  subtitle?: string;
  blocks: SlideBlock[];
}

export interface BriefResource {
  title: string;
  provider: string;
  url: string;
  /** How the resource is accessed — shown so free material is distinguishable from paid tools. */
  access: "Free" | "Free tier" | "Subscription";
  /** Curriculum reference label, e.g. the WorxForge R1–R14 mapping. */
  ref?: string;
}

export interface EpisodeBrief {
  summaryHeadline: string;
  summary: string[];
  lessons: { title: string; body: string }[];
  /** Learning-package map (EP002 playbook). */
  packages?: { id: string; name: string; topics: string; outcome: string }[];
  packagesNote?: string;
  careerLevels?: { level: string; priorities: string }[];
  juniorAi?: { message: string; modes: string[]; emphasis: string };
  adoption?: { phases: { days: string; title: string; body: string }[]; metrics: string[]; highlight: string };
  caseStudy?: { headline: string; body: string[]; links: { label: string; url: string }[] };
  actions: { role: string; items: string[] }[];
  resourceGroups: { label: string; items: BriefResource[] }[];
  resourcesNote?: string;
  finalMessage: string;
  nextEpisode?: { label: string; url: string };
  /** Label for the episode watch button, e.g. "Watch Live / Replay" when the recording status is unverified. */
  watchLabel?: string;
}

export interface Episode {
  id: string;
  number: number;
  slug: string;
  title: string;
  shortTitle: string;
  /** ISO date (YYYY-MM-DD) of the scheduled live broadcast, Cairo time 19:00. */
  scheduledDate: string;
  youtubeVideoId: string;
  youtubeUrl: string;
  thumbnail: string;
  description: string;
  summary: string;
  overview: string[];
  topics: Topic[];
  audienceLevels: Audience[];
  tags: string[];
  takeaways: string[];
  actionItems: string[];
  resourceIds: string[];
  slides: Slide[];
  /** Optional episode-specific label; existing episodes retain their default. */
  presentationLabel?: string;
  presentationCover?: {
    subtitle: string;
    question: string;
    /** Human-led workflow stages; `agent` marks the delegated, bounded execution stage. */
    stages: { title: string; role: string; agent?: boolean }[];
  };
  resourceSlideTitles?: [string, string];
  /** When set, the episode presents a single scrollable executive brief instead of a slide deck. */
  brief?: EpisodeBrief;
}
