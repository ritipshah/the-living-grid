import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FILTERS, PROJECTS } from '../data/projects.js';
import { PHOTOS } from '../data/site.js';
import { VISUALS } from '../visuals/index.js';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';

// Desktop placements on a 12-column sheet: [gridColumn, gridRow, shape]
const LAYOUT_ALL = {
  'cyber-threat-intelligence': ['1 / 8', '1 / 3', 'tall'],
  'nexus-criminal-intelligence': ['8 / 13', '1 / 2', 'wide'],
  'photo-balcony': ['8 / 10', '2 / 3'],
  'photo-corridor': ['10 / 13', '2 / 3'],
  'photo-atrium': ['1 / 4', '3 / 5'],
  firesense: ['4 / 9', '3 / 5', 'tall'],
  'legal-document-summarization': ['9 / 13', '3 / 5', 'tall'],
};
const LAYOUT_N = {
  1: [['1 / 13', '1 / 3', 'feature']],
  2: [
    ['1 / 8', '1 / 3', 'tall'],
    ['8 / 13', '1 / 3', 'tall'],
  ],
  3: [
    ['1 / 8', '1 / 3', 'tall'],
    ['8 / 13', '1 / 2', 'wide'],
    ['8 / 13', '2 / 3', 'wide'],
  ],
};
const PHOTO_TILES = [
  { key: 'photo-balcony', photo: PHOTOS.balcony, at: 1 },
  { key: 'photo-corridor', photo: PHOTOS.corridor, at: 1 },
  { key: 'photo-atrium', photo: PHOTOS.atrium, at: 2 },
];

export function ProjectTile({ project, shape = 'tall' }) {
  const { Tile } = VISUALS[project.slug];
  return (
    <article className={`tile tile--${shape}`} data-project={project.slug}>
      <Link
        to={`/work/${project.slug}`}
        viewTransition
        className="tile__link"
        aria-labelledby={`tile-${project.slug}-title`}
        aria-describedby={`tile-${project.slug}-short`}
      >
        <div className="tile__visual" style={{ viewTransitionName: `visual-${project.slug}` }}>
          <Tile />
        </div>
        <div className="tile__top">
          <span className="tile__no">{project.index}</span>
          <span className="label">{project.year}</span>
        </div>
        <div className="tile__info">
          <h3 className="tile__title" id={`tile-${project.slug}-title`}>
            {project.title}
          </h3>
          <p className="tile__short" id={`tile-${project.slug}-short`}>
            {project.short}
          </p>
          <div className="tile__more">
            <div>
              <ul className="tile__tags" aria-label="Technologies">
                {project.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="tile__status label">{project.status}</p>
            </div>
          </div>
          <span className="tile__cta label">
            Open case study <span aria-hidden="true">→</span>
          </span>
        </div>
        <span className="tile__corner" aria-hidden="true" />
      </Link>
    </article>
  );
}

// FLIP: animate items from their previous to their new grid position.
function useFlip(containerRef, deps, disabled) {
  const prev = useRef(new Map());
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const items = [...el.querySelectorAll('[data-flip]')];
    const next = new Map(items.map((n) => [n.dataset.flip, n.getBoundingClientRect()]));
    if (!disabled) {
      for (const n of items) {
        const a = prev.current.get(n.dataset.flip);
        const b = next.get(n.dataset.flip);
        if (!a) {
          n.animate([{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }], {
            duration: 520,
            easing: 'cubic-bezier(0.22, 0.8, 0.24, 1)',
          });
          continue;
        }
        const dx = a.left - b.left;
        const dy = a.top - b.top;
        const sx = a.width / b.width;
        const sy = a.height / b.height;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) continue;
        // Translate only (no scale) so type never distorts; a resized
        // frame settles in with a short fade instead.
        const resized = Math.abs(sx - 1) > 0.01 || Math.abs(sy - 1) > 0.01;
        n.animate(
          [
            { transform: `translate(${dx}px, ${dy}px)`, opacity: resized ? 0.35 : 1 },
            { transform: 'none', opacity: 1 },
          ],
          { duration: 640, easing: 'cubic-bezier(0.22, 0.8, 0.24, 1)' },
        );
      }
    }
    prev.current = next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default function WorkGrid() {
  const [filter, setFilter] = useState('all');
  const reduced = usePrefersReducedMotion();
  const gridRef = useRef(null);

  const visible = PROJECTS.filter((p) => filter === 'all' || p.categories.includes(filter));
  const counts = Object.fromEntries(
    FILTERS.map((f) => [f.id, f.id === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.categories.includes(f.id)).length]),
  );
  useFlip(gridRef, [filter], reduced);

  const items = [];
  if (filter === 'all') {
    PROJECTS.forEach((p, i) => {
      items.push({ key: p.slug, project: p, place: LAYOUT_ALL[p.slug] });
      PHOTO_TILES.filter((ph) => ph.at === i).forEach((ph) => items.push({ key: ph.key, photo: ph.photo, place: LAYOUT_ALL[ph.key] }));
    });
  } else {
    visible.forEach((p, i) => items.push({ key: p.slug, project: p, place: LAYOUT_N[visible.length][i] }));
  }

  return (
    <section id="work" className="section work shell" aria-labelledby="work-title">
      <header className="section-head">
        <p className="section-head__no label">
          <span className="marker" /> 01 / Selected work
        </p>
        <h2 id="work-title" className="section-head__title display">
          Four frames
        </h2>
        <p className="section-head__aside">
          Security analytics, relational intelligence, multi-sensor detection and legal NLP. Filter the sheet, then open a
          frame for the full case study.
        </p>
      </header>

      <div className="work__filters" role="group" aria-label="Filter projects by area">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="chip"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className="chip__count">{String(counts[f.id]).padStart(2, '0')}</span>
          </button>
        ))}
        <p className="sr-only" aria-live="polite">
          Showing {visible.length} project{visible.length === 1 ? '' : 's'}: {visible.map((p) => p.shortTitle).join(', ')}
        </p>
      </div>

      <div ref={gridRef} className={`work__grid work__grid--${filter === 'all' ? 'all' : `n${visible.length}`}`}>
        {items.map((it) => (
          <div
            key={it.key}
            data-flip={it.key}
            className={`work__item ${it.photo ? 'work__item--photo' : ''}`}
            style={{ '--gc': it.place[0], '--gr': it.place[1] }}
          >
            {it.project ? (
              <ProjectTile project={it.project} shape={it.place[2]} />
            ) : (
              <img
                className="work__photo"
                src={it.photo.src}
                srcSet={it.photo.srcSet}
                sizes="(min-width: 1100px) 25vw, 100vw"
                alt=""
                width={it.photo.w}
                height={it.photo.h}
                loading="lazy"
                decoding="async"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
