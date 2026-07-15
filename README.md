# The reading log

A personal, public reading tracker. Every book gets a page with its details, a
synopsis, a summary of each chapter in my own words, and a note on how I feel
about it.

No accounts, no database, no server. Every book is a Markdown file, and the site
builds down to static HTML/CSS/JS — there is no login to break into and nothing
to inject into, because there is nothing running.

## Running it

```
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
npm run preview  # serve the built site locally
```

## Adding a book

Create `src/content/books/<slug>.md`. The filename becomes the URL, so
`horus-rising.md` is served at `/book/horus-rising`.

```markdown
---
title: Horus rising
subtitle: The seeds of heresy are sown
author: Dan Abnett
year: 2006
pages: 414
series: The Horus Heresy #1
cover: /covers/horus-rising.jpg
status: reading
totalChapters: 21
rating: 4
tags: warhammer, sci-fi
source: https://www.blacklibrary.com/
---

# Synopsis

Copied from the publisher's page, with `source:` above pointing at where it came from.

# Chapters

## 1 · The emperor's due

pages: 11-32
read: 2026-07-02

What happened, in my own words.

# Feelings

What I make of it so far.
```

Only `title` and `author` really matter — everything else is optional, and the
page adapts to whatever is missing.

| Field | Notes |
| --- | --- |
| `status` | `reading`, `finished`, or `paused`. Drives the shelf filters. |
| `totalChapters` | Drives the progress bar. |
| `rating` | 1–5, shown as stars next to the feelings note. |
| `tags` | Comma separated. Searchable. |
| `cover` | Path under `public/`. Falls back to a title card if missing. |

Progress is computed from how many chapters you have summarized against
`totalChapters`, so there is no progress number to keep in sync by hand.

### Chapters

Each chapter is a `##` block under `# Chapters`. The number before the `·` sets
the order — the list is sorted by it, not by position in the file, so you can
append new chapters at the bottom and they still sort correctly. `pages:` and
`read:` are optional. Summaries support normal Markdown (`**bold**`, `*italic*`,
paragraphs).

The newest chapter is expanded by default and the rest are collapsed, so picking
a book back up shows you where you left off without scrolling.

### Covers

Put images in `public/covers/`, sized around 400px wide. Save the file rather
than hotlinking Amazon — their image URLs rotate and they vary responses by
referrer, so hotlinked covers tend to break silently later. If a cover is
missing or fails to load, the site shows a title card instead.

## Deploying to AWS Amplify

1. Push this folder to a GitHub repository.
2. In the Amplify console: **Create new app → Deploy from GitHub**, and pick the repo.
3. Amplify reads `amplify.yml` in this folder, so the build settings are already
   correct — it runs `npm ci && npm run build` and publishes `dist/`.
4. **Add the SPA rewrite rule.** Under **Hosting → Rewrites and redirects**, add:

   | Source | Target | Type |
   | --- | --- | --- |
   | `/<*>` | `/index.html` | `200 (Rewrite)` |

   Without this, the shelf works but loading `/book/horus-rising` directly (or
   refreshing on it) returns 404 — the router lives in the browser, so every path
   has to be served `index.html`. Amplify often adds this automatically; check
   that it is there.

Every `git push` to the connected branch rebuilds and redeploys.

### On cost

Amplify's free tier lasts **12 months**, not forever. After that, build minutes
and hosting are pay-as-you-go — pennies for a site this size, but not zero.

Because the build output is plain static files, nothing here is tied to Amplify.
If you ever want off it, the same `dist/` folder drops onto GitHub Pages,
Netlify, or Cloudflare Pages unchanged. Only the rewrite rule above needs
re-creating in the new host's own settings.

## Layout

```
src/
  content/books/    one Markdown file per book — this is the whole database
  lib/books.js      parses the frontmatter + chapters at build time
  components/       LibraryPage (the shelf), BookPage, AboutPage
  styles.css        all styling; the palette lives in :root at the top
public/covers/      cover images
```
