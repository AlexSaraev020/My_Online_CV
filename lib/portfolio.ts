/* ==========================================================================
   PORTFOLIO.md — schema, parser and validator.

   One implementation, imported by the synchroniser (Node) and by the site
   (build time), so a file is judged exactly one way. The frontmatter is
   validated with Zod; the YAML subset the schema allows is read by the small
   parser below because Zod does not parse text.

   Nothing that comes out of here is ever treated as HTML: sections are turned
   into typed blocks and every tag, link and emphasis marker is stripped.
   ========================================================================== */

import { z } from 'zod';

export const STATUS = ['live', 'active', 'completed', 'archived', 'concept'] as const;
export type ProjectStatus = (typeof STATUS)[number];

export const SECTION_ORDER = ['overview', 'problem', 'solution', 'features', 'architecture', 'challenges', 'results', 'future'] as const;
export type SectionKey = (typeof SECTION_ORDER)[number];

export const SECTION_TITLE: Record<SectionKey, string> = {
  overview: 'Overview', problem: 'Problem', solution: 'Solution', features: 'Key features',
  architecture: 'Architecture', challenges: 'Challenges', results: 'Results', future: 'Future'
};

/* the plain heading and the longer phrasing both land on the same block */
export const SECTION_ALIAS: Record<string, string> = {
  overview: 'overview', summary: 'overview',
  problem: 'problem', 'problem and motivation': 'problem', motivation: 'problem', why: 'problem',
  solution: 'solution', 'solution and implementation': 'solution', implementation: 'solution',
  approach: 'solution', 'what i built': 'solution',
  'key features': 'features', features: 'features', highlights: 'features',
  architecture: 'architecture', 'technical architecture': 'architecture', 'how it works': 'architecture',
  challenges: 'challenges', 'engineering challenges': 'challenges', 'what was hard': 'challenges',
  results: 'results', 'results and impact': 'results', impact: 'results', 'what changed': 'results',
  future: 'future', 'future improvements': 'future', 'next steps': 'future', roadmap: 'future'
};

export const LIMITS = {
  name: 80, description: 280, subtitle: 120, category: 40, role: 120,
  stackItem: 40, tagItem: 30, stack: 14, tags: 8, gallery: 8, section: 4000
};

export interface Block { type: 'p' | 'ul' | 'h' | 'code'; text?: string; items?: string[] }
export interface ExtraSection { heading: string; blocks?: Block[]; body?: string; warning?: string }

export interface FeedProject {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  category: string;
  status: ProjectStatus | string;
  stack: string[];
  tags: string[];
  year: string;
  role: string;
  live: string;
  repo: string;
  updated: string;
  sections: Partial<Record<SectionKey, string>>;
  extras: ExtraSection[];
  /* filled by the synchroniser */
  repoUrl?: string;
  repoName?: string;
  branch?: string;
  publishedFrom?: string;
  images?: { kind: 'cover' | 'gallery'; src: string; path: string; w: number | null; h: number | null }[];
  warnings?: string[];
}

export interface FeedMeta {
  generatedAt: string;
  user: string;
  accountRepos: number;
  eligible: number;
  skipped: { repo: string; reason: string }[];
  warnings: string[];
  partial: string | false;
  apiCallsRemaining: number | null;
}

export interface Feed { meta: FeedMeta; projects: FeedProject[] }

/* what validate() returns before the image paths are resolved into real URLs */
export interface DraftProject extends FeedProject { cover: string; gallery: string[] }

export interface ParseContext { repo?: string; pushedAt?: string; path?: string }
export interface ParseResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  project: FeedProject | null;
  assets?: { cover: string; gallery: string[] };
}

/* --------------------------------------------------------- scalars -- */
function clean(v: unknown): string {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s;
}

function isYear(v: string): boolean { return /^\d{4}(\s*[—–-]\s*(\d{4}|present|ongoing|now))?$/i.test(v.trim()); }
function isHttps(v: string): boolean { return /^https:\/\/[^\s]+$/i.test(v.trim()); }

export function slug(name: string): string {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'project';
}

/* ------------------------------------------------------ frontmatter -- */
/* Scalars, quoted strings, inline arrays, block lists. Nested objects are not
   part of the schema and are reported. */
