#!/usr/bin/env node
/* ==========================================================================
   PORTFOLIO.md synchroniser.

   Reads the configured GitHub account, finds every public repository whose
   root contains PORTFOLIO.md, parses and validates those files with the same
   schema the site uses, resolves and measures their images, and writes
   content/projects.json. There is no server and no runtime GitHub call: the
   committed JSON file IS the data, so no token can ever reach the browser.

   npm run sync                       live sync against the GitHub API
   npm run sync -- --dry-run         report only, write nothing
   npm run sync -- --force           ignore the HTTP cache
   npm run sync -- --fixtures tests/fixtures-repos --out out.json   offline

   A token is optional and only ever read from the environment (GITHUB_TOKEN)
   to raise the rate limit from 60 to 5000 requests an hour.
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { CURATED } from '../lib/curated.ts';
import { parse, resolveImage, sizeFromBytes, type Feed, type FeedProject } from '../lib/portfolio.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const argv = process.argv.slice(2);
const has = (f: string) => argv.includes(f);
const opt = (f: string) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };

interface Config {
  user: string; feed: string; cacheDir: string; includeForks: boolean;
  exclude: string[]; maxProjects: number; sort: string; token: string;
}

function loadConfig(): Config {
  let file: Record<string, unknown> = {};
  try {
    file = JSON.parse(fs.readFileSync(path.join(ROOT, 'portfolio.config.json'), 'utf8'));
  } catch (e) {
    console.error(`sync: portfolio.config.json is missing or unreadable (${(e as Error).message})`);
  }
  return {
    user: process.env.GITHUB_USER || String(file.githubUser || ''),
    feed: opt('--out') || String(file.feed || 'content/projects.json'),
    cacheDir: path.join(ROOT, String(file.cacheDir || 'tools/.cache')),
    includeForks: file.includeForks === true,
    exclude: Array.isArray(file.exclude) ? (file.exclude as string[]) : [],
    maxProjects: Number(file.maxProjects) || 12,
    sort: String(file.sort || 'pushed'),
    token: process.env.GITHUB_TOKEN || ''
  };
}

const CONFIG = loadConfig();

interface Repo {
  name: string;
  owner: { login: string };
  html_url: string;
  default_branch: string;
  fork: boolean;
  pushed_at: string;
  description?: string;
}

class RateLimited extends Error {}

let apiRemaining: number | null = null;

async function api(url: string, opts?: { headers?: Record<string, string> }): Promise<{ res: Response; remaining: number | null }> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'portfolio-sync',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (CONFIG.token) headers.Authorization = `Bearer ${CONFIG.token}`;
  if (opts?.headers) Object.assign(headers, opts.headers);

  let res: Response;
  try {
    res = await fetch(url, { headers, redirect: 'follow' });
  } catch (e) {
    const err = new Error(`network failure: ${(e as Error).message}`);
    (err as Error & { url?: string }).url = url;
    throw err;
  }

  const remaining = Number(res.headers.get('x-ratelimit-remaining'));
  if (res.status === 403 || res.status === 429) {
    const retry = res.headers.get('retry-after');
    const reset = res.headers.get('x-ratelimit-reset');
    throw new RateLimited(`rate limited (${res.status}), retry after ${retry || (reset && Number.isFinite(Number(reset)) ? new Date(Number(reset) * 1000).toISOString() : 'unknown')}`);
  }
  return { res, remaining: Number.isFinite(remaining) ? remaining : null };
}

interface ApiResponse { status: number; remaining: number | null; data: unknown }

async function json(url: string, opts?: { headers?: Record<string, string> }): Promise<ApiResponse> {
  const { res, remaining } = await api(url, opts);
  if (remaining !== null) apiRemaining = remaining;
  if (res.status === 304) return { status: 304, remaining, data: null };
  if (res.status === 404) return { status: 404, remaining, data: null };
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`GitHub returned ${res.status} for ${url}${body ? `: ${body.slice(0, 120)}` : ''}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return { status: res.status, remaining, data: await res.json() };
}

async function listRepos(user: string): Promise<Repo[]> {
  const repos: Repo[] = [];
  for (let page = 1; page <= 10; page++) {
    const r = await json(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&page=${page}&type=public&sort=${CONFIG.sort}`);
    const batch = (r.data as Repo[]) || [];
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

/* ------------------------------------------------------------- cache -- */
interface CacheEntry { text: string; sha: string; etag: string; at: string }

const cacheFile = (name: string) => path.join(CONFIG.cacheDir, `${name.replace(/[^a-z0-9_.-]/gi, '_')}.json`);

function readCache(name: string): CacheEntry | null {
  try { return JSON.parse(fs.readFileSync(cacheFile(name), 'utf8')); } catch { return null; }
}

function writeCache(name: string, value: CacheEntry): void {
  fs.mkdirSync(CONFIG.cacheDir, { recursive: true });
  fs.writeFileSync(cacheFile(name), JSON.stringify(value));
}

