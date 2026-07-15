import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { getBook } from '../lib/books.js'

// Book files can arrive by pull request, so their markdown is untrusted input.
// marked passes raw HTML straight through, and this goes into
// dangerouslySetInnerHTML — without sanitising, `<img src=x onerror=...>` in a
// summary would execute. Allow only the tags prose actually needs.
const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'blockquote', 'ul', 'ol', 'li', 'code', 'pre', 'h2', 'h3']

function md(text) {
  const html = marked.parse(text || '', { breaks: true })
  return {
    __html: DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR: [],
    }),
  }
}

// A bare `2026-07-09` parses as UTC midnight, which displays as the previous day
// in any timezone behind UTC. Build it from parts so it stays the date written.
function formatDate(value) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  const d = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Stars({ rating }) {
  if (!rating) return null
  return (
    <div className="stars" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? '' : 'off'} aria-hidden="true">
          ★
        </span>
      ))}
    </div>
  )
}

function Chapter({ chapter, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const stamp = [chapter.read && `Read ${formatDate(chapter.read)}`, chapter.pages && `pp. ${chapter.pages}`]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className={`chapter${open ? ' is-open' : ''}`}>
      <button className="chapter__toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {chapter.number !== null && <span className="chapter__num">{chapter.number}</span>}
        <span className="chapter__name">{chapter.title}</span>
        <span className="chapter__chev" aria-hidden="true">
          ›
        </span>
      </button>
      {open && (
        <div className="chapter__body">
          <div dangerouslySetInnerHTML={md(chapter.summary)} />
          {stamp && <div className="chapter__stamp">{stamp}</div>}
        </div>
      )}
    </div>
  )
}

export default function BookPage() {
  const { slug } = useParams()
  const book = getBook(slug)
  const [newestFirst, setNewestFirst] = useState(true)
  const [coverFailed, setCoverFailed] = useState(false)

  const chapters = useMemo(() => {
    if (!book) return []
    const sorted = [...book.chapters].sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
    return newestFirst ? sorted.reverse() : sorted
  }, [book, newestFirst])

  if (!book) {
    return (
      <div className="empty">
        No such book.{' '}
        <Link to="/" style={{ color: 'var(--gold)' }}>
          Back to the library
        </Link>
      </div>
    )
  }

  const done = book.status === 'finished'
  const facts = [
    ['Author', book.author],
    ['Year', book.year],
    ['Pages', book.pages],
    ['Series', book.series],
  ].filter(([, v]) => v)

  return (
    <div className="wrap">
      <Link to="/" className="back">
        <span aria-hidden="true">←</span> Back to library
      </Link>

      <article className="book">
        <aside className="book__aside">
          <div className="book__cover">
            {book.cover && !coverFailed ? (
              <img src={book.cover} alt={`Cover of ${book.title}`} onError={() => setCoverFailed(true)} />
            ) : (
              <div className="card__fallback">{book.title}</div>
            )}
          </div>

          <div>
            <div className="eyebrow">⬥ The record</div>
            <dl className="facts">
              {facts.map(([label, value]) => (
                <div className="facts__row" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            {book.totalChapters > 0 && (
              <div className="progress">
                <div className="progress__label">
                  Progress · {done ? 100 : book.progress}%
                </div>
                <div className="progress__track">
                  <div
                    className={`progress__fill${done ? ' is-done' : ''}`}
                    style={{ width: `${done ? 100 : book.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        <div>
          <header className="book__head">
            <h1 className="book__title">{book.title}</h1>
            {book.subtitle && <p className="book__subtitle">{book.subtitle}</p>}
          </header>

          {book.synopsis && (
            <section className="section">
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                Synopsis
              </div>
              <div className="synopsis" dangerouslySetInnerHTML={md(book.synopsis)} />
              {book.source && (
                <p className="source">
                  Source:{' '}
                  {book.source.startsWith('http') ? (
                    <a href={book.source} target="_blank" rel="noopener noreferrer">
                      {book.source}
                    </a>
                  ) : (
                    book.source
                  )}
                </p>
              )}
            </section>
          )}

          {chapters.length > 0 && (
            <section className="section">
              <div className="section__head">
                <div className="eyebrow">
                  Chapters · {book.summarized} summarized
                </div>
                <button className="sort" onClick={() => setNewestFirst((v) => !v)}>
                  {newestFirst ? 'Newest first' : 'Oldest first'}
                </button>
              </div>
              <div className="chapters">
                {chapters.map((c, i) => (
                  <Chapter key={c.id} chapter={c} defaultOpen={i === 0} />
                ))}
              </div>
            </section>
          )}

          {book.feelings && (
            <section className="section">
              <div className="feelings">
                <div className="eyebrow" style={{ marginBottom: 8 }}>
                  How I feel about it
                </div>
                <div className="feelings__body" dangerouslySetInnerHTML={md(book.feelings)} />
                <Stars rating={book.rating} />
              </div>
            </section>
          )}
        </div>
      </article>
    </div>
  )
}
