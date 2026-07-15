const files = import.meta.glob('../content/books/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const NUMERIC_FIELDS = ['year', 'pages', 'totalChapters', 'rating']
const LIST_FIELDS = ['tags']

function parseFrontmatter(input) {
  // Windows editors often save UTF-8 with a BOM, which would otherwise sit in
  // front of the opening `---` and hide the frontmatter entirely.
  const raw = input.replace(/^﻿/, '')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }

  const meta = {}
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue
    const at = line.indexOf(':')
    if (at === -1) continue

    const key = line.slice(0, at).trim()
    let value = line.slice(at + 1).trim().replace(/^["'](.*)["']$/, '$1')

    if (NUMERIC_FIELDS.includes(key)) {
      const n = Number(value)
      meta[key] = Number.isFinite(n) ? n : null
    } else if (LIST_FIELDS.includes(key)) {
      meta[key] = value ? value.split(',').map((s) => s.trim()).filter(Boolean) : []
    } else {
      meta[key] = value
    }
  }
  return { meta, body: match[2] }
}

// Splits the body on `# Section` headings into { synopsis, feelings, chapters }.
function splitSections(body) {
  const sections = {}
  const parts = body.split(/^#\s+(.+)$/m)
  for (let i = 1; i < parts.length; i += 2) {
    sections[parts[i].trim().toLowerCase()] = (parts[i + 1] || '').trim()
  }
  return sections
}

// A chapter is `## <number> · <title>`, optionally followed by `pages:`/`read:`
// lines, then the summary prose.
function parseChapters(section) {
  if (!section) return []

  const chunks = section.split(/^##\s+/m).slice(1)
  return chunks.map((chunk, index) => {
    const lines = chunk.split(/\r?\n/)
    const heading = lines.shift().trim()

    const headingMatch = heading.match(/^(\d+)\s*[·••\-–—.]\s*(.+)$/)
    const number = headingMatch ? Number(headingMatch[1]) : null
    const title = headingMatch ? headingMatch[2].trim() : heading

    // Fields may sit directly under the heading or after a blank line.
    while (lines.length && !lines[0].trim()) lines.shift()

    const fields = {}
    while (lines.length) {
      const field = lines[0].match(/^(pages|read)\s*:\s*(.+)$/i)
      if (!field) break
      fields[field[1].toLowerCase()] = field[2].trim()
      lines.shift()
    }

    return {
      id: `ch-${number ?? index}`,
      number,
      title,
      pages: fields.pages || null,
      read: fields.read || null,
      summary: lines.join('\n').trim(),
    }
  })
}

function buildBook(path, raw) {
  const { meta, body } = parseFrontmatter(raw)
  const sections = splitSections(body)
  const chapters = parseChapters(sections.chapters)

  const slug = path.split('/').pop().replace(/\.md$/, '')
  // Only an explicit `totalChapters` can drive progress. Falling back to the
  // number of chapters present would read 100% for every book.
  const totalChapters = meta.totalChapters ?? null
  const summarized = chapters.length

  return {
    slug,
    title: meta.title || slug,
    subtitle: meta.subtitle || '',
    author: meta.author || 'Unknown',
    year: meta.year ?? null,
    pages: meta.pages ?? null,
    series: meta.series || '',
    cover: meta.cover || '',
    status: meta.status || 'reading',
    rating: meta.rating ?? null,
    tags: meta.tags || [],
    source: meta.source || '',
    totalChapters,
    summarized,
    progress: totalChapters ? Math.round((summarized / totalChapters) * 100) : 0,
    synopsis: sections.synopsis || '',
    feelings: sections.feelings || '',
    chapters,
  }
}

export const books = Object.entries(files)
  .map(([path, raw]) => buildBook(path, raw))
  .sort((a, b) => a.title.localeCompare(b.title))

export function getBook(slug) {
  return books.find((b) => b.slug === slug)
}