export function parseFrontmatter(text: string): { data: Record<string, string | string[]> | null; body: string; errors: string[] } {
  const errors: string[] = [];
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  if (lines[0].trim() !== '---') return { data: null, body: text, errors: ['frontmatter missing'] };

  let end = -1;
  for (let i = 1; i < lines.length; i++) { if (lines[i].trim() === '---') { end = i; break; } }
  if (end < 0) return { data: null, body: text, errors: ['frontmatter missing'] };

  const data: Record<string, string | string[]> = {};
  const fm = lines.slice(1, end);
  let collecting: string | null = null;

  for (let li = 0; li < fm.length; li++) {
    const line = fm[li];
    if (!line.trim() || line.trim().startsWith('#')) continue;

    if (/^\s*-\s+/.test(line)) {
      if (!collecting) { errors.push(`list item with no key: ${line.trim()}`); continue; }
      (data[collecting] as string[]).push(clean(line.replace(/^\s*-\s+/, '')));
      continue;
    }

    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!m) { errors.push(`unreadable frontmatter line: ${line.trim()}`); continue; }

    const key = m[1];
    const rest = m[2].trim();
    collecting = null;
    if (key.length > 40) { errors.push(`frontmatter key too long: ${key}`); continue; }

    if (rest === '') {
      /* either an empty value or the start of a block list — decided by the next line */
      const next = fm[li + 1];
      if (next && /^\s*-\s+/.test(next)) { data[key] = []; collecting = key; }
      else data[key] = '';
      continue;
    }
    if (rest.startsWith('[')) {
      const arr = rest.replace(/^\[\s*|\s*\]$/g, '').split(',').map(clean).filter(Boolean);
      data[key] = arr;
      continue;
    }
    if (rest.startsWith('{')) { errors.push(`nested objects are not part of the schema: ${key}`); continue; }
    data[key] = clean(rest);
  }

  return { data, body: lines.slice(end + 1).join('\n'), errors };
}

/* -------------------------------------------------------- sections -- */
export function parseSections(body: string): { sections: Record<string, string>; extra: ExtraSection[] } {
  const sections: Record<string, string> = {};
  const extra: ExtraSection[] = [];
  const seen: Record<string, boolean> = {};
  let current: string | null = null;
  let bucket: string[] = [];

  function flush() {
    if (!current) return;
    let text = bucket.join('\n').trim();
    bucket = [];
    if (!text) return;
    const known = (SECTION_ORDER as readonly string[]).includes(current);
    if (known && text.length > LIMITS.section) {
      const cut = text.slice(0, LIMITS.section);
      const para = cut.lastIndexOf('\n\n');
      text = (para > 600 ? cut.slice(0, para) : cut) + ' …';
      extra.push({ heading: current, warning: 'section truncated at 4000 characters' });
    }
    if (known) sections[current] = (sections[current] ? sections[current] + '\n\n' : '') + text;
    else extra.push({ heading: current, body: text });
  }

  body.replace(/\r\n/g, '\n').split('\n').forEach((line) => {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      flush();
      const name = h[1].trim().toLowerCase().replace(/\s+/g, ' ');
      const key = SECTION_ALIAS[name] || name;
      if (seen[key]) extra.push({ heading: key, warning: 'duplicate section, merged' });
      seen[key] = true;
      current = key;
      return;
    }
    if (/^###\s+/.test(line)) { if (current) bucket.push('##SUBSECTION ' + line.replace(/^###\s+/, '').trim()); return; }
    if (current) bucket.push(line);
  });
  flush();

  return { sections, extra };
}

