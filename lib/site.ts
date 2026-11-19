/* ==========================================================================
   SIGNAL FIELD — content, typed.
   Every visible fact on the site comes from this file and curated.ts.
   Source: the supplied CV (Saraev Alexandru), extracted 2026-11-17.
   Counts, percentages and dates are the CV's own figures — nothing here is
   estimated, and nothing published through PORTFOLIO.md may invent a figure.
   ========================================================================== */

export interface Site {
  name: string;
  role: string;
  kicker: string;
  availability: string;
  email: string;
  phone: string;
  tel: string;
  location: string;
  links: Record<string, string>;
}

export interface Discipline { label: string; value: string }
export interface Capability { id: string; name: string; line: string; body: string; stack: string[] }
export interface ProcessStep { n: string; name: string; body: string }
export interface CvEntry { period: string; role: string; org: string; body: string }
export type SkillTier = 'deep' | 'strong' | 'working';
export interface Skill { name: string; tier: SkillTier }
export interface Principle { n: string; title: string; body: string }

/* Pages serves this export under the repository path, so local asset URLs and the metadata origin
   both need it. NEXT_PUBLIC_BASE_PATH is set by the Pages workflow and empty in local dev. */
export const SITE_URL = 'https://alexsaraev020.github.io/My_Online_CV';
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const asset = (path: string) => (path.startsWith('/') ? `${BASE}${path}` : path);

export const SITE: Site = {
  name: 'Alexandru Saraev',
  role: 'Full-stack Developer',
  kicker: 'Full-stack developer · Bucharest, Romania',
  availability: 'open to remote, hybrid or on-site roles',
  email: 'alexsaraev4@gmail.com',
  phone: '+40 774 613 749',
  tel: '+40774613749',
  location: 'Bucharest, Romania',
  links: {
    GitHub: 'https://github.com/AlexSaraev020',
    LinkedIn: 'https://www.linkedin.com/in/saraev-alexandru/'
  }
};

export const ISSUE = 'Signal Field · Issue 01';

export const DISCIPLINES: Discipline[] = [
  { label: 'Front-end', value: 'React, Next.js, TypeScript' },
  { label: 'Services', value: 'Node.js, Docker, APIs' },
  { label: 'Automation', value: 'n8n, Make.com' },
  { label: 'Support tools', value: 'Zendesk App Framework' }
];

export const CAPABILITIES: Capability[] = [
  {
    id: 'frontend',
    name: 'Front-end engineering',
    line: 'Interfaces in React and Next.js that behave on a phone',
    body: 'HTML, CSS, JavaScript and TypeScript. Mobile-first layouts, component state that survives a rebuild, login flows with the session handling on both sides of them. At MVPHub the interface was designed from scratch and shipped as a Next.js and Tailwind build used by thousands of people, most of them on phones.',
    stack: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'NextAuth / Google OAuth']
  },
  {
    id: 'services',
    name: 'Node services & integrations',
    line: 'The small services that make a product talk to everything else',
    body: 'Backend microservices in Node.js, containerised with Docker, sitting between a front-end and the systems it depends on — custom AI models, ticketing APIs, external data sources. Ten of them running in production is a support toolchain, not a prototype.',
    stack: ['Node.js', 'Docker', 'REST APIs', 'Postman', 'npm', 'GitHub']
  },
  {
    id: 'support',
    name: 'Support platform tooling',
    line: 'Custom applications built inside Zendesk',
    body: 'Ten applications designed and shipped on the Zendesk App Framework: panels inside the ticket an agent already has open, custom fields populated automatically, an AI agent wired into the chat widget. The team keeps one inbox instead of six tools and a group chat.',
    stack: ['Zendesk App Framework (ZAF)', 'React', 'TypeScript', 'Custom ticket fields', 'Chat widget integration']
  },
  {
    id: 'automation',
    name: 'Workflow automation',
    line: 'Rules that move work between platforms without a person in the middle',
    body: 'n8n and Make.com flows that watch for a condition and do the next thing — open a ticket, sync an order, notify the right channel. Baselinker, Adobe Commerce and Zendesk driven from one written rule set, which took about 80% of the manual cross-platform copying out of the working day.',
    stack: ['Make.com', 'n8n', 'Baselinker', 'Adobe Commerce', 'Zendesk']
  },
  {
    id: 'quality',
    name: 'QA & cross-device testing',
    line: 'Checked on the devices people actually own',
    body: 'Nearly two years of manual QA on a mobile application: 150+ written test cases across functional, usability and performance scenarios, 25+ Android and iOS devices, 40+ critical defects caught before release. Defects in Jira and TestRail with reproduction steps and device logs from ADB and iMazing. It is the reason the error path gets designed at the same time as the happy one.',
    stack: ['Jira', 'TestRail', 'ADB (Android)', 'iMazing (iOS)', 'Regression testing']
  },
  {
    id: 'perf',
    name: 'Performance & accessibility',
    line: 'Light pages, semantic markup, nothing that stalls on mid-range hardware',
    body: 'Image optimisation and lazy loading across 50+ assets, heavy animation switched off on mobile, semantic HTML where a heading is actually a heading. On MVPHub that pass cut average login time by 20% and lifted onboarding completion above 90%.',
    stack: ['Image pipeline', 'Lazy loading', 'Responsive design', 'Semantic HTML', 'Animation budget']
  }
];

