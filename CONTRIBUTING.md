# Contributing a book

Anyone can add a book. There is no account to make and no software to install —
a book is one text file, and adding one is a pull request that adds that file.

## How

1. Fork this repository.
2. Add `src/content/books/<slug>.md`. The filename becomes the URL, so
   `xenos.md` is served at `/book/xenos`.
3. Optionally add a cover at `public/covers/<slug>.jpg`, around 400px wide.
4. Open a pull request.

A GitHub Action checks that your file parses and that the site still builds. If
something is wrong it will say exactly what, on the pull request.

## The file

```markdown
---
title: Xenos
subtitle: Book one of the Eisenhorn trilogy
author: Dan Abnett
year: 2001
pages: 370
series: Eisenhorn #1
cover: /covers/xenos.jpg
status: reading
totalChapters: 21
rating: 4
tags: warhammer, 40k
source: https://www.blacklibrary.com/
---

# Synopsis

Where the book starts, in a paragraph.

# Chapters

## 1 · Tomb Point, dormant season

pages: 11-32
read: 2026-07-02

What happens, in your own words.

# Feelings

What you make of it.
```

Only `title` and `author` are required. Everything else is optional and the page
adapts to what is missing.

| Field | Rule |
| --- | --- |
| `status` | `reading`, `finished`, or `paused` |
| `year`, `pages`, `totalChapters` | numbers |
| `rating` | a number from 1 to 5 |
| `cover` | a path starting with `/`, e.g. `/covers/xenos.jpg` |
| `tags` | comma separated |

Chapters are `## <number> · <title>` under `# Chapters`. The number sets the
order, so you can append new chapters at the bottom of the file. Two chapters
cannot share a number. `pages:` and `read:` are optional.

Run `npm run validate` before opening the PR to check all of this locally.

## What gets merged

**Write the summaries yourself.** Do not paste in text from Goodreads, a wiki, a
summary site, a review, or the book itself. Those belong to whoever wrote them,
and this site is public — we cannot host them. Describing what happens in a
chapter in your own words is fine, and it is the whole point.

The `# Synopsis` section is the one exception: a publisher's blurb is fine there
if you set `source:` to where it came from.

Beyond that: no spoilers outside the chapter they belong to, and keep the
`# Feelings` section to your own reaction — one voice per book, so if a book
already has one, add chapters rather than rewriting someone else's.

## Editing a note

Fix a typo or improve a summary in the file it lives in and open a PR. There is
no database, so every change to the site is a diff someone can read.
