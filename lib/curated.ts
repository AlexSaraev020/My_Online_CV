/* ==========================================================================
   Hand-authored plates on Plate 04.

   Empty on purpose: every build on the plate now publishes its own
   PORTFOLIO.md and arrives through tools/sync.ts, so nothing here is typed by
   hand. The types stay because lib/feed.ts maps both kinds into one Case
   model, and an entry here is still how a build without a repository gets on.
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

export const CURATED: CuratedProject[] = [];
