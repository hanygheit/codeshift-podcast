import hanyPhoto from "@/assets/hany-saad.png.asset.json";
import ahmedPhoto from "@/assets/ahmed-mamdoh.png.asset.json";

export const SITE = {
  name: "CodeShift",
  descriptor: "Software Engineering in the AI Era",
  tagline: "Think Beyond the Code.",
  description:
    "CodeShift is an independent weekly Arabic podcast on software engineering in the AI era — turning each live discussion into notes, reference slides and curated learning resources.",
  schedule: "Every Saturday · 7:00 PM Cairo time",
  facebook: "https://www.facebook.com/CodeShiftPodcast",
  youtube: "https://www.youtube.com/@CodeShiftPodcast",
};

export const HOSTS = [
  {
    name: "Hany Saad",
    initials: "HS",
    photo: hanyPhoto.url,
    role: "Senior Software Engineering Manager at ITWorx",
    bio: "Works across software engineering, solution architecture, AI-native development, agentic coding, enterprise AI adoption, engineering leadership and talent development.",
    linkedin: "https://www.linkedin.com/in/hanysaad",
  },
  {
    name: "Ahmed Mamdoh",
    initials: "AM",
    photo: ahmedPhoto.url,
    role: "Engineering Manager at Roboost · Training Manager at ITI",
    bio: "Focuses on software engineering, .NET, technical mentoring, developer education, engineering leadership and professional development.",
    linkedin: "https://www.linkedin.com/in/ahmed-mamdoh-8563495a",
  },
];

export const TOPICS_EXPLORED = ["Software Engineering", "AI-Native Development", "Coding Agents", "Architecture & System Design", "Developer Career Growth", "Engineering Leadership"];

export const EXPLORE = [
  { title: "AI-Native Software Engineering", body: "How the craft changes when AI is a daily collaborator." },
  { title: "Coding Agents & Workflows", body: "Practical agentic coding, review loops and guardrails." },
  { title: "Architecture & System Design", body: "Thinking in systems, trade-offs and long-lived design." },
  { title: "Engineering Fundamentals", body: "The foundations that make AI output trustworthy." },
  { title: "Career Growth & Talent", body: "What to learn next at every career level." },
  { title: "Leadership & AI Adoption", body: "Bringing AI into teams and companies responsibly." },
];
