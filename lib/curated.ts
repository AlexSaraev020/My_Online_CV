/* ==========================================================================
   The curated plates on Plate 04.

   These six stay authored here rather than coming from GitHub: four are the
   CV engagements, which have no repository, and two are your own builds while
   their repositories have no PORTFOLIO.md. The moment one of the two GitHub
   builds publishes PORTFOLIO.md, delete its entry here and the synchroniser
   takes it over — the plate never shows it twice.

   "preview" is a diagram drawn in code (components/previews.tsx); "shot" is a
   real screenshot with the pixel size measured from the file.
   ========================================================================== */

export type PreviewKey = 'zaf' | 'flint' | 'mvphub' | 'commerce';

export interface Shot {
  src: string;
  w: number;
  h: number;
  alt: string;
}

export interface CuratedProject {
  id: string;
  title: string;
  kind: string;
  year: string;
  role: string;
  stack: string[];
  problem: string;
  approach: string;
  outcome: string;
  live?: string;
  source?: string;
  preview?: PreviewKey;
  shot?: Shot;
}

export const CURATED: CuratedProject[] = [
  {
    id: 'zaf-suite',
    title: 'Zendesk App Suite',
    kind: 'Support tooling',
    year: '2025 — present',
    role: 'Full-stack developer at Roca Work — design, implementation, deployment',
    stack: ['TypeScript', 'React', 'Zendesk ZAF', 'Node.js', 'Docker'],
    problem: 'Support agents worked a queue Zendesk had never been configured for. The triage decision, the customer history and the follow-up action lived in six browser tabs and one group chat.',
    approach: 'Applications built on the App Framework, each one a panel inside the ticket the agent already has open — custom UI, automations, custom fields populated by a classifier. The apps sit on Node.js microservices in Docker, so the eleventh integration is another service on the same bridge rather than a new project.',
    outcome: 'Ten applications in production. Manual triage time down by roughly 35%, routing more accurate, and 10+ integrations running side by side behind one inbox.',
    preview: 'zaf'
  },
  {
    id: 'flint-agent',
    title: 'Flint AI Agent',
    kind: 'Chat automation',
    year: '2025 — present',
    role: 'Developer at Roca Work — chat widget and model integration',
    stack: ['Zendesk chat widget', 'Custom AI models', 'Node.js', 'Docker'],
    problem: 'Most of what arrived through the chat widget was one of a handful of common questions, and every one of them still waited for an agent to read it.',
    approach: 'The widget talks to the custom models through the same containerised services that serve the ticket applications, so a reply is generated against the customer\'s own data instead of a canned article. Anything the agent cannot resolve lands in the queue already classified, with its intent attached.',
    outcome: 'About 30% of common inquiries resolve without an agent touching them, and the ones that escalate arrive with the triage decision already made.',
    preview: 'flint'
  },
  {
    id: 'mvphub',
    title: 'MVPHub',
    kind: 'Job application platform',
    year: '2024 — 2026',
    role: 'Freelance front-end engineer — interface design through deployment',
    stack: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'NextAuth', 'n8n'],
    problem: 'Applying for work meant the same form, the same details and the same follow-ups, repeated by hand for every listing. Thousands of users were doing the mechanical part themselves.',
    approach: 'The platform UI designed from scratch and built mobile-first in Next.js and Tailwind, with Google OAuth and NextAuth carrying the session across the app. Onboarding kept short, heavy animation disabled on mobile, 50+ images optimised and lazy-loaded, semantic markup throughout, and 100+ unit tests around the authentication and application paths. n8n flows took internal busywork out of the code.',
    outcome: 'More than 90% of users complete onboarding, average login time down 20%, and the front end stopped being where applications got stuck.',
    preview: 'mvphub'
  },
  {
    id: 'commerce-rails',
    title: 'Commerce Automation',
    kind: 'Workflow orchestration',
    year: '2025 — present',
    role: 'Developer at Roca Work — rule design and build',
    stack: ['Make.com', 'Baselinker', 'Adobe Commerce', 'Zendesk'],
    problem: 'An order that needed support crossed three platforms, and someone re-entered the same details on each one — every order, every day.',
    approach: 'Automation agents built in Make.com and driven by one written rule set: watch for the condition, create the ticket, sync the order record, notify the channel that owns it. The rules are the product; Baselinker, Adobe Commerce and Zendesk stay exactly where they already are.',
    outcome: 'Manual cross-platform work down by around 80%, and the flows run unattended.',
    preview: 'commerce'
  },
  {
    /* WeVibe is no longer hand-authored here: its repository root carries PORTFOLIO.md, so the
       synchroniser publishes it and the new screenshots come from that repository */
    id: 'gamerslobby',
    title: 'Gamers Lobby',
    kind: 'Full-stack catalogue · own build',
    year: '2024',
    role: 'Solo — front end, Express API, sessions, deployment',
    stack: ['React + TypeScript', 'Express', 'MongoDB / Mongoose', 'JWT + cookies', 'bcrypt', 'CORS', 'Swiper'],
    live: 'https://gamerslobby.vercel.app',
    source: 'https://github.com/AlexSaraev020/MERN_Steam_App',
    problem: 'A Steam library is scattered across a wishlist, a library page and a launcher, and nothing shows what you actually own in one view.',
    approach: 'Two deployables that speak over a documented boundary: a React and TypeScript front end, and an Express API with Mongoose documents for games, cookie-carried JWT sessions, bcrypt and CORS. The front end caches the catalogue list it has already pulled, so scrolling does not re-request the same page.',
    outcome: 'Deployed and running, with one honest caveat written on the repository: it lives on a free backend tier that sleeps, so the first request after idle takes about a minute to answer.',
    shot: { src: '/assets/work/gamerslobby-1.webp', w: 2560, h: 1600, alt: 'Screenshot of the Gamers Lobby catalogue, taken from the project’s own asset set.' }
  }
];