export const PROCESS: ProcessStep[] = [
  { n: '01', name: 'Framing', body: 'A hard look at what the product is actually for, what already exists, and what we are allowed to break. Outcomes: a written brief and the two or three decisions that shape everything else.' },
  { n: '02', name: 'Sketch', body: 'A working prototype in days — real interaction, rough edges kept on purpose — so the shape is argued with something you can use instead of a document.' },
  { n: '03', name: 'Architecture', body: 'Data model, boundaries, hosting, and the parts that will have to change later. Chosen deliberately, written down, and boring where boring is the right answer.' },
  { n: '04', name: 'Build', body: 'Incremental, always running, demoed every week. Testing where failure is expensive — unit tests around the paths a user depends on, and the error state designed next to the happy one.' },
  { n: '05', name: 'Handover', body: 'Deployment, documentation, seed data and a walkthrough with the team that inherits it. Then I stay reachable, and fade out on purpose.' }
];

export const EXPERIENCE: CvEntry[] = [
  { period: 'Dec 2025 — present', role: 'Full Stack Developer', org: 'Roca Work', body: 'Ten Zendesk applications on the App Framework, in React and TypeScript, over Node.js microservices containerised in Docker. AI ticket classification and a chat agent integrated with custom models, Make.com flows across Baselinker, Adobe Commerce and Zendesk, and a mentoring pass on Zendesk and customer-experience practice that cut a colleague\'s onboarding time by about 25%.' },
  { period: 'Jul 2024 — Jul 2026', role: 'Frontend Engineer · freelance', org: 'MVPHub', body: 'An AI-powered job application platform used by thousands of people: UI designed from scratch, responsive mobile-first build in Next.js and Tailwind, Google OAuth and NextAuth sessions, 100+ unit tests, performance and accessibility work across 50+ images, and n8n workflows that raised internal team efficiency by roughly 50%.' },
  { period: 'Feb 2024 — Nov 2025', role: 'QA Manual Tester', org: 'Pixel Bowl Studio', body: 'Manual testing of a mobile application before each release: 150+ test cases across functional, usability and performance scenarios, 25+ Android and iOS devices, 40+ critical defects found pre-release, full requirement-to-test traceability in TestRail, regression passes after every fix, device logs collected through ADB and iMazing for root-cause analysis.' }
];

export const EDUCATION: CvEntry[] = [
  { period: '6 months', role: 'Frontend Developer Course', org: 'Informal School of IT, Bucharest', body: 'Intensive training in HTML, CSS, JavaScript and React, built around practical projects — responsive, user-facing web applications reviewed as they were made.' }
];

/* tier is a judgement, not a score: deep = used daily in production,
   strong = shipped with it, working = competent, used less often. */
export const SKILLS: Skill[] = [
  { name: 'TypeScript / JavaScript', tier: 'deep' },
  { name: 'React / Next.js', tier: 'deep' },
  { name: 'HTML / CSS & responsive layout', tier: 'deep' },
  { name: 'Node.js services & APIs', tier: 'strong' },
  { name: 'Zendesk App Framework', tier: 'strong' },
  { name: 'Make.com / n8n automation', tier: 'strong' },
  { name: 'QA & cross-device testing', tier: 'strong' },
  { name: 'Docker & deployment', tier: 'working' }
];

export const EXTRA_SKILLS: string[] = ['Tailwind CSS', 'Framer Motion', 'NextAuth / Google OAuth', 'Postman', 'npm & GitHub', 'Jira / TestRail', 'ADB (Android)', 'iMazing (iOS)', 'Baselinker', 'Adobe Commerce', 'Bug tracking'];

export const PRINCIPLES: Principle[] = [
  { n: '01', title: 'Read before writing', body: 'Every engagement starts in the existing code, the existing data and the existing constraints. Most of what looks like a rewrite is a misunderstanding that a week of reading removes.' },
  { n: '02', title: 'Own the whole problem', body: 'The interface and the service behind it are one decision. Splitting them across vendors is how products end up with two half-solutions and a gap nobody owns.' },
  { n: '03', title: 'Ambition, priced honestly', body: 'I would rather ship the version that works on a Tuesday afternoon in month nine than the version that looks best in a case study.' },
  { n: '04', title: 'Details are the product', body: 'Leading, timing, empty states, error copy, focus order. Users cannot name these things, but they feel all of them and decide on them.' }
];

export const ENGAGEMENT_KINDS = [
  'A role at your company',
  'A front-end build or rebuild',
  'Zendesk or support-tooling work',
  'Automation and integrations',
  'A QA, performance or accessibility pass'
];

export function pad(n: number): string { return (n < 10 ? '0' : '') + n; }
