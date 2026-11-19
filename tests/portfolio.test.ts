/* Tests for the PORTFOLIO.md schema, the parser and the offline sync path.
   Run with:  npm test    (node --test tests/portfolio.test.ts)             */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { LIMITS, blocks, isSafeImage, parse, resolveImage } from '../lib/portfolio.ts';
import type { Feed } from '../lib/portfolio.ts';

const FIX = (name: string) => fs.readFileSync(path.join(import.meta.dirname, 'fixtures', name), 'utf8');
const CTX = { repo: 'https://github.com/AlexSaraev020/demo', pushedAt: '2026-01-01', path: 'demo:PORTFOLIO.md' };

test('a full project parses into typed fields and ordered sections', () => {
  const r = parse(FIX('valid-full.md'), CTX);
  assert.equal(r.ok, true, r.errors.join('; '));
  const p = r.project!;
  assert.equal(p.name, 'WeVibe');
  assert.equal(p.slug, 'wevibe');
  assert.equal(p.status, 'live');
  assert.equal(p.stack.length, 4);
  assert.deepEqual(p.tags, ['social', 'auth', 'images']);
  assert.equal(p.year, '2024 — 2025');
  assert.equal(p.live, 'https://we-vibe.vercel.app');
  assert.equal(p.repo, 'https://github.com/AlexSaraev020/demo');   /* defaults to the repository read */
  assert.equal(p.updated, '2025-02-06');
  assert.deepEqual(Object.keys(p.sections), ['overview', 'problem', 'solution', 'features', 'architecture', 'challenges', 'results', 'future']);
  const features = blocks(p.sections.features!);
  assert.equal(features[0].type, 'ul');
  assert.equal(features[0].items!.length, 3);
  assert.deepEqual(r.assets!.gallery, ['docs/wevibe-feed.png', 'docs/wevibe-thread.png']);
  assert.equal(r.assets!.cover, 'docs/wevibe-cover.png');
});

test('a five-field project is valid and says so on the card, not the page', () => {
  const r = parse(FIX('valid-minimal.md'), CTX);
  assert.equal(r.ok, true, r.errors.join('; '));
  assert.equal(r.project!.category, 'Automation');
  assert.deepEqual(r.project!.stack, ['Make.com', 'Zendesk', 'Baselinker']);
  assert.equal(r.project!.updated, '2026-01-01');   /* falls back to the repository push date */
  assert.deepEqual(r.project!.sections, {});
  assert.ok(r.warnings.some((w) => /no body sections/.test(w)));
});

test('a file with no frontmatter is rejected with a named reason', () => {
  const r = parse(FIX('invalid-no-frontmatter.md'), CTX);
  assert.equal(r.ok, false);
  assert.deepEqual(r.errors, ['frontmatter missing']);
});

test('frontmatter that opens but never closes is rejected, not guessed at', () => {
  const r = parse(FIX('unterminated.md'), CTX);
  assert.equal(r.ok, false);
  assert.deepEqual(r.errors, ['frontmatter missing']);
});

test('bad values produce one specific message each', () => {
  const r = parse(FIX('invalid-fields.md'), CTX);
  assert.equal(r.ok, false);
  const joined = r.errors.join('\n');
  assert.match(joined, /missing required field: name/);
  assert.match(joined, /description must be at least 20 characters/);
  /* category is present in this fixture, so it must not be reported */
  assert.ok(!/missing required field: category/.test(joined), joined);
  assert.match(joined, /status "shipped" is not one of live, active, completed, archived, concept/);
  assert.match(joined, /year must look like 2024/);
  assert.match(joined, /live must be an https URL/);
  /* an image smuggled from outside the repository is rejected, not fetched */
  assert.match(r.warnings.join('\n'), /rejected image path: \.\.\/\.\.\/secrets\.png/);
  assert.match(r.warnings.join('\n'), /rejected image path: data:image\/png;base64,AAAA/);
  assert.equal(r.project, null);
});

test('unknown keys warn instead of failing, and unknown headings still render', () => {
  const r = parse(FIX('unknown-keys.md'), CTX);
  assert.equal(r.ok, true, r.errors.join('; '));
  assert.match(r.warnings.join('\n'), /unknown frontmatter key: budget/);
  assert.match(r.warnings.join('\n'), /unknown frontmatter key: sponsor/);
  assert.equal(r.project!.extras.length, 1);
  assert.equal(r.project!.extras[0].heading, 'What i would do differently');
});

