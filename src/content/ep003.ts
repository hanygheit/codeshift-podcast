import type { Episode } from "./types";
import cover from "@/assets/ep003.jpg.asset.json";

export const EP003: Episode = {
  id: "ep003",
  number: 3,
  slug: "ep003",
  title: "From Prompt to Pull Request: Working with AI Coding Agents",
  shortTitle: "From Prompt to Pull Request",
  scheduledDate: "2026-10-31",
  youtubeVideoId: "u114p0sd86I",
  youtubeUrl: "https://youtube.com/live/u114p0sd86I",
  thumbnail: cover.url,
  description:
    "Learn how software developers can effectively work with AI coding agents throughout the engineering lifecycle — from requirements and context preparation to task delegation, implementation, verification, testing, review, and Pull Request delivery.",
  summary: "AI can generate code. Engineers orchestrate the workflow and own the outcome.",
  overview: [
    "Working with AI Coding Agents",
    "AI can write the code. But who makes it production-ready?",
  ],
  topics: ["Coding Agents", "AI-Native Engineering", "Engineering Fundamentals"],
  audienceLevels: ["Juniors", "Seniors", "Tech Leads"],
  tags: [
    "Claude Code",
    "prompt engineering",
    "context engineering",
    "harness engineering",
    "pull request",
    "verification",
  ],
  takeaways: [
    "Define engineering-ready tasks.",
    "Provide relevant context and reliable guardrails.",
    "Delegate bounded work and verify the result.",
    "Keep engineering ownership with humans.",
  ],
  actionItems: [
    "Define outcomes and acceptance criteria.",
    "Supply relevant repository context.",
    "Delegate bounded tasks.",
    "Verify with tests, review and evidence.",
    "Own the delivered outcome.",
  ],
  presentationLabel: "Presentation & Resources",
  resourceIds: [],
  slides: [],
  presentationCover: {
    subtitle:
      "Working with AI Coding Agents\nThe agent generates the code. The engineer owns the outcome.",
    question: "AI Wrote the Code. Would You Merge It?",
    stages: [
      { title: "PR ready", role: "AI Agent / Done", agent: true },
      { title: "Correct? Tested?", role: "Engineer / Behavior + tests" },
      { title: "Secure? Usable?", role: "Engineer / Security + UI/UX" },
      { title: "Meets our standards?", role: "Engineer / Merge decision" },
    ],
  },
  resourceSlideTitles: ["Official Claude Learning Resources", "Claude Code Documentation"],
  brief: {
    summaryHeadline: "You lead. Agents execute. You own the outcome.",
    summary: ["AI can generate code. Engineers orchestrate the workflow and own the outcome."],
    lessons: [
      {
        title: "Model, product and skill",
        body: "Capability becomes value through tools, workflows and engineering judgment.",
      },
      {
        title: "Prompt, context and harness",
        body: "Clear instructions, relevant knowledge and reliable operating guardrails.",
      },
      {
        title: "From task to Pull Request",
        body: "Define, plan, delegate, implement, test, review and deliver.",
      },
      {
        title: "Generated is not verified",
        body: "Correctness, regressions, security and maintainability require evidence.",
      },
    ],
    actions: [{ role: "Engineer", items: ["Define", "Guide", "Verify", "Own"] }],
    finalMessage:
      "The advantage isn't simply using AI. It's knowing how to engineer the collaboration.",
    resourcesNote:
      "Scan for Slides & Resources: https://codeshift-podcast.lovable.app/episodes/ep003/slides?slide=cover",
    resourceGroups: [
      {
        label: "Official Claude learning courses",
        items: [
          {
            title: "Build with Claude — Official Catalog",
            provider: "Claude Academy · Start here",
            url: "https://academy.claude.com/collections/build-with-claude",
            access: "Free",
          },
          {
            title: "Claude Code 101",
            provider: "Claude Academy · Setup & core workflows",
            url: "https://academy.claude.com/courses/claude-code-101",
            access: "Free",
          },
          {
            title: "Claude Code in Action",
            provider: "Claude Academy · Practical coding workflows",
            url: "https://academy.claude.com/courses/claude-code-in-action",
            access: "Free",
          },
          {
            title: "Introduction to Agent Skills",
            provider: "Claude Academy · Reusable workflows",
            url: "https://academy.claude.com/courses/introduction-to-agent-skills",
            access: "Free",
          },
          {
            title: "Subagents — Claude Code 101",
            provider: "Claude Academy · Focused delegation",
            url: "https://academy.claude.com/courses/claude-code-101/subagents",
            access: "Free",
          },
          {
            title: "Context Management — Claude Code 101",
            provider: "Claude Academy · Context & session control",
            url: "https://academy.claude.com/courses/claude-code-101/context-management",
            access: "Free",
          },
        ],
      },
      {
        label: "Official documentation & references",
        items: [
          {
            title: "Claude Code Overview",
            provider: "Anthropic · Capabilities & setup",
            url: "https://code.claude.com/docs/en/overview",
            access: "Free",
          },
          {
            title: "CLAUDE.md",
            provider: "Anthropic · Project instructions",
            url: "https://code.claude.com/docs/en/memory",
            access: "Free",
          },
          {
            title: "Skills",
            provider: "Anthropic · Reusable procedures",
            url: "https://code.claude.com/docs/en/skills",
            access: "Free",
          },
          {
            title: "Subagents",
            provider: "Anthropic · Specialized delegation",
            url: "https://code.claude.com/docs/en/sub-agents",
            access: "Free",
          },
          {
            title: "Hooks",
            provider: "Anthropic · Lifecycle automation",
            url: "https://code.claude.com/docs/en/hooks",
            access: "Free",
          },
          {
            title: "When to Use Each Customization",
            provider: "Claude Blog · Choosing the right mechanism",
            url: "https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more",
            access: "Free",
          },
        ],
      },
    ],
  },
};
