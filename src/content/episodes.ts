import ep001Thumb from "@/assets/ep001.png.asset.json";
import ep002Thumb from "@/assets/ep002.png.asset.json";
import type { Episode } from "./types";
import { EP003 } from './ep003';

/**
 * Editorial episode records. To add an episode, append a record here —
 * routes, archive, slides and PDF export all read from this list.
 * Notes are editorial summaries, not verbatim transcripts.
 */
export const EPISODES: Episode[] = [
  EP003,
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
    brief: {
      summaryHeadline: "What You Need to Know",
      summary: [
        "AI coding assistants are evolving into agents capable of handling increasingly complex software development tasks. This changes how software is built, but it doesn't remove the need for software engineers.",
        "Developer value increasingly extends beyond writing code into understanding problems, designing solutions, directing AI-assisted workflows, evaluating trade-offs, validating results, and taking responsibility for the delivered software.",
        "Strong engineering fundamentals, broader system knowledge, and the ability to work effectively with AI are becoming complementary skills rather than competing alternatives.",
      ],
      lessons: [
        { title: "Software Engineering Is More Than Writing Code", body: "Requirements, design, architecture, testing, debugging, security, deployment, and ownership remain essential, even when AI generates much of the implementation." },
        { title: "AI Changes the Developer Workflow", body: "Developers increasingly specify, plan, provide context, guide implementation, validate outputs, and manage feedback loops." },
        { title: "Fundamentals Still Matter", body: "Programming concepts, data structures, databases, operating systems, networking, and software design are necessary for understanding and evaluating AI-generated solutions." },
        { title: "Juniors Should Learn With AI", body: "AI can accelerate learning and experimentation, but juniors must develop independent debugging, problem-solving, and code-understanding skills." },
        { title: "Senior Skills Must Evolve", body: "Experienced engineers should deepen architecture, system design, domain knowledge, technical judgment, and effective agentic coding practices." },
        { title: "Engineering Ownership Remains Human", body: "Generated code requires verification. Developers and engineering teams are accountable for correctness, quality, maintainability, security, and business outcomes." },
      ],
      actions: [
        { role: "Students & Juniors", items: [
          "Strengthen one fundamentals gap.",
          "Build a complete working feature.",
          "Practice explaining and debugging code independently.",
        ] },
        { role: "Senior Engineers", items: [
          "Learn a structured agentic coding workflow.",
          "Use AI for a bounded engineering task.",
          "Evaluate the resulting code, tests, and architecture.",
        ] },
        { role: "Tech Leads & Engineering Managers", items: [
          "Establish safe AI usage practices.",
          "Encourage engineering knowledge sharing.",
          "Define review and validation standards for AI-assisted work.",
        ] },
      ],
      resourceGroups: [
        { label: "Engineering Foundations", items: [
          { title: "Harvard CS50x", provider: "Harvard University", url: "https://cs50.harvard.edu/x/", access: "Free" },
          { title: "MIT Introduction to Algorithms", provider: "MIT OpenCourseWare", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/", access: "Free" },
          { title: "MIT Missing Semester", provider: "MIT", url: "https://missing.csail.mit.edu/", access: "Free" },
          { title: "Microsoft Learn — .NET", provider: "Microsoft", url: "https://learn.microsoft.com/en-us/training/dotnet/", access: "Free" },
        ] },
        { label: "Practical Software Development", items: [
          { title: "GitHub Skills", provider: "GitHub", url: "https://skills.github.com/", access: "Free" },
          { title: "React Official Learning Guide", provider: "react.dev", url: "https://react.dev/learn", access: "Free" },
        ] },
        { label: "AI-Assisted & Agentic Coding", items: [
          { title: "Microsoft Generative AI for Beginners", provider: "Microsoft", url: "https://github.com/microsoft/generative-ai-for-beginners", access: "Free" },
          { title: "GitHub Copilot Documentation", provider: "GitHub", url: "https://docs.github.com/en/copilot", access: "Free" },
          { title: "GitHub Copilot Free & Plans", provider: "GitHub", url: "https://github.com/features/copilot/plans", access: "Free tier" },
          { title: "Claude Code Documentation", provider: "Anthropic", url: "https://code.claude.com/docs/en/overview", access: "Subscription" },
        ] },
      ],
      finalMessage: "AI changes how we write software. Engineering knowledge determines what we build, why it works, and whether we can trust it.",
      nextEpisode: { label: "Continue to EP002 — The New Developer Playbook", url: "https://www.youtube.com/live/CohumEwctE4" },
    },
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
    brief: {
      summaryHeadline: "What You Need to Know",
      summary: [
        "AI is changing both software development and the skills engineers need to succeed.",
        "The challenge is no longer just learning more technologies. Developers need stronger fundamentals, broader engineering knowledge, deep expertise in relevant areas, and the ability to use AI and coding agents effectively.",
        "Students and juniors need practical learning paths that combine computer science, programming, complete applications, and responsible AI use. Experienced engineers must deepen architecture, technical judgment, validation, and agentic coding skills.",
        "Engineering leaders and software companies must also adapt their development workflows, talent programs, quality practices, and AI adoption strategies.",
      ],
      lessons: [
        { title: "Learn Concepts, Not Just Syntax", body: "Strong mental models and practical understanding are increasingly valuable." },
        { title: "Build Real Engineering Capabilities", body: "Foundations, programming, complete applications, and testing remain essential." },
        { title: "AI Literacy & Agentic Coding Are Core Skills", body: "Learn prompting, context, specifications, tools, agents, harnesses, testing, and verification." },
        { title: "Different Career Levels Need Different Depth", body: "Students, juniors, seniors, and leads should prioritize different capabilities." },
        { title: "Engineering Is More Than Technology", body: "Architecture, business domain knowledge, problem framing, judgment, and communication matter." },
        { title: "Companies Must Adopt AI Systematically", body: "AI transformation requires training, workflows, governance, measurement, and leadership — not just software licenses." },
      ],
      packages: [
        { id: "P01", name: "Computer Science Foundations", topics: "Operating Systems, Databases, Networking, HTTP, concurrency, security fundamentals.", outcome: "Understand how software systems work." },
        { id: "P02", name: "Programming & Problem Solving", topics: "Programming, OOP, Data Structures, Algorithms, Debugging, Problem Solving.", outcome: "Build and evaluate solutions independently." },
        { id: "P03", name: "Full-Stack Development", topics: "Frontend, Backend, APIs, Data Access, Git, Tests, CI/CD, Docker, Deployment.", outcome: "Deliver working applications end to end." },
        { id: "P04", name: "AI Literacy & Agentic Coding", topics: "LLMs, Prompting, Context Engineering, AI-Assisted Coding, Agents, Specs, Harnesses, Testing, Review.", outcome: "Use AI safely and effectively within engineering workflows." },
        { id: "P05", name: "System Design & Engineering Breadth", topics: "Architecture, Design Patterns, Cloud, Messaging, Distributed Systems, Containers, Performance, Security.", outcome: "Understand architectural choices and their trade-offs." },
        { id: "P06", name: "Developing GenAI Applications — Optional", topics: "LLM APIs, RAG, Embeddings, Agents, Orchestration, Evaluation, Observability, Security.", outcome: "Build reliable AI-powered products." },
      ],
      packagesNote: "Packages overlap — they are not six mandatory sequential courses. P06 is an optional specialization.",
      careerLevels: [
        { level: "Students & Fresh Graduates", priorities: "Prioritize P01, P02, P03; introduce P04 early with guided usage." },
        { level: "Junior Developers", priorities: "Deepen P01–P03, build P04 proficiency, develop P05 awareness." },
        { level: "Senior Engineers", priorities: "Prioritize deeper P04 and P05, architecture, quality, performance, security, and technical judgment." },
        { level: "Tech Leads & Engineering Managers", priorities: "Focus on engineering leadership, AI-native team workflows, standards, reviews, enablement, governance, and talent development." },
      ],
      juniorAi: {
        message: "Use AI from early learning stages, but don't outsource your understanding.",
        modes: ["Tutor", "Pair Programmer", "Reviewer", "Coding Agent"],
        emphasis: "Emphasize independent explanation, debugging, and validation.",
      },
      adoption: {
        phases: [
          { days: "Days 01–30", title: "Prepare", body: "Assess skills, define approved tools and security policies, select pilot team and baseline metrics." },
          { days: "Days 31–60", title: "Pilot", body: "Deliver hands-on training, implement agentic workflows, add testing and review practices." },
          { days: "Days 61–90", title: "Scale", body: "Measure engineering outcomes, improve practices, share learnings, and expand proven workflows." },
        ],
        metrics: ["Adoption", "Delivery speed", "Quality and defects", "Security", "Developer skills", "AI usage cost", "Business outcomes"],
        highlight: "Buying AI licenses is not an AI adoption strategy.",
      },
      caseStudy: {
        headline: "Four Students. Four Weeks. One Working Application.",
        body: [
          "Four computer science students developed and locally demonstrated a .NET + React application through a four-week internship, supported by concept-focused learning, agentic implementation using GitHub Copilot, and senior mentorship.",
          "The experience illustrates one possible model for combining junior engineering development with coding agents. It is not a controlled productivity study or proof of production readiness.",
        ],
        links: [
          { label: "WorxForge Repository", url: "https://github.com/itworx/WorxForge" },
          { label: "WorxForge Whitepaper", url: "https://github.com/itworx/WorxForge/blob/main/docs/Whitepaper/WorxForge-Juniors-and-AI-Coding-Agents.pdf" },
        ],
      },
      actions: [
        { role: "Student / Junior", items: ["Choose your next learning package and apply it in a real application."] },
        { role: "Senior Engineer", items: ["Practice an agentic coding workflow with clear tests and quality checks."] },
        { role: "Tech Lead", items: ["Introduce repeatable AI-native engineering workflows and team development plans."] },
        { role: "Software Company", items: ["Start a measurable, governed 90-day AI adoption pilot."] },
      ],
      resourceGroups: [
        {
          label: "Package 01 — Computer Science",
          items: [
            { title: "Harvard CS50x", provider: "Harvard University", url: "https://cs50.harvard.edu/x/", access: "Free" },
            { title: "Operating Systems: Three Easy Pieces", provider: "Remzi & Andrea Arpaci-Dusseau", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", access: "Free" },
            { title: "SQLBolt", provider: "SQLBolt", url: "https://sqlbolt.com/", access: "Free" },
            { title: "Cisco Networking Academy", provider: "Cisco", url: "https://www.netacad.com/", access: "Free" },
          ],
        },
        {
          label: "Package 02 — Programming",
          items: [
            { title: "C# Fundamentals", provider: "Passionate Coders", url: "https://www.youtube.com/watch?v=DZHohhJDjHk&list=PLsV97AQt78NT0H8J71qe7edwRpAirfqOI", access: "Free", ref: "R1" },
            { title: "Advanced C#", provider: "Passionate Coders", url: "https://www.youtube.com/playlist?list=PLsV97AQt78NQYhO7NqlBTrJX_Nsk3SmyY", access: "Free", ref: "R12" },
            { title: "Microsoft Learn .NET", provider: "Microsoft", url: "https://learn.microsoft.com/en-us/training/dotnet/", access: "Free" },
            { title: "MIT Introduction to Algorithms", provider: "MIT OpenCourseWare", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/", access: "Free" },
          ],
        },
        {
          label: "Package 03 — Full-Stack Development",
          items: [
            { title: "Entity Framework Core", provider: "DevCreed", url: "https://www.youtube.com/watch?v=I9eMtI_RnUQ&list=PL62tSREI9C-cHV28v-EqWinveTTAos8Pp", access: "Free", ref: "R2" },
            { title: "ASP.NET Core API", provider: "Julio Casal", url: "https://www.youtube.com/watch?v=YbRe4iIVYJk", access: "Free", ref: "R3" },
            { title: "Web Prerequisites", provider: "devdojo", url: "https://www.youtube.com/watch?v=_GTMOmRrqkU", access: "Free", ref: "R4" },
            { title: "Modern JavaScript ES6", provider: "Programming with Mosh", url: "https://www.youtube.com/watch?v=NCwa_xi0Uuc", access: "Free", ref: "R5" },
            { title: "JavaScript for React", provider: "PedroTech", url: "https://www.youtube.com/watch?v=m55PTVUrlnA", access: "Free", ref: "R6" },
            { title: "React JS 19", provider: "JavaScript Mastery", url: "https://www.youtube.com/watch?v=dCLhUialKPQ", access: "Free", ref: "R7" },
            { title: "xUnit Unit Testing", provider: "Nick Chapsas", url: "https://www.youtube.com/watch?v=2Wp8en1I9oQ", access: "Free", ref: "R10" },
            { title: "Git & GitHub", provider: "freeCodeCamp", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", access: "Free", ref: "R11" },
            { title: "React Official Learning Guide", provider: "react.dev", url: "https://react.dev/learn", access: "Free" },
            { title: "Docker Getting Started", provider: "Docker", url: "https://docs.docker.com/get-started/", access: "Free" },
          ],
        },
        {
          label: "Package 04 — AI & Agentic Coding",
          items: [
            { title: "GitHub Copilot Beginner's Guide", provider: "GitHub", url: "https://www.youtube.com/watch?v=SJqGYwRq0uc", access: "Free", ref: "R8" },
            { title: "GH-300 GitHub Copilot", provider: "Microsoft Learn", url: "https://www.youtube.com/playlist?list=PLahhVEj9XNTd8lE7clFGR1el35zaBmJbS", access: "Free", ref: "R13" },
            { title: "Microsoft Generative AI for Beginners", provider: "Microsoft", url: "https://github.com/microsoft/generative-ai-for-beginners", access: "Free" },
            { title: "GitHub Copilot Documentation", provider: "GitHub", url: "https://docs.github.com/en/copilot", access: "Free tier" },
            { title: "Claude Code Documentation", provider: "Anthropic", url: "https://code.claude.com/docs/en/overview", access: "Subscription" },
            { title: "MIT Missing Semester", provider: "MIT", url: "https://missing.csail.mit.edu/", access: "Free" },
          ],
        },
        {
          label: "Package 05 — Architecture & Engineering Breadth",
          items: [
            { title: "Clean Architecture", provider: "Milan Jovanović", url: "https://www.youtube.com/watch?v=fe4iuaoxGbA", access: "Free", ref: "R9" },
            { title: "System Design Primer", provider: "Donne Martin", url: "https://github.com/donnemartin/system-design-primer", access: "Free" },
            { title: "Azure Architecture Center", provider: "Microsoft", url: "https://learn.microsoft.com/en-us/azure/architecture/", access: "Free" },
            { title: "Kubernetes Basics", provider: "Kubernetes", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", access: "Free" },
          ],
        },
        {
          label: "Package 06 — Developing GenAI Applications",
          items: [
            { title: "How Real AI Products Are Designed & Deployed", provider: "itichannel", url: "https://www.youtube.com/watch?v=NEIcvXdyEAc", access: "Free", ref: "R14" },
            { title: "Microsoft GenAI for Beginners .NET", provider: "Microsoft", url: "https://github.com/microsoft/Generative-AI-for-beginners-dotnet", access: "Free" },
            { title: "Microsoft AI Agents for Beginners", provider: "Microsoft", url: "https://github.com/microsoft/ai-agents-for-beginners", access: "Free" },
            { title: "Hugging Face AI Agents Course", provider: "Hugging Face", url: "https://huggingface.co/learn/agents-course/unit0/introduction", access: "Free" },
            { title: "LangGraph Academy", provider: "LangChain", url: "https://academy.langchain.com/courses/intro-to-langgraph", access: "Free" },
          ],
        },
        {
          label: "Software Companies — Adoption References",
          items: [
            { title: "DORA", provider: "DORA", url: "https://dora.dev/", access: "Free" },
            { title: "GitHub Team Agentic Adoption Guide", provider: "GitHub", url: "https://docs.github.com/en/copilot/tutorials/roll-out-at-scale/enable-developers/drive-team-agentic-adoption", access: "Free" },
            { title: "WorxForge Whitepaper", provider: "ITWorx", url: "https://github.com/itworx/WorxForge/blob/main/docs/Whitepaper/WorxForge-Juniors-and-AI-Coding-Agents.pdf", access: "Free" },
          ],
        },
      ],
      resourcesNote: "Some linked courses are free while using their associated AI services may require credits or paid plans.",
      finalMessage: "Learn the right skills. Develop real expertise. Use AI effectively. Own the outcome.",
      watchLabel: "Watch Live / Replay",
    },
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
