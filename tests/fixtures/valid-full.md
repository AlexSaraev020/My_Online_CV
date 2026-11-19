---
name: WeVibe
subtitle: A landscape-photo feed with real threaded conversations
description: A social platform for landscape photography where posts, likes and nested replies persist behind a typed data model and a JWT session.
category: Web platform
stack:
  - Next.js
  - TypeScript
  - MongoDB
  - Tailwind CSS
status: live
year: 2024 — 2025
role: Solo — data model, auth, interface, deployment
cover: docs/wevibe-cover.png
gallery:
  - docs/wevibe-feed.png
  - docs/wevibe-thread.png
live: https://we-vibe.vercel.app
tags: [social, auth, images]
updated: 2025-02-06
---

## Overview
WeVibe is a feed of landscape photography with the parts a feed actually needs.

## Problem
Every version I tried stopped at the feed.

## Solution
Posts, comments and replies are separate collections, so one thread renders from a single query.

## Key features
- Posts with caption and location
- Likes and two-level threaded comments
- Email verification on sign-up

## Architecture
Next.js app router on Vercel; server actions for mutations.

## Challenges
The first thread model needed one query per comment.

## Results
Live and in use by a photography group.

## Future
Replies stay at two levels on purpose.
