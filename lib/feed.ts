/* ==========================================================================
   The single case-study model the whole site renders from.

   A curated plate and a repository published through PORTFOLIO.md are mapped
   into the same shape, so one component produces one design for both — the
   cards on Plate 04 and the case page at /work/<slug>.
   ========================================================================== */

import raw from '../content/projects.json';
import { CURATED, type CuratedProject, type PreviewKey } from './curated';
import { blocks, SECTION_ORDER, SECTION_TITLE, type Block, type Feed, type FeedMeta, type FeedProject } from './portfolio';

export interface CaseImage { src: string; w: number | null; h: number | null; alt: string }
export interface CaseSection { label: string; blocks: Block[] }

export interface Case {
  id: string;
  title: string;
  subtitle: string;
  kind: string;
  year: string;
  role: string;
  stack: string[];
  status: string;
  tags: string[];
  updated: string;
  live: string;
  source: string;
  description: string;
  previewKey: PreviewKey | null;
  shot: CaseImage | null;
  images: CaseImage[];
  sections: CaseSection[];
}

const FEED = raw as unknown as Feed;
const ITEMS: FeedProject[] = Array.isArray(FEED?.projects) ? FEED.projects.filter((p) => p && p.slug && p.name) : [];
export const META: FeedMeta = FEED?.meta ?? { generatedAt: '', user: '', accountRepos: 0, eligible: 0, skipped: [], warnings: [], partial: false, apiCallsRemaining: null };

function md(text: string): Block[] { return blocks(text); }

function curatedCase(p: CuratedProject): Case {
  const sections: CaseSection[] = ([['Problem', p.problem], ['Approach', p.approach], ['What changed', p.outcome]] as const)
    .filter((row) => row[1])
    .map((row) => ({ label: row[0], blocks: md(row[1]) }));

  return {
    id: p.id,
    title: p.title,
    subtitle: '',
    kind: p.kind,
    year: p.year,
    role: p.role,
    stack: p.stack,
    status: '',
    tags: [],
    updated: '',
    live: p.live || '',
    source: p.source || '',
    description: p.problem,
    previewKey: p.preview ?? null,
    shot: p.shot ? { src: p.shot.src, w: p.shot.w, h: p.shot.h, alt: p.shot.alt } : null,
    images: [],
    sections
  };
}

function feedCase(p: FeedProject): Case {
  const sections: CaseSection[] = [];
  for (const key of SECTION_ORDER) {
    const body = p.sections?.[key];
    if (body) sections.push({ label: SECTION_TITLE[key], blocks: md(body) });
  }
  for (const extra of p.extras || []) {
    if (extra.blocks?.length) sections.push({ label: extra.heading, blocks: extra.blocks });
  }

  const images: CaseImage[] = (p.images || []).map((img) => ({
    src: img.src,
    w: img.w,
    h: img.h,
    alt: `${p.name} — ${img.kind === 'cover' ? 'cover image' : 'screenshot'} from the repository`
  }));

  return {
    id: p.slug,
    title: p.name,
    subtitle: p.subtitle || '',
    kind: p.category,
    year: p.year || '',
    role: p.role || '',
    stack: p.stack || [],
    status: p.status || '',
    tags: p.tags || [],
    updated: p.updated || '',
    live: p.live || '',
    source: p.repoUrl || p.repo || '',
    description: p.description || '',
    previewKey: null,
    shot: null,
    images,
    sections
  };
}

export const CURATED_CASES: Case[] = CURATED.map(curatedCase);
export const FEED_CASES: Case[] = ITEMS.map(feedCase);
export const CASES: Case[] = CURATED_CASES.concat(FEED_CASES);

export function getCase(id: string): Case | undefined {
  return CASES.find((c) => c.id === id);
}

export function neighbours(id: string): { prev: Case; next: Case; index: number; total: number } | null {
  const i = CASES.findIndex((c) => c.id === id);
  if (i < 0) return null;
  const total = CASES.length;
  return {
    prev: CASES[(i - 1 + total) % total],
    next: CASES[(i + 1) % total],
    index: i,
    total
  };
}

/* the plate headline counts what is genuinely on the plate, so it cannot go stale */
export function plateHeadline(): string {
  return `${CASES.length} builds. ${CASES.length} different problems.`;
}

/* which repositories were looked at and why they are not on the plate */
export function skippedSummary(): string {
  const skipped = META.skipped || [];
  if (!skipped.length) return 'No eligible repository found.';
  const names = skipped.map((s) => s.repo.split('/').pop() || s.repo);
  const shown = names.slice(0, 4).join(', ');
  const rest = names.length > 4 ? ` and ${names.length - 4} more` : '';
  return `Checked and not listed: ${shown}${rest}. Each one needs a PORTFOLIO.md in its root.`;
}

