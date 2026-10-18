import { Link } from 'react-router-dom';
import { PROFILE } from '../data/site.js';
import { SECTIONS } from '../data/sections.js';
import SectionLink from './SectionLink.jsx';

export default function Footer() {
  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  };

  return (
    <footer className="footer shell">
      <div className="footer__grid">
        <p className="footer__name display">Riti Shah</p>
        <nav aria-label="Footer" className="footer__nav">
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <SectionLink id={s.id}>{s.label}</SectionLink>
              </li>
            ))}
            <li>
              <Link to="/chess">Chess / Dimension 001</Link>
            </li>
            <li>
              <Link to="/colophon" viewTransition>
                Colophon &amp; credits
              </Link>
            </li>
          </ul>
        </nav>
        <ul className="footer__ext">
          <li>
            <a href={`mailto:${PROFILE.email}`}>Email</a>
          </li>
          <li>
            <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
        <button type="button" className="footer__top" onClick={toTop}>
          <span className="footer__top-icon" aria-hidden="true">
            ↑
          </span>
          <span className="label">Back to top</span>
        </button>
      </div>
      <p className="footer__meta label">
        <span>© {new Date().getFullYear()} Riti Shah</span>
        <span>Mumbai</span>
        <span>The Living Grid · built with React + Vite</span>
      </p>
    </footer>
  );
}
