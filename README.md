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

## Deploying to Cloudflare Pages

1. Push this repository to GitHub.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to
   Git**, and pick the repo.
3. Set the build settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | Vite |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

4. Deploy. Every `git push` to `main` rebuilds and redeploys; pull requests get
   their own preview URL automatically.

Routing is already handled. `public/_redirects` sends every path to
`index.html` with a 200, which is what a client-side router needs — without it
the shelf would work but loading `/book/xenos` directly, or refreshing on it,
would 404.

Nothing here is tied to Cloudflare. The build output is plain static files, so
the same `dist/` folder drops onto Netlify (which reads the same `_redirects`
format), GitHub Pages, or anywhere else that serves a directory.

## Layout

```
src/
  content/books/    one Markdown file per book — this is the whole database
  lib/books.js      parses the frontmatter + chapters at build time
  components/       LibraryPage (the shelf), BookPage, AboutPage
  styles.css        all styling; the palette lives in :root at the top
public/covers/      cover images
```
