import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { books } from '../lib/books.js'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'reading', label: 'Reading' },
  { id: 'finished', label: 'Finished' },
  { id: 'unread', label: 'To read' },
  { id: 'paused', label: 'Paused' },
]

function statusLabel(book) {
  if (book.status === 'finished') return 'Finished'
  if (book.status === 'unread') return 'To read'
  if (book.totalChapters) return `Ch. ${book.summarized} of ${book.totalChapters}`
  if (book.summarized) return `${book.summarized} noted`
  return book.status === 'paused' ? 'Paused' : 'Started'
}

function Cover({ book }) {
  const [failed, setFailed] = useState(false)

  if (book.cover && !failed) {
    return (
      <img
        src={book.cover}
        alt={`Cover of ${book.title}`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    )
  }
  return <div className="card__fallback">{book.title}</div>
}

export default function LibraryPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return books.filter((b) => {
      const matchesFilter = filter === 'all' || b.status === filter
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
      return matchesFilter && matchesQuery
    })
  }, [query, filter])

  return (
    <div className="wrap">
      <section className="hero">
        <div className="hero__count">
          ⬥ &nbsp;{books.length} {books.length === 1 ? 'volume' : 'volumes'}&nbsp; ⬥
        </div>
        <h1 className="hero__title">Everything I have read</h1>
        <p className="hero__sub">Chapter summaries, kept so I never lose the thread.</p>
      </section>

      <div className="filters">
        <input
          className="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles, authors, or tags"
          aria-label="Search the library"
        />
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`chip${filter === f.id ? ' is-on' : ''}`}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="empty">No books match that.</p>
      ) : (
        <div className="shelf">
          {shown.map((book) => {
            const done = book.status === 'finished'
            const unread = book.status === 'unread'
            return (
              <Link key={book.slug} to={`/book/${book.slug}`} className="card">
                <div className="card__art">
                  <Cover book={book} />
                  <div className="card__bar">
                    <span
                      className={done ? 'is-done' : ''}
                      style={{ width: `${done ? 100 : book.progress}%` }}
                    />
                  </div>
                </div>
                <div className="card__meta">
                  <div className="card__title">{book.title}</div>
                  <div className="card__author">{book.author}</div>
                  <div
                    className={`card__status${done ? ' is-done' : ''}${unread ? ' is-unread' : ''}`}
                  >
                    {statusLabel(book)}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
