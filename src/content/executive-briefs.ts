/** Editorial condensation of the original episode notes; never a transcript. */
export interface BriefPage {
  id: string;
  title: string;
  section: string;
  layout: "statement" | "comparison" | "matrix" | "flow" | "map";
  subtitle?: string;
  takeaway?: string;
  cards?: boolean;
  emphasis?: number;
  entries: { title: string; body: string; url?: string }[];
}

export const EXECUTIVE_BRIEFS: Record<string, BriefPage[]> = {
  ep003: [
    {
      id: "journey",
      title: "The CodeShift Journey",
      section: "WHY > WHAT > HOW",
      layout: "flow",
      cards: true,
      emphasis: 2,
      takeaway: "EP003 is the practical next step: engineer the collaboration.",
      entries: [
        { title: "EP001 / WHY", body: "Why is the developer's role changing?" },
        { title: "EP002 / WHAT", body: "What should developers learn?" },
        {
          title: "EP003 / HOW",
          body: "How should developers actually work with AI coding agents?",
        },
      ],
    },
    {
      id: "effectiveness",
      title: "GenAI Effectiveness = f(Model, Product, Skill)",
      section: "A conceptual framework — not a quantified equation",
      layout: "matrix",
      cards: true,
      emphasis: 2,
      takeaway:
        "The model provides capability. The product enables it. Your skill turns it into engineering value.",
      entries: [
        {
          title: "01 / Model",
          body: "What the underlying AI can do: reasoning, coding and understanding.",
        },
        {
          title: "02 / Product",
          body: "How capability is exposed through tools, interfaces and workflows.",
        },
        {
          title: "03 / Skill",
          body: "Your ability to direct, control, evaluate and improve the work.",
        },
      ],
    },
    {
      id: "orchestrator",
      title: "You Lead. Agents Execute. You Own the Outcome.",
      section: "The developer is the orchestrator",
      layout: "flow",
      cards: true,
      subtitle: "Engineer > Agents + Repository + Tools + Checks",
      takeaway: "Engineering judgment, quality, accountability and final approval stay with you.",
      entries: [
        { title: "Define", body: "Set the objective and architecture boundaries." },
        { title: "Guide", body: "Supply context and steer tool use." },
        { title: "Verify", body: "Inspect evidence, quality and risks." },
        { title: "Own", body: "Approve delivery and production outcomes." },
      ],
    },
    {
      id: "assistants-agents",
      title: "From Assistants to Agents",
      section: "Increasing autonomy, context and tool use",
      layout: "flow",
      cards: true,
      emphasis: 3,
      takeaway: "More autonomy requires stronger engineering control.",
      entries: [
        {
          title: "Autocomplete",
          body: "Local context; suggests text. You apply and test each change.",
        },
        {
          title: "Chat Assistant",
          body: "Supplied context; explains or drafts. You transfer and verify code.",
        },
        {
          title: "Coding Assistant",
          body: "Editor context; proposes edits and tool use under supervision.",
        },
        {
          title: "Coding Agent",
          body: "Repository + tools; edits, runs checks and iterates within permissions.",
        },
      ],
    },
    {
      id: "engineering-layers",
      title: "Prompt + Context + Harness Engineering",
      section: "Complementary layers — not competing alternatives",
      layout: "flow",
      cards: true,
      takeaway: "Go beyond better prompts: deliberately engineer the context and workflow.",
      entries: [
        {
          title: "Prompt Engineering",
          body: "HOW YOU INSTRUCT\nGoals, tasks, constraints and expected outcomes.",
        },
        {
          title: "Context Engineering",
          body: "WHAT THE AGENT KNOWS\nRelevant files, structure, conventions, requirements, examples and history.",
        },
        {
          title: "Harness Engineering",
          body: "HOW THE AGENT OPERATES\nTools, permissions, scripts, skills, checks, evaluation, feedback and guardrails.",
        },
      ],
    },
    {
      id: "task-definition",
      title: "Weak Prompt vs Engineering-Ready Task",
      section: "Orders API example",
      layout: "comparison",
      cards: true,
      takeaway:
        "Objective + Scope + Context + Constraints + Acceptance criteria + Definition of done",
      entries: [
        {
          title: "Weak prompt",
          body: '"Build an Orders API."\nWhich API? What changes?\nHow will we prove it is done?',
        },
        {
          title: "Engineering-ready task",
          body: '"Add filtering and server-side pagination to the existing Orders API. Follow repository conventions, preserve backward compatibility, validate inputs, add appropriate automated tests, and summarize changed files and verification results."',
        },
      ],
    },
    {
      id: "task-to-pr",
      title: "From Task to Pull Request",
      section: "Orders API scenario — illustrative, not an implemented demo",
      layout: "flow",
      cards: true,
      takeaway: "PR-ready = bounded diff + passing checks + human review + verification notes.",
      entries: [
        { title: "Define", body: "Engineer: filters, limits, criteria." },
        { title: "Plan", body: "Agent: inspect API.\nEngineer: approve plan." },
        { title: "Delegate", body: "Engineer: bound task and tools." },
        { title: "Implement", body: "Agent: filters + pagination." },
        { title: "Test", body: "Agent: edge cases + regressions." },
        { title: "Review", body: "Engineer: diff, security, evidence." },
        { title: "Deliver", body: "Agent: PR notes.\nEngineer: approve." },
      ],
    },
    {
      id: "verification",
      title: "Generated Code Is Not Verified Code",
      section: "Four verification gates",
      layout: "matrix",
      cards: true,
      takeaway: "Delegate implementation, not accountability. Confidence is not evidence.",
      entries: [
        {
          title: "01 / Functional correctness",
          body: "Check requirements and edge cases. Challenge incorrect assumptions.",
        },
        {
          title: "02 / Tests & regressions",
          body: "Run automated tests and regression coverage. Reject shallow fixes.",
        },
        {
          title: "03 / Security & dependencies",
          body: "Check authorization, input validation, secrets and dependency risks.",
        },
        {
          title: "04 / Architecture & maintainability",
          body: "Review boundaries, conventions and unintended changes.",
        },
      ],
    },
    {
      id: "claude-workflow",
      title: "Claude Code: Engineering the Workflow",
      section: "Project guidance / procedures / delegation / automation",
      layout: "matrix",
      cards: true,
      entries: [
        {
          title: "CLAUDE.md",
          body: "Persistent guidance for consistent work.\nExample: API patterns + test commands.\nGuidance, not enforced policy.",
        },
        {
          title: "Skills",
          body: "Reusable task instructions + resources.\nSKILL.md supports repeatable workflows.\nExample: an API-review checklist.",
        },
        {
          title: "Subagents",
          body: "Specialized agents: own context + tools.\nFocused delegation isolates work.\nExample: review test coverage.",
        },
        {
          title: "Hooks",
          body: "Event-driven automation and checks.\nEnforce guardrails around tool use.\nExample: block unsafe tool calls.",
        },
      ],
    },
    {
      id: "rules",
      title: "Five Rules for Effective Agentic Coding",
      section: "Practical checklist",
      layout: "statement",
      subtitle:
        "Juniors: explain and test. Seniors: set boundaries and review. Leads: standardize checks.",
      takeaway:
        "The competitive advantage isn't simply using AI. It's engineering the collaboration.",
      entries: [
        { title: "01 / Define outcomes, not vague prompts.", body: "" },
        { title: "02 / Provide relevant context.", body: "" },
        { title: "03 / Delegate bounded tasks.", body: "" },
        { title: "04 / Verify changes with evidence.", body: "" },
        { title: "05 / Keep engineering ownership with humans.", body: "" },
      ],
    },
  ],
  ep001: [
    {
      id: "summary",
      title: "Episode in 60 seconds",
      section: "Core lessons",
      layout: "statement",
      entries: [
        {
          title: "Code is cheaper. Judgment is not.",
          body: "AI accelerates implementation; engineers still frame problems, verify results and own production outcomes.",
        },
        {
          title: "Fundamentals are your review toolkit.",
          body: "Design, algorithms, testing and debugging let you evaluate what AI produces.",
        },
        {
          title: "Learn with AI, not around it.",
          body: "Use AI to explain and challenge you. Keep independent problem-solving and system understanding.",
        },
      ],
    },
    {
      id: "role-shift",
      title: "From writing code to owning outcomes",
      section: "The changing role",
      layout: "comparison",
      entries: [
        {
          title: "Less differentiation",
          body: "Typing boilerplate\nMemorising syntax\nCompleting isolated tickets",
        },
        {
          title: "More engineering value",
          body: "Framing problems and trade-offs\nReviewing and integrating solutions\nAccountability in production",
        },
      ],
    },
    {
      id: "fundamentals",
      title: "Fundamentals make ownership possible",
      section: "Engineering toolkit",
      layout: "matrix",
      subtitle: "Correctness, security and maintainability remain human responsibilities.",
      entries: [
        { title: "Data & algorithms", body: "Spot inefficient or incorrect logic." },
        { title: "Design", body: "Recognise coupling and poor boundaries." },
        { title: "Testing", body: "Prove behaviour instead of trusting it." },
        { title: "Debugging", body: "Diagnose what generated code actually does." },
      ],
    },
    {
      id: "career-levels",
      title: "Different levels. Shared accountability.",
      section: "Career priorities",
      layout: "matrix",
      entries: [
        {
          title: "Students & juniors",
          body: "Build working features. Explain and debug independently. Use AI as a tutor.",
        },
        {
          title: "Senior engineers",
          body: "Deepen architecture, domain knowledge and judgment. Direct and validate agentic work.",
        },
        {
          title: "Leads & managers",
          body: "Set safe usage, review and validation standards. Grow team knowledge.",
        },
      ],
    },
    {
      id: "actions",
      title: "Make your next change a learning loop",
      section: "Practical actions",
      layout: "flow",
      subtitle: "Choose one fundamentals gap; draw where AI-written code enters your system.",
      entries: [
        { title: "Attempt", body: "Try the problem yourself first." },
        { title: "Ask", body: "Use AI to explain, not just answer." },
        { title: "Verify", body: "Review line by line and write tests." },
        { title: "Explain", body: "Teach it back without assistance." },
      ],
    },
  ],
  ep002: [
    {
      id: "summary",
      title: "Episode in 60 seconds",
      section: "Essential lessons",
      layout: "statement",
      entries: [
        {
          title: "Build capabilities, not a tool collection.",
          body: "Six overlapping learning packages connect foundations, real applications and responsible AI use.",
        },
        {
          title: "Choose depth by career level.",
          body: "Juniors build independence; seniors deepen judgment; leaders shape workflows and teams.",
        },
        {
          title: "Adopt AI as an engineering programme.",
          body: "Train, govern, validate and measure outcomes. Buying licences is not a strategy.",
        },
      ],
    },
    {
      id: "lessons",
      title: "Learn concepts. Apply them. Own the result.",
      section: "The new learning mindset",
      layout: "comparison",
      entries: [
        {
          title: "Move beyond",
          body: "Memorising syntax\nChasing endless tools\nAccepting generated code uncritically",
        },
        {
          title: "Build instead",
          body: "Mental models and working applications\nDomain knowledge and system judgment\nContext, specifications, tests and review",
        },
      ],
    },
    {
      id: "packages",
      title: "Six packages. One engineering skill set.",
      section: "Learning architecture",
      layout: "map",
      subtitle: "Overlapping capabilities, not six mandatory sequential courses. P06 is optional.",
      entries: [],
    },
    {
      id: "ai-learning",
      title: "Use AI early. Keep your understanding.",
      section: "Juniors & AI",
      layout: "flow",
      subtitle: "Independent explanation, debugging and validation are the gates to delegation.",
      entries: [
        { title: "Tutor", body: "Ask for concepts and explanations." },
        { title: "Pair", body: "Attempt the task; work through it together." },
        { title: "Reviewer", body: "Challenge your solution and test it." },
        { title: "Agent", body: "Delegate bounded work you can verify." },
      ],
    },
    {
      id: "career-levels",
      title: "Grow depth. Then multiply team capability.",
      section: "Seniors, leads & managers",
      layout: "matrix",
      entries: [
        {
          title: "Senior engineers",
          body: "P04 + P05: architecture, quality, performance, security and technical judgment.",
        },
        {
          title: "Tech leads",
          body: "Repeatable agentic workflows, context, specifications, tests and reviews.",
        },
        {
          title: "Engineering managers",
          body: "Enablement, governance, standards and talent development.",
        },
      ],
    },
    {
      id: "adoption",
      title: "A measured 90-day AI adoption roadmap",
      section: "Software companies",
      layout: "flow",
      subtitle: "Measure delivery, defects, security, skills, usage cost and business outcomes.",
      entries: [
        {
          title: "01–30 / Prepare",
          body: "Pilot with a small team; set guidelines and security rules. Baseline skills and metrics.",
        },
        {
          title: "31–60 / Pilot",
          body: "Train hands-on. Add agentic workflows, tests and review. Measure delivery and quality.",
        },
        {
          title: "61–90 / Scale",
          body: "Standardise workflows and invest in skills. Expand proven practices.",
        },
      ],
    },
    {
      id: "case-study",
      title: "Four students. Four weeks. One application.",
      section: "WorxForge case study",
      layout: "flow",
      subtitle:
        "Across a four-week internship; not a productivity study or proof of production readiness.",
      entries: [
        {
          title: "Concept-focused learning",
          body: "Computer science students combined learning with senior mentorship.",
        },
        {
          title: "Agentic implementation",
          body: "GitHub Copilot supported implementation of a .NET + React application.",
        },
        {
          title: "A local demonstration",
          body: "The team demonstrated a working application; the repository and whitepaper document the experience.",
        },
      ],
    },
    {
      id: "actions",
      title: "Choose one next step. Make it verifiable.",
      section: "Takeaways & action items",
      layout: "matrix",
      entries: [
        {
          title: "Student / junior",
          body: "Choose one package for the next month; apply it in a real application.",
        },
        {
          title: "Senior engineer",
          body: "Run a bounded agent task; document context, tests and quality checks.",
        },
        { title: "Tech lead", body: "Introduce repeatable workflows and a team development plan." },
        {
          title: "Software company",
          body: "Start a governed 90-day pilot. Learn one new business-domain rule.",
        },
      ],
    },
  ],
};
