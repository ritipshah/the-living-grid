import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useActiveSection } from '../hooks/useActiveSection.js';
import { SECTIONS } from '../data/sections.js';
import SectionLink from './SectionLink.jsx';

const IDS = SECTIONS.map((s) => s.id);

export default function Nav() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const active = useActiveSection(IDS, isHome);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);

  const activeIdx = SECTIONS.findIndex((s) => s.id === active);
  const frame = isHome
    ? activeIdx >= 0
      ? `${String(activeIdx + 1).padStart(2, '0')} / ${SECTIONS[activeIdx].label}`
      : '00 / Index'
    : pathname.startsWith('/work/')
      ? 'Case study'
      : 'Archive';

  // Close the menu on route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
      // Keep Tab inside the open panel.
      if (e.key === 'Tab' && panelRef.current) {
        const f = panelRef.current.querySelectorAll('a,button');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          toggleRef.current?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          toggleRef.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={`nav ${open ? 'nav--open' : ''}`}>
      <div className="nav__bar">
        <Link to="/" className="nav__brand" aria-label="Riti Shah — home" viewTransition>
          <span className="nav__mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="nav__name">Riti Shah</span>
        </Link>

        <span className="nav__frame label" aria-hidden="true">
          <span className="marker" /> {frame}
        </span>

        <nav aria-label="Primary" className="nav__links">
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <SectionLink
                  id={s.id}
                  className={`nav__link ${isHome && active === s.id ? 'is-active' : ''}`}
                  aria-current={isHome && active === s.id ? 'location' : undefined}
                >
                  {s.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-panel"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="label">{open ? 'Close' : 'Index'}</span>
          <span className="nav__toggle-icon" aria-hidden="true" />
        </button>
      </div>

      <div id="nav-panel" ref={panelRef} className="nav__panel" hidden={!open}>
        <ul>
          {SECTIONS.map((s, i) => (
            <li key={s.id} style={{ '--i': i }}>
              <SectionLink id={s.id} onClick={() => setOpen(false)}>
                <span className="label">{String(i + 1).padStart(2, '0')}</span>
                <span className="nav__panel-label">{s.label}</span>
              </SectionLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
