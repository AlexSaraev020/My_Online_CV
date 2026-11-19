---
name: Signal Field — Issue 01
subtitle: An online CV laid out as a magazine issue, with a field that re-forms as you scroll
description: The interactive portfolio and online CV of Alexandru Saraev: seven art-directed plates, one procedural 3D field, case studies as real pages, and a project list that fills itself from PORTFOLIO.md files in GitHub repositories.
category: Web platform
stack:
  - Next.js
  - React
  - TypeScript
  - Three.js
  - Zod
  - CSS custom properties
  - GitHub Actions
status: live
year: 2026
role: Solo — art direction, interface, 3D layer, data pipeline, static build
cover: docs/portfolio/cover.jpg
gallery:
  - docs/portfolio/work-plate.jpg
  - docs/portfolio/case-study.jpg
live: https://alexsaraev020.github.io/My_Online_CV/
tags:
  - portfolio
  - 3d
  - static
updated: 2026-11-19
---

## Overview
A CV that reads as an issue of a magazine rather than as a form: a cover, seven plates, and a
procedural field of bars, dust and a sculptural band that responds to how far you have read. It is
a static export — `next build` writes `out/` and any static host serves it.

## Problem
Most online CVs are a list of jobs beside a list of technologies. The interesting question — what
kind of builder am I — is answered by how the page is made, not by the bullet points on it. And a
project list that has to be edited by hand goes stale the week after it is written.

## Solution
Content and presentation are separated in three places. `lib/site.ts` holds the copy, roles, skills
and contact details. `lib/curated.ts` holds the hand-written case studies. And any repository that
carries a `PORTFOLIO.md` in its root is picked up by `tools/sync.ts`, validated against the schema in
`lib/portfolio.ts`, measured for its real image sizes and merged into `content/projects.json` — one
`Case` model, so the same renderer designs a curated plate entry and a GitHub-driven one. No
component edits are needed to publish a project.

## Key features
- Seven plates: cover, approach, capabilities, work, process, CV, contact
- A WebGL field built from instanced bars, signal dust and a sculptural band, driven by scroll
  progress rather than by a fixed timeline
- Case studies as prerendered pages, each with its own title and description
- A GitHub Actions workflow that regenerates the project feed every six hours and proves the site
  still builds from it
- A documented `PORTFOLIO.md` schema — Zod-validated, with the parser under test
- Reduced-motion and no-JavaScript paths that show the same content

## Architecture
Next.js App Router with `output: 'export'`, so there is no server, no API routes and no database —
which is also why no GitHub credential can reach the browser. Three.js comes in through
@react-three/fiber; `lib/field/state.ts` is the only meeting point between the DOM layer and WebGL.
Plain CSS with tokens for palette, type scale, spacing and motion; no UI library.

## Challenges
Scroll choreography over a WebGL canvas: the reveals, the folio rail and the field all needed one
source of scroll truth, and passing numbers through React state re-rendered the page on every frame.
The `PORTFOLIO.md` gate is deliberately narrow — the file's presence in a repository root is the
only thing that decides whether a project appears — because every wider rule turned into metadata
that had to be maintained by hand.

## Results
Served as a static site from GitHub Pages, with the project feed regenerated on a schedule and the
schema itself under test.

## Future
The feed currently reads one GitHub account. A second source — local projects with no repository —
is not planned until there is a reason for it.
