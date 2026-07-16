import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import LibraryPage from './components/LibraryPage.jsx'
import BookPage from './components/BookPage.jsx'
import AboutPage from './components/AboutPage.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <header className="masthead">
        <div className="wrap masthead__inner">
          <Link to="/" className="masthead__brand">
            <span aria-hidden="true" style={{ color: 'var(--gold)' }}>
              ⬥
            </span>
            Dark Library
          </Link>
          <nav className="masthead__nav">
            <NavLink to="/" end>
              Library
            </NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/book/:slug" element={<BookPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="*"
            element={
              <div className="empty">
                Nothing at this address. <Link to="/" style={{ color: 'var(--gold)' }}>Back to the library</Link>
              </div>
            }
          />
        </Routes>
      </main>

      <footer className="foot">
        <div className="wrap">A personal reading log · kept by hand</div>
      </footer>
    </>
  )
}
