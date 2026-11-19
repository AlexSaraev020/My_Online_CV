---
name: WeVibe
subtitle: A landscape-photo feed where the threads and the sessions actually hold
description: A social platform for landscape photography built end to end — feed, likes, two-level threaded replies, profiles, JWT sessions and an off-database image pipeline.
category: Web platform
stack:
  - Next.js
  - TypeScript
  - MongoDB
  - Mongoose
  - Tailwind CSS
  - JWT
status: live
year: 2024 — 2025
role: Solo — data model, auth, interface, deployment
cover: public/icons/WeVibe.png
live: https://we-vibe.vercel.app
tags:
  - social
  - auth
updated: 2025-02-06
---

## Overview
A feed for landscape photography with the parts a feed needs to be more than a list: accounts that
survive a reload, comments that nest, and uploads that stay out of the database row.

## Problem
The versions I kept finding stopped at the feed. The interesting work — a reply that belongs to a
comment, a session that lasts, an image stored somewhere other than the record — was the part nobody
showed done properly.

## Solution
Posts, comments and replies are separate Mongoose collections, so one thread renders from a single
query rather than a chain of them. Sessions are JWTs signed with `jose`; passwords are hashed with
bcrypt; the verification mail goes through Nodemailer. Images are uploaded to ImageKit and the
document stores only the reference.

## Key features
- Posts with caption, location and image
- Likes and two-level threaded comments
- Profile creation and editing
- Email verification on sign-up

## Architecture
Next.js app router deployed on Vercel. Reads go through server components into Mongoose; mutations
run as server actions. The catalogue-style pages use time-based revalidation so repeat visits do not
touch the database.

## Challenges
The first thread model needed one query per comment and fell over on long threads. Moving replies
into their own collection with a parent reference turned a thread into a single query.

## Results
Live at we-vibe.vercel.app, built and maintained by one person across the data model, the auth, the
upload pipeline and the interface.

## Future
Two levels of reply is a deliberate limit. Deeper nesting is not planned until there is a reason.