/* ----------------------------------------------------------- blocks -- */
export function stripHtml(s: string): string {
  return String(s)
    .replace(/<[^>]*>/g, '')
    .replace(/\[([^\]]*)\]\((?:https?:\/\/|\/|#)[^\s)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function blocks(markdown: string): Block[] {
  const out: Block[] = [];
  let list: Block | null = null;
  let code: string[] | null = null;
  let para: string[] = [];

  const closePara = () => {
    if (para.length) { out.push({ type: 'p', text: stripHtml(para.join(' ')) }); para = []; }
  };

  for (const line of String(markdown || '').split('\n')) {
    if (/^\s*```/.test(line)) {
      if (code !== null) { out.push({ type: 'code', text: code.join('\n') }); code = null; }
      else { closePara(); list = null; code = []; }
      continue;
    }
    if (code !== null) { code.push(line); continue; }

    if (/^\s*###\s+/.test(line) || /^##SUBSECTION\s+/.test(line)) {
      closePara(); list = null;
      out.push({ type: 'h', text: stripHtml(line.replace(/^\s*###\s+|^##SUBSECTION\s+/, '')) });
      continue;
    }
    const li = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(.+)$/);
    if (li) {
      closePara();
      if (!list) { list = { type: 'ul', items: [] }; out.push(list); }
      (list.items as string[]).push(stripHtml(li[1]));
      continue;
    }
    if (!line.trim()) { closePara(); list = null; continue; }
    para.push(stripHtml(line));
  }

  closePara();
  if (code !== null) out.push({ type: 'code', text: code.join('\n') });
  return out.filter((b) => (b.type === 'code' ? (b.text || '').trim() : (b.text || b.items || []).length));
}

/* ----------------------------------------------------------- images -- */
export function isSafeImage(p: unknown): boolean {
  if (typeof p !== 'string' || !p.trim()) return false;
  const s = p.trim();
  if (/^data:/i.test(s) || /^javascript:/i.test(s)) return false;
  if (/^https?:\/\//i.test(s)) return /^https:\/\/raw\.githubusercontent\.com\//i.test(s);
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(s) && !s.includes('..');
}

export function resolveImage(p: string, repoUrl: string, ref: string, sha?: string): string | null {
  const s = String(p).trim();
  if (/^https:\/\//i.test(s)) return s;
  const m = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!m) return null;
  return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${sha || ref}/${s.replace(/^\/+/, '')}`;
}

/* ------------------------------------------------------ validation -- */
const scalar = (v: unknown): string => (Array.isArray(v) ? v.map(clean).join(', ') : clean(v));
const list = (v: unknown): string[] => (typeof v === 'string' ? v.split(',') : Array.isArray(v) ? v : []).map(clean).filter(Boolean);

/* Empty scalars arrive as '' from the parser; normalize() turns them into
   undefined so a required key fails as "missing" rather than as an empty value. */
function normalize(data: Record<string, string | string[]>): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) { const arr = v.map(clean).filter(Boolean); if (arr.length) out[k] = arr; }
    else { const s = clean(v); if (s) out[k] = s; }
  }
  return out;
}

const str = (max: number, min = 0) =>
  z.string().trim().min(min, `must be at least ${min} characters`).max(max, `is longer than ${max} characters`);

const REQUIRED = ['name', 'description', 'category', 'stack', 'status'];

const frontmatterSchema = z.object({
  name: str(LIMITS.name, 2),
  description: str(LIMITS.description, 20),
  category: str(LIMITS.category, 1),
  stack: z.union([z.string(), z.array(z.string())]),
  status: z.string().trim(),
  subtitle: str(LIMITS.subtitle).optional(),
  role: str(LIMITS.role).optional(),
  year: z.string().trim().refine(isYear, 'year must look like 2024, 2024 — 2025 or 2024 — present').optional(),
  cover: z.string().trim().optional(),
  gallery: z.union([z.string(), z.array(z.string())]).optional(),
  live: z.string().trim().refine(isHttps, 'live must be an https URL').optional(),
  repo: z.string().trim().refine(isHttps, 'repo must be an https URL').optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  updated: z.string().trim().optional()
});

export type ValidateResult =
  | { ok: true; errors: []; warnings: string[]; value: DraftProject }
  | { ok: false; errors: string[]; warnings: string[]; value: null };

export function validate(raw: Record<string, string | string[]> | null, ctx?: ParseContext): ValidateResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!raw || typeof raw !== 'object') return { ok: false, errors: ['frontmatter missing'], warnings, value: null };

  const data = normalize(raw);
  for (const key of Object.keys(data)) {
    if (!(frontmatterSchema.shape as Record<string, unknown>)[key]) warnings.push(`unknown frontmatter key: ${key}`);
  }

  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '');
      if (issue.code === 'invalid_type') {
        errors.push(REQUIRED.includes(key) ? `missing required field: ${key}` : `${key} must be a single line of text`);
        continue;
      }
      /* the message already names the field where the schema says so */
      errors.push(issue.message.startsWith(key) ? issue.message : `${key} ${issue.message}`);
    }
  }

  /* cross-field and format rules that read better as plain checks, because the
     message has to quote the value the file actually used */
  const status = clean(data.status ?? '').toLowerCase();
  if (status && !(STATUS as readonly string[]).includes(status)) {
    errors.push(`status "${status}" is not one of ${STATUS.join(', ')}`);
  }

  const stack = list(data.stack ?? '');
  if (!stack.length) errors.push('stack must list at least one technology');
  if (stack.length > LIMITS.stack) warnings.push(`stack trimmed to ${LIMITS.stack} items`);
  stack.slice(0, LIMITS.stack).forEach((s) => { if (s.length > LIMITS.stackItem) warnings.push(`stack item too long, shortened: ${s.slice(0, LIMITS.stackItem)}`); });

  const repo = clean(data.repo ?? '') || (ctx?.repo ?? '');
  if (!isHttps(repo)) errors.push('repository link is missing or not https');

  const cover = clean(data.cover ?? '');
  if (cover && !isSafeImage(cover)) errors.push('cover is not an accepted image path');

  let gallery = list(data.gallery ?? '');
  if (gallery.length > LIMITS.gallery) { warnings.push(`gallery trimmed to ${LIMITS.gallery} images`); gallery = gallery.slice(0, LIMITS.gallery); }
  gallery = gallery.filter((g) => { if (isSafeImage(g)) return true; warnings.push(`rejected image path: ${g}`); return false; });

  const tags = list(data.tags ?? '').slice(0, LIMITS.tags);

  const updatedRaw = clean(data.updated ?? '');
  if (updatedRaw && !/^\d{4}-\d{2}-\d{2}$/.test(updatedRaw)) warnings.push('updated should be YYYY-MM-DD, ignored');
  const updated = /^\d{4}-\d{2}-\d{2}$/.test(updatedRaw) ? updatedRaw : (ctx?.pushedAt ?? '');

  if (errors.length) return { ok: false, errors, warnings, value: null };

  const value: DraftProject = {
    slug: slug(clean(data.name)),
    name: clean(data.name),
    subtitle: clean(data.subtitle ?? ''),
    description: clean(data.description),
    category: clean(data.category),
    status: status as ProjectStatus,
    stack: stack.slice(0, LIMITS.stack),
    tags,
    year: clean(data.year ?? ''),
    role: clean(data.role ?? ''),
    live: clean(data.live ?? ''),
    repo,
    updated,
    sections: {},
    extras: [],
    cover,
    gallery
  };
  return { ok: true, errors: [], warnings, value };
}

