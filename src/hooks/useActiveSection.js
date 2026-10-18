import { useEffect, useState } from 'react';

// Tracks which home-page section sits across the middle of the viewport.
export function useActiveSection(ids, enabled = true) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -54% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      setActive(null);
    };
  }, [ids, enabled]);

  return active;
}
