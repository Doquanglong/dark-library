const TEMPLATE = `---
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
It is the 31st millennium...

# Chapters

## 1 · The lodge
pages: 11-28
read: 2026-07-02

What happened, in my own words.

# Feelings
What I make of it so far.
`

export default function AboutPage() {
  return (
    <div className="wrap">
      <div className="prose">
        <h1>About this log</h1>
        <p>
          This is where I keep track of what I am reading. Every book gets a page with its
          details, a synopsis from an official source, and a summary of each chapter written in my
          own words — so when I pick a book back up after a break, I can remember where I was
          without rereading it.
        </p>
        <p>There are no accounts and no database. Every book is a file.</p>

        <h2>Adding a book</h2>
        <p>
          Drop a new <code>.md</code> file into <code>src/content/books/</code>. The filename
          becomes the URL, so <code>horus-rising.md</code> lives at <code>/book/horus-rising</code>.
          Put the cover image in <code>public/covers/</code>.
        </p>
        <pre>
          <code>{TEMPLATE}</code>
        </pre>

        <h2>The fields</h2>
        <p>
          Only <code>title</code> and <code>author</code> are really required — everything else is
          optional and the page adapts to what is missing. <code>status</code> is{' '}
          <code>reading</code>, <code>finished</code>, or <code>paused</code>.{' '}
          <code>totalChapters</code> drives the progress bar, which fills as chapters get
          summarized, so there is no separate progress number to keep in sync.
        </p>

        <h2>Adding a chapter</h2>
        <p>
          Append a new <code>##</code> block under <code># Chapters</code>. The number before the{' '}
          <code>·</code> is what orders them; <code>pages:</code> and <code>read:</code> are
          optional. Save, push, and the site rebuilds itself.
        </p>
      </div>
    </div>
  )
}