/* One entry point: full PORTFOLIO.md text in, a validated project or a list of
   reasons out. */
export function parse(text: string, ctx?: ParseContext): ParseResult {
  const fm = parseFrontmatter(text || '');
  if (fm.data === null) return { ok: false, errors: fm.errors, warnings: [], project: null };

  const parsed = parseSections(fm.body || '');
  const v = validate(fm.data, ctx);
  if (!v.ok) return { ok: false, errors: fm.errors.concat(v.errors), warnings: v.warnings, project: null };

  const draft = v.value;
  const sections: Partial<Record<SectionKey, string>> = {};
  for (const key of SECTION_ORDER) if (parsed.sections[key]) (sections as Record<string, string>)[key] = parsed.sections[key];

  const extras: ExtraSection[] = parsed.extra
    .filter((e) => e.body)
    .map((e) => ({ heading: e.heading.charAt(0).toUpperCase() + e.heading.slice(1), blocks: blocks(e.body as string) }));

  for (const e of parsed.extra) if (e.warning) v.warnings.push(`${e.heading}: ${e.warning}`);
  if (!Object.keys(sections).length && !extras.length) v.warnings.push('no body sections: the card will render from metadata alone');

  /* the raw image paths are handed to the synchroniser, which turns them into
     branch-pinned URLs and never publishes the path itself */
  const { cover, gallery, ...fields } = draft;
  const project: FeedProject = { ...fields, sections, extras, repoUrl: draft.repo };

  return { ok: true, errors: [], warnings: v.warnings, project, assets: { cover, gallery } };
}
