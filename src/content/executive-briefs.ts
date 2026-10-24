/** Editorial condensation of the original episode notes; never a transcript. */
export interface BriefPage {
  id: string;
  title: string;
  section: string;
  layout: 'statement' | 'comparison' | 'matrix' | 'flow' | 'map';
  subtitle?: string;
  entries: { title: string; body: string; url?: string }[];
}

export const EXECUTIVE_BRIEFS: Record<string, BriefPage[]> = {
  ep001: [
    { id: 'summary', title: 'Episode in 60 seconds', section: 'Core lessons', layout: 'statement', entries: [
      { title: 'Code is cheaper. Judgment is not.', body: 'AI accelerates implementation; engineers still frame problems, verify results and own production outcomes.' },
      { title: 'Fundamentals are your review toolkit.', body: 'Design, algorithms, testing and debugging let you evaluate what AI produces.' },
      { title: 'Learn with AI, not around it.', body: 'Use AI to explain and challenge you. Keep independent problem-solving and system understanding.' },
    ] },
    { id: 'role-shift', title: 'From writing code to owning outcomes', section: 'The changing role', layout: 'comparison', entries: [
      { title: 'Less differentiation', body: 'Typing boilerplate\nMemorising syntax\nCompleting isolated tickets' },
      { title: 'More engineering value', body: 'Framing problems and trade-offs\nReviewing and integrating solutions\nAccountability in production' },
    ] },
    { id: 'fundamentals', title: 'Fundamentals make ownership possible', section: 'Engineering toolkit', layout: 'matrix', subtitle: 'Correctness, security and maintainability remain human responsibilities.', entries: [
      { title: 'Data & algorithms', body: 'Spot inefficient or incorrect logic.' },
      { title: 'Design', body: 'Recognise coupling and poor boundaries.' },
      { title: 'Testing', body: 'Prove behaviour instead of trusting it.' },
      { title: 'Debugging', body: 'Diagnose what generated code actually does.' },
    ] },
    { id: 'career-levels', title: 'Different levels. Shared accountability.', section: 'Career priorities', layout: 'matrix', entries: [
      { title: 'Students & juniors', body: 'Build working features. Explain and debug independently. Use AI as a tutor.' },
      { title: 'Senior engineers', body: 'Deepen architecture, domain knowledge and judgment. Direct and validate agentic work.' },
      { title: 'Leads & managers', body: 'Set safe usage, review and validation standards. Grow team knowledge.' },
    ] },
    { id: 'actions', title: 'Make your next change a learning loop', section: 'Practical actions', layout: 'flow', subtitle: 'Choose one fundamentals gap; draw where AI-written code enters your system.', entries: [
      { title: 'Attempt', body: 'Try the problem yourself first.' },
      { title: 'Ask', body: 'Use AI to explain, not just answer.' },
      { title: 'Verify', body: 'Review line by line and write tests.' },
      { title: 'Explain', body: 'Teach it back without assistance.' },
    ] },
  ],
  ep002: [
    { id: 'summary', title: 'Episode in 60 seconds', section: 'Essential lessons', layout: 'statement', entries: [
      { title: 'Build capabilities, not a tool collection.', body: 'Six overlapping learning packages connect foundations, real applications and responsible AI use.' },
      { title: 'Choose depth by career level.', body: 'Juniors build independence; seniors deepen judgment; leaders shape workflows and teams.' },
      { title: 'Adopt AI as an engineering programme.', body: 'Train, govern, validate and measure outcomes. Buying licences is not a strategy.' },
    ] },
    { id: 'lessons', title: 'Learn concepts. Apply them. Own the result.', section: 'The new learning mindset', layout: 'comparison', entries: [
      { title: 'Move beyond', body: 'Memorising syntax\nChasing endless tools\nAccepting generated code uncritically' },
      { title: 'Build instead', body: 'Mental models and working applications\nDomain knowledge and system judgment\nContext, specifications, tests and review' },
    ] },
    { id: 'packages', title: 'Six packages. One engineering skill set.', section: 'Learning architecture', layout: 'map', subtitle: 'Overlapping capabilities, not six mandatory sequential courses. P06 is optional.', entries: [] },
    { id: 'ai-learning', title: 'Use AI early. Keep your understanding.', section: 'Juniors & AI', layout: 'flow', subtitle: 'Independent explanation, debugging and validation are the gates to delegation.', entries: [
      { title: 'Tutor', body: 'Ask for concepts and explanations.' },
      { title: 'Pair', body: 'Attempt the task; work through it together.' },
      { title: 'Reviewer', body: 'Challenge your solution and test it.' },
      { title: 'Agent', body: 'Delegate bounded work you can verify.' },
    ] },
    { id: 'career-levels', title: 'Grow depth. Then multiply team capability.', section: 'Seniors, leads & managers', layout: 'matrix', entries: [
      { title: 'Senior engineers', body: 'P04 + P05: architecture, quality, performance, security and technical judgment.' },
      { title: 'Tech leads', body: 'Repeatable agentic workflows, context, specifications, tests and reviews.' },
      { title: 'Engineering managers', body: 'Enablement, governance, standards and talent development.' },
    ] },
    { id: 'adoption', title: 'A measured 90-day AI adoption roadmap', section: 'Software companies', layout: 'flow', subtitle: 'Measure delivery, defects, security, skills, usage cost and business outcomes.', entries: [
      { title: '01–30 / Prepare', body: 'Pilot with a small team; set guidelines and security rules. Baseline skills and metrics.' },
      { title: '31–60 / Pilot', body: 'Train hands-on. Add agentic workflows, tests and review. Measure delivery and quality.' },
      { title: '61–90 / Scale', body: 'Standardise workflows and invest in skills. Expand proven practices.' },
    ] },
    { id: 'case-study', title: 'Four students. Four weeks. One application.', section: 'WorxForge case study', layout: 'flow', subtitle: 'Across a four-week internship; not a productivity study or proof of production readiness.', entries: [
      { title: 'Concept-focused learning', body: 'Computer science students combined learning with senior mentorship.' },
      { title: 'Agentic implementation', body: 'GitHub Copilot supported implementation of a .NET + React application.' },
      { title: 'A local demonstration', body: 'The team demonstrated a working application; the repository and whitepaper document the experience.' },
    ] },
    { id: 'actions', title: 'Choose one next step. Make it verifiable.', section: 'Takeaways & action items', layout: 'matrix', entries: [
      { title: 'Student / junior', body: 'Choose one package for the next month; apply it in a real application.' },
      { title: 'Senior engineer', body: 'Run a bounded agent task; document context, tests and quality checks.' },
      { title: 'Tech lead', body: 'Introduce repeatable workflows and a team development plan.' },
      { title: 'Software company', body: 'Start a governed 90-day pilot. Learn one new business-domain rule.' },
    ] },
  ],
};