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
      title: "Six Stops: From Prompt to Pull Request",
      section: "THE EPISODE ROADMAP · SIX CONVERSATION CHAPTERS",
      layout: "flow",
      cards: true,
      emphasis: 2,
      entries: [
        {
          title: "01 / Mindset",
          body: "AI effectiveness depends on the model, product and your engineering skill.",
        },
        {
          title: "02 / Orchestration",
          body: "Developers lead the work; agents execute bounded tasks.",
        },
        {
          title: "03 / Engineering the Agent",
          body: "Connect instructions, relevant context and a reliable operating harness.",
        },
        {
          title: "04 / From Task to PR",
          body: "Plan, verify the Definition of Done and deliver safely.",
        },
        {
          title: "05 / Claude Code in Practice",
          body: "Use CLAUDE.md, Skills, Subagents and Hooks for distinct jobs.",
        },
        {
          title: "06 / Takeaways & Resources",
          body: "Keep ownership and leave with practical next steps.",
        },
      ],
    },
    {
      id: "effectiveness",
      title: "What Makes AI Work Effective?",
      section: "01 / MINDSET · MODEL + PRODUCT + SKILL",
      layout: "matrix",
      cards: true,
      emphasis: 2,
      takeaway: "A mental model, not a measured formula: which part can you improve today?",
      entries: [
        {
          title: "Model",
          body: "Underlying capability: reasoning, coding and understanding.",
        },
        {
          title: "Product",
          body: "How tools, interfaces and workflows make that capability usable.",
        },
        {
          title: "Engineering skill",
          body: "Frame the problem, direct the work, evaluate evidence and improve the result.",
        },
      ],
    },
    {
      id: "orchestrator",
      title: "Developers Orchestrate; Agents Execute",
      section: "02 / ORCHESTRATION · THE ENGINEER OWNS THE OUTCOME",
      layout: "flow",
      cards: true,
      subtitle: "Engineer directs agents, repository, tools and checks toward an outcome.",
      takeaway: "Delegate implementation; keep engineering judgment, accountability and approval.",
      entries: [
        { title: "Define", body: "Set the outcome, scope and architecture boundaries." },
        { title: "Guide", body: "Provide context and limit tools to the task." },
        { title: "Verify", body: "Inspect the diff, test results and remaining risks." },
        { title: "Own", body: "Decide whether the change is ready to ship." },
      ],
    },
    {
      id: "assistants-agents",
      title: "From Autocomplete to Coding Agent",
      section: "02 / ORCHESTRATION · MORE AUTONOMY, MORE CONTROL",
      layout: "flow",
      cards: true,
      emphasis: 3,
      takeaway:
        "As the system gains repository access and tool autonomy, strengthen permissions and review.",
      entries: [
        {
          title: "Autocomplete",
          body: "Suggests text from local context; you choose, apply and test it.",
        },
        {
          title: "Chat Assistant",
          body: "Explains or drafts from supplied context; you transfer and verify code.",
        },
        {
          title: "Coding Assistant",
          body: "Works in the editor; proposes changes and tool use for your approval.",
        },
        {
          title: "Coding Agent",
          body: "Can inspect, edit and run checks in a repository within granted permissions.",
        },
      ],
    },
    {
      id: "engineering-layers",
      title: "Prompt + Context + Harness Engineering",
      section: "03 / ENGINEERING THE AGENT · THREE COMPLEMENTARY LAYERS",
      layout: "flow",
      cards: true,
      takeaway:
        "Reliable agent work comes from aligning the instruction, the information and the operating environment.",
      entries: [
        {
          title: "Prompt Engineering",
          body: "INSTRUCTIONS\nState the goal, task, constraints and acceptance criteria.",
        },
        {
          title: "Context Engineering",
          body: "RELEVANT INFORMATION\nProvide files, conventions, requirements, examples and history.",
        },
        {
          title: "Harness Engineering",
          body: "OPERATING ENVIRONMENT\nConfigure tools, permissions, scripts, checks, feedback and guardrails.",
        },
      ],
    },
    {
      id: "task-definition",
      title: "Turn a Vague Ask into an Engineering-Ready Task",
      section: "03 / ENGINEERING THE AGENT · ORDERS API EXAMPLE",
      layout: "comparison",
      cards: true,
      takeaway:
        "A good task makes scope clear and gives both agent and reviewer a way to judge completion.",
      entries: [
        {
          title: "Weak prompt",
          body: '"Build an Orders API."\nWhich endpoint or behavior?\nWhat must stay compatible?\nHow will we know it works?',
        },
        {
          title: "Engineering-ready task",
          body: '"Add filters and server-side pagination to the existing Orders endpoint. Follow repository conventions; preserve its response shape; validate page and limit; test defaults, bounds and empty results. Report changed files and checks run."',
        },
      ],
    },
    {
      id: "task-to-pr",
      title: "From Bounded Task to Reviewable Pull Request",
      section: "04 / FROM TASK TO PR · ILLUSTRATIVE ORDERS API SCENARIO",
      layout: "flow",
      cards: true,
      takeaway: "A reviewable PR starts the merge decision; it does not finish it.",
      entries: [
        { title: "Define", body: "Engineer sets scope and acceptance criteria." },
        { title: "Plan", body: "Agent inspects; engineer agrees on approach." },
        { title: "Delegate", body: "Set task boundaries and tool permissions." },
        { title: "Implement", body: "Agent changes the existing endpoint." },
        { title: "Test", body: "Run relevant checks and regression cases." },
        { title: "Review", body: "Engineer checks diff, risks and evidence." },
        { title: "Deliver", body: "Summarize; engineer decides whether to merge." },
      ],
    },
    {
      id: "verification",
      title: "The Agent Says “Done.” Are We Actually Done?",
      section: "04 / FROM TASK TO PR · DEFINITION OF DONE",
      layout: "matrix",
      cards: true,
      subtitle: "Code Complete ≠ Feature Done",
      takeaway:
        "Delegate implementation, not accountability. Done means evidence, not a status update.",
      entries: [
        {
          title: "Testing",
          body: "Acceptance criteria met; relevant checks pass without regressions.",
        },
        {
          title: "Security • UI/UX",
          body: "Risks verified; the feature is usable, responsive and accessible.",
        },
        {
          title: "Documentation • Observability",
          body: "Usage and operations documented; failures are diagnosable.",
        },
        {
          title: "Review • Safe Delivery",
          body: "Engineering standards met; checks, approvals and rollback ready.",
        },
      ],
    },
    {
      id: "quality-evidence",
      title: "Passing Tests. What Did We Actually Prove?",
      section: "04 / FROM TASK TO PR · TESTING + SECURITY",
      layout: "comparison",
      cards: true,
      takeaway: "Choose checks for the risk. A green build is evidence, not a guarantee.",
      entries: [
        {
          title: "Test the right boundaries",
          body: "Unit: logic, limits and error paths.\nIntegration: APIs, data and contracts.\nE2E: critical user journeys.\nReproduce the bug; check regressions.",
        },
        {
          title: "Verify OWASP risks",
          body: "Probe access control and injection.\nCheck input validation and escaping.\nScan secrets and dependencies.\nReview auth and security configuration.",
        },
      ],
    },
    {
      id: "experience-operations",
      title: "It Works Locally. Can People Use and Support It?",
      section: "04 / FROM TASK TO PR · UI/UX + DOCUMENTATION + OBSERVABILITY",
      layout: "comparison",
      cards: true,
      takeaway: "Feature quality includes the person using it and the engineer on call.",
      entries: [
        {
          title: "Use it like a real person",
          body: "Check mobile and desktop layouts.\nExercise loading, empty and error states.\nUse keyboard, focus and screen readers.\nCheck contrast and clear feedback.",
        },
        {
          title: "Make it supportable",
          body: "Update API, setup and usage docs.\nDocument migrations and recovery.\nUse structured logs; redact secrets.\nVerify useful metrics and alerts.",
        },
      ],
    },
    {
      id: "safe-delivery",
      title: "A Ready PR Is Not Permission to Merge",
      section: "04 / FROM TASK TO PR · SAFE GIT + ENGINEERING OWNERSHIP",
      layout: "comparison",
      cards: true,
      takeaway: "The agent proposes the change. The engineer owns the merge and its impact.",
      entries: [
        {
          title: "Isolate work. Preserve history.",
          body: "Use a task branch, not the default.\nUse worktrees for parallel checkouts.\nReview diffs; make focused commits.\nNo force pushes to shared history.",
        },
        {
          title: "Require evidence. Deliver safely.",
          body: "Protect branches; require PR checks.\nSummarize scope, risks and checks run.\nGet approvals; resolve review findings.\nPlan rollout, rollback and monitoring.",
        },
      ],
    },
    {
      id: "claude-workflow",
      title: "Claude Code: Engineering the Workflow",
      section: "05 / CLAUDE CODE IN PRACTICE · FOUR DIFFERENT MECHANISMS",
      layout: "matrix",
      cards: true,
      takeaway:
        "Choose the mechanism that fits the job; guidance is not a substitute for enforced checks.",
      entries: [
        {
          title: "CLAUDE.md",
          body: "Project guidance loaded as context.\nExample: API conventions and test commands.\nUseful, but not an enforced policy.",
        },
        {
          title: "Skills",
          body: "Reusable instructions and resources for a task.\nExample: a repeatable API-review checklist.",
        },
        {
          title: "Subagents",
          body: "Delegate focused work to a specialized agent with its own context.\nExample: inspect test coverage.",
        },
        {
          title: "Hooks",
          body: "Run configured actions at lifecycle events.\nExample: automate a check or block a configured action.",
        },
      ],
    },
    {
      id: "rules",
      title: "Five Rules for Effective Agentic Coding",
      section: "06 / TAKEAWAYS & RESOURCES · PRACTICAL CHECKLIST",
      layout: "flow",
      cards: true,
      subtitle:
        "Juniors: explain and test. Seniors: set boundaries and review. Leads: standardize checks.",
      takeaway:
        "The competitive advantage isn't simply using AI. It's engineering the collaboration.",
      entries: [
        {
          title: "01 / Define outcomes, not vague prompts.",
          body: "Name the scope, constraints and acceptance criteria.",
        },
        {
          title: "02 / Provide relevant context.",
          body: "Share the files, conventions and examples the task depends on.",
        },
        {
          title: "03 / Delegate bounded tasks.",
          body: "Limit the change and grant only the tools it needs.",
        },
        {
          title: "04 / Verify changes with evidence.",
          body: "Review the diff and run checks relevant to the risk.",
        },
        {
          title: "05 / Keep engineering ownership with humans.",
          body: "You remain accountable for what ships and its impact.",
        },
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
