// Validates every book file in src/content/books before it can be merged.
// Mirrors the rules in src/lib/books.js. Run with `npm run validate`.

import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const booksDir = join(root, 'src', 'content', 'books')
const publicDir = join(root, 'public')

const STATUSES = ['reading', 'finished', 'paused', 'unread']
const NUMERIC = ['year', 'pages', 'totalChapters', 'rating']

const problems = []
const warnings = []
const fail = (file, msg) => problems.push(`${file}: ${msg}`)
// Soft issues: the site still renders correctly, so they must not block a merge.
const warn = (file, msg) => warnings.push(`${file}: ${msg}`)

function parseFrontmatter(input) {
  // Matches src/lib/books.js — strip a UTF-8 BOM before looking for `---`.
  const raw = input.replace(/^﻿/, '')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return null

  const meta = {}
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue
    const at = line.indexOf(':')
    if (at === -1) continue
    meta[line.slice(0, at).trim()] = line
      .slice(at + 1)
      .trim()
      .replace(/^["'](.*)["']$/, '$1')
  }
  return { meta, body: match[2] }
}

const files = readdirSync(booksDir).filter((f) => f.endsWith('.md'))

if (files.length === 0) {
  fail('src/content/books', 'no book files found')
}

for (const file of files) {
  const raw = readFileSync(join(booksDir, file), 'utf8')
  const parsed = parseFrontmatter(raw)

  if (!parsed) {
    fail(file, 'missing the --- frontmatter block at the top')
    continue
  }

  const { meta, body } = parsed

  if (!meta.title) fail(file, 'frontmatter is missing `title`')
  if (!meta.author) fail(file, 'frontmatter is missing `author`')

  if (meta.status && !STATUSES.includes(meta.status)) {
    fail(file, `status "${meta.status}" must be one of: ${STATUSES.join(', ')}`)
  }

  for (const key of NUMERIC) {
    if (meta[key] !== undefined && !Number.isFinite(Number(meta[key]))) {
      fail(file, `\`${key}\` must be a number, got "${meta[key]}"`)
    }
  }

  if (meta.rating !== undefined) {
    const r = Number(meta.rating)
    if (r < 1 || r > 5) fail(file, `\`rating\` must be between 1 and 5, got ${meta.rating}`)
  }

  if (meta.cover) {
    if (!meta.cover.startsWith('/')) {
      fail(file, `\`cover\` must start with / (e.g. /covers/${file.replace('.md', '.jpg')})`)
    } else if (!existsSync(join(publicDir, meta.cover))) {
      warn(file, `no cover image at public${meta.cover} yet — the page will show a title card`)
    }
  }

  // Book files can arrive by pull request. The renderer sanitises markdown, but
  // raw HTML has no business in a book summary — reject it here so a malicious
  // or careless PR is obvious in review rather than relying on the sanitiser.
  const html = body.match(/<\s*\/?\s*[a-z][^>]*>/gi)
  if (html) {
    const unique = [...new Set(html.map((t) => t.trim()))].slice(0, 3)
    fail(file, `contains raw HTML (${unique.join(', ')}) — summaries must be plain markdown`)
  }

  // Chapter headings must be `## <number> · <title>` so ordering is unambiguous.
  const seen = new Map()
  for (const chunk of body.split(/^##\s+/m).slice(1)) {
    const heading = chunk.split(/\r?\n/)[0].trim()
    const m = heading.match(/^(\d+)\s*[·••\-–—.]\s*(.+)$/)
    if (!m) {
      fail(file, `chapter heading "${heading}" must look like: ## 1 · Chapter name`)
      continue
    }
    const n = Number(m[1])
    if (seen.has(n)) fail(file, `two chapters are both numbered ${n} ("${seen.get(n)}" and "${m[2]}")`)
    seen.set(n, m[2])
  }

  const total = Number(meta.totalChapters)
  if (Number.isFinite(total) && seen.size > total) {
    fail(file, `${seen.size} chapters written but totalChapters says ${total}`)
  }
}

if (warnings.length) {
  console.log('')
  for (const w of warnings) console.log(`  ! ${w}`)
}

if (problems.length) {
  console.error(`\n${problems.length} problem${problems.length > 1 ? 's' : ''} found:\n`)
  for (const p of problems) console.error(`  ✗ ${p}`)
  console.error('')
  process.exit(1)
}

console.log(`\n✓ ${files.length} book file${files.length > 1 ? 's' : ''} valid`)