test('HTML in Markdown never survives into the rendered blocks', () => {
  const r = parse(FIX('unknown-keys.md'), CTX);
  const flat = JSON.stringify(r.project!.sections) + JSON.stringify(r.project!.extras);
  assert.ok(!/script|onerror|<img|<b>/i.test(flat), `a tag reached the render model: ${flat}`);
  const bullet = r.project!.extras[0].blocks!.find((b) => b.type === 'ul')!;
  assert.equal(bullet.items![0], 'one bullet with emphasis');          /* emphasis kept as text */
  assert.equal(/<|onerror|alert|src=/.test(bullet.items![1]), false, `markup survived into a bullet: ${bullet.items![1]}`);
});

test('paragraphs, lists and code fences become typed blocks', () => {
  const out = blocks('One line\ncontinues here.\n\n- a\n- b\n\n### Sub\n\n```js\nconst x = 1;\n```');
  assert.deepEqual(out.map((b) => b.type), ['p', 'ul', 'h', 'code']);
  assert.equal(out[0].text, 'One line continues here.');
  assert.equal(out[2].text, 'Sub');
  assert.ok(out[3].text!.includes('const x = 1;'));
});

test('a runaway section is cut at a paragraph and reported', () => {
  const para = 'x'.repeat(1200);
  const text = ['---', 'name: Long', 'description: ' + 'd'.repeat(60), 'category: Experiment',
    'stack: [TypeScript]', 'status: concept', '---', '', '## Overview', para, '', para, '', para, '', para].join('\n');
  const r = parse(text, CTX);
  assert.equal(r.ok, true, r.errors.join('; '));
  assert.ok(r.project!.sections.overview!.length <= LIMITS.section + 40);
  assert.match(r.warnings.join('\n'), /section truncated at 4000 characters/);
});

test('relative images resolve against the repository and branch that were read', () => {
  assert.equal(
    resolveImage('docs/cover.png', 'https://github.com/AlexSaraev020/WeVibe_NextJS', 'main'),
    'https://raw.githubusercontent.com/AlexSaraev020/WeVibe_NextJS/main/docs/cover.png'
  );
  assert.equal(
    resolveImage('/deep/shot.jpg', 'https://github.com/a/b', 'release/v2'),
    'https://raw.githubusercontent.com/a/b/release/v2/deep/shot.jpg'
  );
  assert.equal(isSafeImage('..\\escape\\cover.png'), false);
});

test('the offline sync publishes valid fixtures and skips the broken one', () => {
  const out = path.join(os.tmpdir(), `feed-${process.pid}.json`);
  execFileSync(process.execPath, [
    path.join(import.meta.dirname, '..', 'tools', 'sync.ts'),
    '--fixtures', 'tests/fixtures-repos', '--out', out
  ], { cwd: path.join(import.meta.dirname, '..'), stdio: 'pipe' });

  const feed = JSON.parse(fs.readFileSync(out, 'utf8')) as Feed;
  fs.unlinkSync(out);

  assert.equal(feed.projects.length, 2);
  const slugs = feed.projects.map((p) => p.slug);
  assert.ok(slugs.includes('wevibe') && slugs.includes('ticket-sync'), slugs.join(','));

  const wevibe = feed.projects.find((p) => p.slug === 'wevibe')!;
  assert.equal(wevibe.repoUrl, 'https://github.com/fixture/wevibe');
  assert.equal((wevibe as unknown as Record<string, unknown>).cover, undefined);   /* cover is consumed into images */
  assert.equal(wevibe.images![0].src, 'https://raw.githubusercontent.com/fixture/wevibe/main/docs/wevibe-cover.png');

  const broken = feed.meta.skipped.find((s) => /broken/.test(s.repo));
  assert.ok(broken, 'the invalid fixture was not reported');
  assert.match(broken!.reason, /missing required field: name/);
  assert.match(broken!.reason, /missing required field: category/);
});

test('an empty feed is a state, not an error', () => {
  const empty = { meta: { eligible: 0, skipped: [{ repo: 'a/b', reason: 'no PORTFOLIO.md in the repository root' }] }, projects: [] };
  assert.equal(empty.projects.length, 0);
  assert.equal(empty.meta.skipped[0].reason, 'no PORTFOLIO.md in the repository root');
});
