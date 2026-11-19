---
name: WeVibe
subtitle: A landscape-photo feed with real threaded conversations
description: A social platform for landscape photography where posts, likes and nested replies persist behind a typed data model and a JWT session.
category: Web platform
stack: [Next.js, TypeScript, MongoDB, Mongoose, Tailwind CSS]
status: live
year: 2024 — 2025
role: Solo — data model, auth, interface, deployment
cover: docs/wevibe-cover.png
gallery: [docs/wevibe-feed.png]
live: https://we-vibe.vercel.app
updated: 2025-02-06
---

## Problem
Every version I tried stopped at the feed. The interesting part — a reply that belongs to a
comment, an account that survives a reload — is where the work is.

## Solution
Posts, comments and replies are separate Mongoose collections, so a thread renders from one query.
Sessions are JWTs signed with `jose`, passwords hashed with bcrypt.

## Key features
- Posts with caption and image
- Two-level threaded comments
- Email verification on sign-up

## Results
Live and in use for a photography group.
