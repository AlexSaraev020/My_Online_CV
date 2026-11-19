# PORTFOLIO.md — the schema

This file defines the one format the portfolio understands.

A repository is on the site if, and only if, a file named exactly **`PORTFOLIO.md`** sits in its
root directory on its default branch. No topics, no README parsing, no tags, no flags. Add the
file and the next synchronisation publishes the project; delete the file and the next
synchronisation removes it.

Everything else in the repository is irrelevant to the portfolio. The site never reads `README.md`.

---

## 1. Shape of the file

```
---
<YAML frontmatter: structured metadata>
---

## Overview
<markdown>

## Problem
<markdown>
```

- Frontmatter is required. A file without a `---` pair at the very top is rejected.
- Body sections are optional. A project can be fully described by frontmatter alone.
- Unknown frontmatter keys are reported as warnings, not errors — they are ignored by the site.
- Unknown `##` headings become extra case-study blocks in the order they appear.

### Allowed Markdown

Paragraphs, `##`/`###` headings inside a section, `-` bullet lists, numbered lists, \`inline code\`,
fenced code blocks, links `[text](https://…)` and emphasis.

**HTML is not rendered.** Any tag found in the file is stripped before display, so a `<script>` or
an `<img>` written into Markdown has no effect. Never write raw HTML here.

---

## 2. Frontmatter fields

### Required

| Field | Type | Rule |
|---|---|---|
| `name` | string | 2–80 characters. The title shown on the plate. |
| `description` | string | 20–280 characters. One or two sentences; used on the card and in search results. |
| `category` | string | 2–40 characters. What kind of work it is: `Web platform`, `Support tooling`, `Automation`, `Experiment`, `Library`… |
| `stack` | list | 1–14 items, each ≤ 40 characters. Languages, frameworks and services only. |
| `status` | enum | one of `live`, `active`, `completed`, `archived`, `concept`. |

### Optional

| Field | Type | Rule |
|---|---|---|
| `subtitle` | string | ≤ 120 characters. A line under the title. |
| `year` | string | `2024`, `2024 — 2025`, or `2024 — present`. |
| `cover` | path | One image. Repository-relative (`docs/cover.png`) or an absolute `https://raw.githubusercontent.com/…` URL. |
| `gallery` | list | Up to 8 further images, same path rules as `cover`. |
| `live` | URL | `https://` address of a running deployment. Omit it if there is none — the site will not invent one. |
| `repo` | URL | Defaults to the repository the file was read from. Only set it to point elsewhere. |
| `role` | string | ≤ 120 characters. What you personally did on it. |
| `tags` | list | Up to 8 short labels, ≤ 30 characters each. |
| `updated` | date | `YYYY-MM-DD`. Defaults to the repository's last push. |

A three-field project is legal: `name`, `description`, `category`, `stack`, `status`. Small tools
should not be forced to write an architecture essay.

---

## 3. Body sections

All optional. Every one that exists is rendered as its own block on the project page, in this order.

| Heading | Use it for |
|---|---|
| `## Overview` | What the thing is, for a reader who sees only this. |
| `## Problem` | The situation that made the work necessary. |
| `## Solution` | What you built and the decisions behind it. |
| `## Key features` | A bullet list, one capability per bullet. |
| `## Architecture` | Data model, boundaries, hosting, integration points. |
| `## Challenges` | What was hard, what broke, what you would not do again. |
| `## Results` | What changed after it shipped. Numbers only if the repository states them. |
| `## Future` | What is planned, and what is deliberately not planned. |

Section bodies are capped at 4,000 characters each; longer sections are truncated at a paragraph
boundary and reported during synchronisation.

Rules that keep the portfolio honest:

- Do not state a metric the repository cannot support. Numbers quoted from your own CV are fine;
  invented ones are not.
- Do not claim users, clients or downloads that the repository does not record.
- `live` must be a deployment you maintain. Dead links are worse than no link.

---

## 4. Images

- Put images **in the repository** (`docs/`, `assets/`, `public/images/`) and reference them by
  repository-relative path.
- The synchroniser resolves each path against the repository's default branch at the exact commit
  it read, downloads it, measures its real pixel size and records that size in the feed, so the
  site never stretches a screenshot into a wrong ratio.
- Accepted formats: PNG, JPEG, WebP, GIF, SVG. Keep each under 1 MB; a screenshot gallery should
  stay under 5 MB total.
- `data:` URIs, `javascript:` URLs and hosts other than `raw.githubusercontent.com` are rejected.
- A missing or unreadable image drops that image and keeps the project, with a warning in the
  synchronisation report.

---

## 5. Copy-paste example (full project)

```markdown
---
name: WeVibe
subtitle: A landscape-photo feed with real threaded conversations
description: A social platform for landscape photography where posts, likes and nested replies persist behind a typed data model and a JWT session.
category: Web platform
stack:
  - Next.js
  - TypeScript
  - MongoDB
  - Mongoose
  - Tailwind CSS
status: live
year: 2024 — 2025
role: Solo — data model, auth, interface, deployment
cover: docs/wevibe-cover.png
gallery:
  - docs/wevibe-feed.png
  - docs/wevibe-thread.png
live: https://we-vibe.vercel.app
tags:
  - social
  - auth
  - images
updated: 2025-02-06
---

## Overview
WeVibe is a feed of landscape photography with the parts a feed actually needs: an account that
survives a reload, comments that nest, and uploads that do not bloat the records.

## Problem
Every version I tried stopped at the feed. The interesting problems — a reply that belongs to a
comment, a session that lasts, an image stored somewhere other than the database row — were the
ones nobody showed me doing properly.

## Solution
Posts, comments and replies are separate Mongoose collections, so one thread renders from a single
query instead of a chain of them. Sessions are JWTs signed with `jose`, passwords hashed with
bcrypt, and the verification mail goes through Nodemailer. Images are uploaded to ImageKit and the
document stores only the reference.

## Key features
- Posts with caption, location and image
- Likes and two-level threaded comments
- Profile creation and editing
- Email verification on sign-up

## Architecture
Next.js app router on Vercel. Server components read through Mongoose; mutations run through
server actions. `next: { revalidate }` keeps the public feed off the database on repeat visits.

## Challenges
Modelling replies so a thread renders in one query was the hard part; the first version needed N+1
lookups and fell over on long threads.

## Results
Live and in use for a photography group. The thread query went from one request per comment to one
per post.

## Future
Replies are capped at two levels on purpose. Deeper nesting is not planned until someone asks.
```

## 6. Copy-paste example (small project)

```markdown
---
name: Ticket Sync
description: A Make.com scenario that opens a Zendesk ticket when an order changes state in Baselinker, with a written rule set instead of manual copying.
category: Automation
stack:
  - Make.com
  - Zendesk
  - Baselinker
status: live
year: 2026
cover: docs/ticket-sync.png
---

## Problem
Every order that needed support was re-entered by hand into the ticketing system.

## Solution
One scenario per order state, each triggered by a webhook, each writing the fields the support
team needs. The rules live in the scenario, not in someone's memory.
```

---

## 7. What happens to a bad file

The synchroniser reports the file and the reason and moves on:

| Condition | Result |
|---|---|
| No `PORTFOLIO.md` in the root | Repository is not considered. |
| Frontmatter missing or unterminated | Skipped: `frontmatter missing`. |
| A required field absent or empty | Skipped: `missing required field: name`. |
| `status` outside the enum | Skipped: `status "shipped" is not one of live, active, completed, archived, concept`. |
| `live` not an `https://` URL | Skipped: `live must be an https URL`. |
| Image path unreadable | Project published, that image dropped, warning recorded. |
| Section longer than 4,000 characters | Published, truncated at a paragraph, warning recorded. |
| Two repositories with the same `name` | Both published; the second gets `-2` on its URL slug and a warning. |

The full report is written into `js/projects.generated.js` under `meta.skipped`, so a failed
repository is visible without digging through logs.