/* Read PORTFOLIO.md from a repository root. Conditional request when we have
   seen it before, so an unchanged file costs one 304 and no parsing. */
async function readPortfolioFile(repo: Repo): Promise<{ text: string; sha: string; etag: string } | null> {
  const key = `${repo.owner.login}--${repo.name}`;
  const cached = has('--force') ? null : readCache(key);
  const url = `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents/PORTFOLIO.md?ref=${encodeURIComponent(repo.default_branch)}`;
  const { res } = await api(url, cached?.etag ? { headers: { 'If-None-Match': cached.etag } } : undefined);

  const remaining = Number(res.headers.get('x-ratelimit-remaining'));
  if (Number.isFinite(remaining)) apiRemaining = remaining;

  if (res.status === 304 && cached) return { text: cached.text, sha: cached.sha, etag: cached.etag };
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub returned ${res.status} for ${url}`);

  const data = (await res.json()) as { content?: string; download_url?: string; sha?: string };
  const text = data.content
    ? Buffer.from(data.content, 'base64').toString('utf8')
    : data.download_url ? await (await fetch(data.download_url)).text() : null;
  if (text === null) return null;

  const entry: CacheEntry = { text, sha: data.sha || '', etag: res.headers.get('etag') || '', at: new Date().toISOString() };
  writeCache(key, entry);
  return { text, sha: entry.sha, etag: entry.etag };
}

/* ------------------------------------------------- measured images -- */
/* A ranged read of the first 64 KB is enough to read PNG / JPEG / WEBP / GIF
   headers, so image geometry comes from the file and not from a guess. An
   unreadable image is dropped; a readable one of unknown format is kept and
   the layout falls back to natural flow. */
async function measure(url: string): Promise<{ ok: boolean; w?: number | null; h?: number | null }> {
  try {
    const res = await fetch(url, { headers: { Range: 'bytes=0-65535' } });
    if (!res.ok) return { ok: false };
    const buf = Buffer.from(await res.arrayBuffer());
    let size = sizeFromBytes(buf);
    if (!size && /\.svg$/i.test(url)) {
      const t = buf.toString('utf8');
      const w = t.match(/\bwidth="(\d+)/);
      const h = t.match(/\bheight="(\d+)/);
      if (w && h) size = { w: Number(w[1]), h: Number(h[1]) };
    }
    return { ok: true, w: size?.w ?? null, h: size?.h ?? null };
  } catch {
    return { ok: false };
  }
}

interface ImageRef { kind: 'cover' | 'gallery'; path: string }
type FeedImage = NonNullable<FeedProject['images']>[number];

async function resolveImages(
  project: FeedProject,
  repo: Repo,
  warnings: string[],
  assets?: { cover: string; gallery: string[] }
): Promise<void> {
  const refs: ImageRef[] = [
    { kind: 'cover', path: assets?.cover || '' },
    ...(assets?.gallery || []).map((p): ImageRef => ({ kind: 'gallery', path: p }))
  ];
  const out: FeedImage[] = [];
  const notes: string[] = [];

  for (const ref of refs) {
    if (!ref.path) continue;
    const url = resolveImage(ref.path, repo.html_url, repo.default_branch);
    if (!url) { notes.push(`image path not resolvable, dropped: ${ref.path}`); continue; }
    const size = has('--fixtures') ? { ok: true, w: null, h: null } : await measure(url);
    if (!size.ok) { notes.push(`image could not be read from the repository, dropped: ${ref.path}`); continue; }
    out!.push({ kind: ref.kind, src: url, path: ref.path, w: size.w ?? null, h: size.h ?? null });
  }

  project.images = out;
  warnings.push(...notes.map((n) => `${repo.owner.login}/${repo.name}: ${n}`));
}

/* --------------------------------- curated plate collision check -- */
function normaliseRepo(u: string): string {
  const m = String(u || '').match(/github\.com\/([^/]+)\/([^/]+)/i);
  return m ? `${m[1]}/${m[2]}`.toLowerCase() : '';
}

const curated = new Set(CURATED.map((p) => normaliseRepo(p.source || '')).filter(Boolean));

/* ---------------------------------------------------------- fixtures -- */
function fixtureRepos(dir: string): { repo: Repo; file: { text: string } }[] {
  const base = path.resolve(ROOT, dir);
  const out: { repo: Repo; file: { text: string } }[] = [];
  for (const name of fs.readdirSync(base)) {
    const file = path.join(base, name, 'PORTFOLIO.md');
    if (!fs.existsSync(file)) continue;
    out.push({
      repo: {
        name,
        owner: { login: 'fixture' },
        html_url: `https://github.com/fixture/${name}`,
        default_branch: 'main',
        fork: false,
        pushed_at: new Date().toISOString(),
        description: ''
      },
      file: { text: fs.readFileSync(file, 'utf8') }
    });
  }
  return out;
}

