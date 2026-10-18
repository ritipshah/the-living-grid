import { Link, useLocation } from 'react-router-dom';

// Link to a home-page section. Re-scrolls when the hash is already current,
// which a plain <Link> would treat as a no-op.
export default function SectionLink({ id, onClick, children, ...rest }) {
  const { pathname, hash } = useLocation();
  const handle = (e) => {
    onClick?.(e);
    if (pathname === '/' && hash === `#${id}`) {
      e.preventDefault();
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    }
  };
  return (
    <Link to={{ pathname: '/', hash: `#${id}` }} onClick={handle} {...rest}>
      {children}
    </Link>
  );
}
