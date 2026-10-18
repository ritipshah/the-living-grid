import { useEffect, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion.js';

export default function Layout() {
  const { pathname, hash } = useLocation();
  const reduced = usePrefersReducedMotion();

  // Route + anchor scrolling.
  useLayoutEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash, reduced]);

  // Scroll reveals. Content is fully visible until this opts in.
  useEffect(() => {
    const root = document.documentElement;
    if (reduced || !('IntersectionObserver' in window)) {
      root.classList.remove('js-motion');
      return;
    }
    root.classList.add('js-motion');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname, reduced]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
