import type { Episode } from './types';
import cover from '@/assets/ep003.jpg.asset.json';

export const EP003: Episode = {
  id: 'ep003', number: 3, slug: 'ep003',
  title: 'From Prompt to Pull Request: Working with AI Coding Agents',
  shortTitle: 'From Prompt to Pull Request', scheduledDate: '2026-10-31',
  youtubeVideoId: 'u114p0sd86I', youtubeUrl: 'https://youtube.com/live/u114p0sd86I',
  thumbnail: cover.url,
  description: 'How developers can work effectively with AI coding agents, from task definition and context engineering to delegation, implementation, verification, and Pull Request delivery.',
  summary: 'AI generates code. Engineers orchestrate the workflow and own the outcome.',
  overview: ['Working with AI Coding Agents', 'AI can write the code. But who makes it production-ready?'],
  topics: ['Coding Agents', 'AI-Native Engineering', 'Engineering Fundamentals'],
  audienceLevels: ['Juniors', 'Seniors', 'Tech Leads'],
  tags: ['Claude Code', 'prompt engineering', 'context engineering', 'harness engineering', 'pull request', 'verification'],
  takeaways: ['Define engineering-ready tasks.', 'Provide relevant context and reliable guardrails.', 'Delegate bounded work and verify the result.', 'Keep engineering ownership with humans.'],
  actionItems: ['Define outcomes and acceptance criteria.', 'Supply relevant repository context.', 'Delegate bounded tasks.', 'Verify with tests, review and evidence.', 'Own the delivered outcome.'],
  presentationLabel: 'Presentation & Resources', resourceIds: [], slides: [],
  presentationCover: { subtitle: 'Working with AI Coding Agents', question: 'AI can write the code. But who makes it production-ready?', stages: ['Prompt', 'Code', 'Validation', 'Pull Request'] },
  resourceSlideTitles: ['Official Claude learning courses', 'Official documentation & references'],
  brief: {
    summaryHeadline: 'You lead. Agents execute. You own the outcome.',
    summary: ['AI generates code. Engineers orchestrate the workflow and own the outcome.'],
    lessons: [
      { title: 'Model, product and skill', body: 'Capability becomes value through tools, workflows and engineering judgment.' },
      { title: 'Prompt, context and harness', body: 'Clear instructions, relevant knowledge and reliable operating guardrails.' },
      { title: 'From task to Pull Request', body: 'Define, plan, delegate, implement, test, review and deliver.' },
      { title: 'Generated is not verified', body: 'Correctness, regressions, security and maintainability require evidence.' },
    ],
    actions: [{ role: 'Engineer', items: ['Define', 'Guide', 'Verify', 'Own'] }],
    finalMessage: "The advantage isn't simply using AI. It's knowing how to engineer the collaboration.",
    resourceGroups: [
      { label: 'Official Claude learning courses', items: [
        { title: 'Claude Code 101', provider: 'Claude Academy · Setup & core workflows', url: 'https://academy.claude.com/courses/claude-code-101', access: 'Free' },
        { title: 'Claude Code in Action', provider: 'Claude Academy · Configure & verify sessions', url: 'https://academy.claude.com/courses/claude-code-in-action', access: 'Free' },
        { title: 'Introduction to Agent Skills', provider: 'Claude Academy · Reusable workflows', url: 'https://academy.claude.com/courses/introduction-to-agent-skills', access: 'Free' },
        { title: 'Introduction to Subagents', provider: 'Claude Academy · Bounded delegation', url: 'https://academy.claude.com/courses/introduction-to-subagents', access: 'Free' },
        { title: 'Build with Claude — Course Catalog', provider: 'Claude Academy', url: 'https://academy.claude.com/collections/build-with-claude', access: 'Free' },
        { title: 'Anthropic Learning Portal', provider: 'Anthropic · Official training', url: 'https://anthropic.skilljar.com/', access: 'Free' },
      ] },
      { label: 'Official documentation & references', items: [
        { title: 'Claude Code Overview', provider: 'Anthropic · Capabilities & setup', url: 'https://code.claude.com/docs/en/overview', access: 'Free' },
        { title: 'CLAUDE.md', provider: 'Anthropic · Project instructions', url: 'https://code.claude.com/docs/en/memory', access: 'Free' },
        { title: 'Skills', provider: 'Anthropic · Reusable procedures', url: 'https://code.claude.com/docs/en/skills', access: 'Free' },
        { title: 'Subagents', provider: 'Anthropic · Specialized delegation', url: 'https://code.claude.com/docs/en/sub-agents', access: 'Free' },
        { title: 'Hooks', provider: 'Anthropic · Lifecycle automation', url: 'https://code.claude.com/docs/en/hooks', access: 'Free' },
        { title: 'When to Use Each Customization', provider: 'Claude Blog · Choosing the right mechanism', url: 'https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more', access: 'Free' },
      ] },
    ],
  },
};