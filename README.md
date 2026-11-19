# Signal Field, Issue 01 — the React build

The interactive portfolio and online CV of Alexandru Saraev: seven art-directed plates, one
procedural 3D field that re-forms as you scroll, case studies as real pages, and a Projects plate
that fills itself from `PORTFOLIO.md` files in your GitHub repositories.

Next.js 16 (App Router) · React 19 · TypeScript · plain CSS (no Tailwind, no component library) ·
Three.js through @react-three/fiber · Zod for the project schema · static export, no backend.

## Run it

```bash
npm install          # once
npm run dev          # http://localhost:3000 — edit and watch
npm test             # the PORTFOLIO.md schema and parser tests
npm run sync         # rebuild content/projects.json from GitHub
npm run build        # static site in out/
npm run serve        # serve out/ locally at http://localhost:3000
```

`npm run build` writes `out/`, which any static host can serve as-is. No server, no API routes, no
database — which is also why no GitHub credential can ever reach the browser.

## What is where

| | |
|---|---|
| `app/layout.tsx` | the shell: fonts, metadata, JSON-LD, trim frame, folio rail, 3D layer, opening sequence |
| `app/page.tsx` | the seven plates |
| `app/work/[slug]/page.tsx` | a case-study page per project, prerendered by `generateStaticParams`, each with its own title and description |
| `app/not-found.tsx` | the page for an address that no longer has a project behind it |
| `components/plates/` | Cover, Approach, Capabilities, Work, Process, Cv, Contact |
| `components/Experience.tsx` | the scroll choreography: reveals, intro sequence, folio rail, cursor, smooth scroll, parallax, and the numbers handed to the field |
| `components/FieldCanvas.tsx` | the 3D scene — instanced bars, signal dust, the sculptural band |
| `lib/field/shaders.ts` | the GLSL, unchanged from the original build |
| `lib/field/state.ts` | the single meeting point between the DOM layer and WebGL |
| `lib/site.ts` | name, contact, capabilities, process, CV, skills, principles — the content you edit |
| `lib/curated.ts` | the six hand-authored case studies on Plate 04 |
| `lib/portfolio.ts` | **the** `PORTFOLIO.md` schema and validator (Zod), imported by both the site and the synchroniser |
| `lib/feed.ts` | maps curated plates and GitHub projects into one `Case` model, so one renderer designs both |
| `content/projects.json` | generated feed. Do not edit it by hand — regenerate it |
| `tools/sync.ts` | discovery → `PORTFOLIO.md` gate → validation → measured images → feed |
| `app/styles/` | `tokens.css` (palette, type scale, spacing, motion), `site.css` (the design), `app.css` (the few rules a routed app adds) |

## Editing content

Copy, roles, skills and links: `lib/site.ts`. Case studies without a repository: `lib/curated.ts` —
`problem` / `approach` / `outcome` become the three narrative blocks, `preview` picks a code-drawn
diagram from `components/Previews.tsx`, `shot` is a real screenshot with the pixel size it actually
has. Colours, type sizes, spacing rhythm and motion durations: `app/styles/tokens.css` — one edit
re-skins the site.

## Projects from GitHub

A public repository appears on Plate 04 when — and only when — its root contains `PORTFOLIO.md`. No
topics, no tags, no editing components. The format is in `PORTFOLIO_SCHEMA.md`; the fields are
enforced by `lib/portfolio.ts`.

1. Copy `examples/PORTFOLIO.wevibe.md` into a repository as `PORTFOLIO.md`.
2. If that build is one of the six curated plates, delete its entry from `lib/curated.ts` — until you
   do, the synchroniser reports it as "already curated on the work plate" and skips it, so the plate
   never doubles up.
3. `npm run sync` locally, or let `.github/workflows/portfolio-sync.yml` do it.

Each published project gets a card and a page at `/work/<slug>`, with its Markdown rendered as typed
blocks — paragraph, list, subhead, code — never as HTML. Tags, links and emphasis are stripped by the
parser, so a repository cannot inject markup.

**Synchronisation and delay.** The workflow runs every 6 hours, on any push to the pipeline files, and
on a manual *Run workflow*. Unchanged files answer `304` through a cached ETag and cost nothing. A new
`PORTFOLIO.md` appears at the next sync, or immediately if you run the workflow. Deleting the file, the
repository, or making it private removes the project at the next build — nothing is left behind as a
stub. If GitHub is unreachable or rate-limited, the synchroniser writes nothing and the previous feed
stays in place: a failed sync cannot empty the site. `GITHUB_TOKEN` (the Actions token is enough)
raises the limit from 60 to 5000 requests an hour and is read from the environment only.

**Zero projects is a state.** Right now no repository of yours publishes the file, so Plate 04 shows
the six curated builds plus an explicit statement of what is missing, the sync date and the count of
repositories checked. Nothing is invented and nothing is hardcoded as a demo.

## Deploying

**Vercel** — import the repository; `next build` is detected and nothing else is needed.

**GitHub Pages / any static host** — publish the contents of `out/`. If the site is served from a
subpath such as `https://<user>.github.io/<repo>/`, add `basePath: '/<repo>'` to `next.config.ts` so
the asset and page URLs match; internal links are written root-relative precisely so this stays a
one-line change.

## Deliberate choices

- **Static export, so no backend exists to leak a token from.** All GitHub reads happen at build time
  in `tools/sync.ts`.
- **Plain CSS instead of Tailwind or a component library.** The design system already exists in
  `tokens.css` and `site.css`; re-expressing it in another system would only move the same decisions
  around.
- **The scroll choreography is one effect over server-rendered plates**, not React state per frame:
  the values that change 60 times a second must not re-render a tree. Plate content itself is
  server-rendered HTML, so it is complete before any script runs.
- **Case studies are pages, not dialogs.** Real addresses, real metadata, shareable, and the back
  button behaves.
- **`next/image` is off** (`images: { unoptimized: true }`): the images are local, already measured,
  and a static export cannot run the optimiser anyway.

## Already handled

Responsive at 375 / 768 / 1024 / 1440 · `prefers-reduced-motion` drops the field to one still frame
and switches the intro, the rail, the scramble and the scrub off · keyboard paths for the capability
tabs, the plate menu and case navigation · text contrast against both the ink and paper grounds ·
every image a local file with its measured size, no hotlinks, no stock photography · no-JS content
stays visible.

`node tools/sync.ts --dry-run` prints what would be published and every skip with its reason.
`npm test` runs 12 checks over valid, minimal, malformed and hostile `PORTFOLIO.md` fixtures, plus an
offline end-to-end sync.