/* ------------------------------------------------------------- main -- */
async function main(): Promise<void> {
  if (!CONFIG.user && !has('--fixtures')) {
    console.error('sync: no GitHub account configured. Set githubUser in portfolio.config.json or GITHUB_USER.');
    process.exit(1);
  }

  const skipped: { repo: string; reason: string }[] = [];
  const warnings: string[] = [];
  const projects: FeedProject[] = [];
  let total = 0;

  const list: Repo[] | ReturnType<typeof fixtureRepos> = has('--fixtures')
    ? fixtureRepos(opt('--fixtures') || 'tests/fixtures-repos')
    : await listRepos(CONFIG.user);

  total = list.length;

  for (const entry of list) {
    /* fixtures arrive wrapped ({ repo, file }); live results are the repo itself */
    const repo: Repo = 'owner' in entry ? entry : entry.repo;
    const preloaded: { text: string } | undefined = 'owner' in entry ? undefined : entry.file;
    const label = `${repo.owner.login}/${repo.name}`;

    if (!has('--fixtures')) {
      if (repo.fork && !CONFIG.includeForks) { skipped.push({ repo: label, reason: 'fork' }); continue; }
      if (CONFIG.exclude.includes(repo.name)) { skipped.push({ repo: label, reason: 'excluded in portfolio.config.json' }); continue; }
      if (curated.has(normaliseRepo(repo.html_url))) {
        skipped.push({ repo: label, reason: 'already curated on the work plate — remove it from lib/curated.ts to drive it from PORTFOLIO.md' });
        continue;
      }
    }

    let file = preloaded;
    if (!file) {
      try {
        const found = await readPortfolioFile(repo);
        if (!found) { skipped.push({ repo: label, reason: 'no PORTFOLIO.md in the repository root' }); continue; }
        file = found;
      } catch (e) {
        if (e instanceof RateLimited) throw e;
        skipped.push({ repo: label, reason: `repository unavailable: ${(e as Error).message}` });
        continue;
      }
    }

    if (!file.text) { skipped.push({ repo: label, reason: 'PORTFOLIO.md is empty' }); continue; }
    if (file.text.length > 120000) { skipped.push({ repo: label, reason: 'PORTFOLIO.md is larger than 120 KB' }); continue; }

    const result = parse(file.text, {
      repo: repo.html_url,
      pushedAt: (repo.pushed_at || '').slice(0, 10),
      path: `${label}:PORTFOLIO.md`
    });
    if (!result.ok || !result.project) { skipped.push({ repo: label, reason: result.errors.join('; ') }); continue; }

    const project = result.project;
    project.repoUrl = repo.html_url;
    project.repoName = repo.name;
    project.branch = repo.default_branch;
    project.publishedFrom = label;
    /* images are read from the default branch tip: the same branch PORTFOLIO.md
       was found on, so a project never shows an image from a different state */
    await resolveImages(project, repo, warnings, result.assets);
    project.warnings = result.warnings.slice();

    if (projects.some((x) => x.slug === project.slug)) {
      project.slug = `${project.slug}-${projects.length + 1}`;
      warnings.push(`${label}: slug collision, page address is ${project.slug}`);
    }
    projects.push(project);
    if (projects.length >= CONFIG.maxProjects) {
      skipped.push({ repo: '(rest)', reason: `maxProjects ${CONFIG.maxProjects} reached in portfolio.config.json` });
      break;
    }
  }

  projects.sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));

  const feed: Feed = {
    meta: {
      generatedAt: new Date().toISOString(),
      user: CONFIG.user,
      accountRepos: total,
      eligible: projects.length,
      skipped,
      warnings,
      partial: has('--fixtures') ? 'fixtures' : false,
      apiCallsRemaining: apiRemaining
    },
    projects
  };

  if (has('--dry-run')) {
    console.log(JSON.stringify(feed.meta, null, 2));
    projects.forEach((p) => console.log(`  ${p.slug}  ${p.name}  [${p.status}]  images:${p.images?.length ?? 0}`));
    console.log('dry run: nothing written');
    return;
  }

  const outPath = path.isAbsolute(CONFIG.feed) ? CONFIG.feed : path.join(ROOT, CONFIG.feed);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(feed, null, 2)}\n`);

  console.log(`sync: ${projects.length} project(s) published from ${total} repositories, ${skipped.length} skipped.`);
  skipped.forEach((s) => console.log(`  skipped  ${s.repo} — ${s.reason}`));
  warnings.forEach((w) => console.log(`  warning  ${w}`));
  console.log(`wrote ${CONFIG.feed}`);
}

main().catch((err: Error) => {
  if (err instanceof RateLimited) {
    console.error(`sync: GitHub rate limit hit (${err.message}).`);
    console.error(`The previous ${CONFIG.feed} was left untouched. Set GITHUB_TOKEN to raise the limit.`);
  } else {
    console.error(`sync failed: ${err.message}`);
  }
  process.exit(1);
});
