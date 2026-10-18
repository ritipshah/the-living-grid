import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PHOTOS } from '../data/site.js';
import { PROJECTS } from '../data/projects.js';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import { useMedia } from '../hooks/useMedia.js';
import SectionLink from './SectionLink.jsx';

// Desktop track spans for each tile: [colStart, colEnd, rowStart, rowEnd]
// on a 12 × 6 grid. Used to widen the hovered tile's tracks.
const SPANS = {
  word: [1, 7, 1, 4],
  a: [7, 10, 1, 5],
  b: [10, 13, 1, 3],
  title: [10, 13, 3, 5],
  intro: [1, 5, 4, 7],
  c: [5, 7, 4, 7],
  d: [7, 10, 5, 7],
  index: [10, 13, 5, 7],
};

// Each photo tile cycles through its own small pool of frames.
const POOLS = {
  a: ['tower', 'loggia', 'atrium'],
  b: ['columns', 'balcony', 'stack'],
  c: ['stair', 'corridor', 'monolith'],
  d: ['spiral', 'corner', 'stack'],
};
const FRAME_NO = {
  tower: '03', loggia: '11', atrium: '02', columns: '12', balcony: '10',
  stack: '04', stair: '08', corridor: '05', monolith: '07', spiral: '01', corner: '09',
};
const CYCLE_ORDER = ['a', 'c', 'b', 'd'];
const CYCLE_MS = 4200;

function tracks(n, start, end, grow) {
  return Array.from({ length: n }, (_, i) =>
    i + 1 >= start && i + 1 < end ? `${grow}fr` : '1fr',
  ).join(' ');
}

function PhotoTile({ id, photoKey, prevKey, live, onEnter }) {
  const p = PHOTOS[photoKey];
  const prev = prevKey ? PHOTOS[prevKey] : null;
  return (
    <div className={`hero__tile hero__tile--photo hero__${id}`} onPointerEnter={onEnter} aria-hidden="true">
      {prev && (
        <img className="hero__img hero__img--prev" src={prev.src} srcSet={prev.srcSet} sizes="(min-width: 1100px) 25vw, 50vw" alt="" width={prev.w} height={prev.h} />
      )}
      <img
        key={photoKey}
        className={`hero__img ${prev ? 'hero__img--in' : ''}`}
        src={p.src}
        srcSet={p.srcSet}
        sizes="(min-width: 1100px) 25vw, 50vw"
        alt=""
        width={p.w}
        height={p.h}
        fetchPriority={id === 'a' ? 'high' : undefined}
      />
      <span className={`hero__frame label ${live ? 'is-live' : ''}`}>
        <span className="marker" /> Fr. {FRAME_NO[photoKey]}
      </span>
    </div>
  );
}

export default function Hero() {
  const reduced = usePrefersReducedMotion();
  const desktop = useMedia('(min-width: 1100px) and (hover: hover) and (pointer: fine)');
  const [hovered, setHovered] = useState(null);
  const [frames, setFrames] = useState({ a: 0, b: 0, c: 0, d: 0 });
  const [prev, setPrev] = useState({});
  const [live, setLive] = useState(null);
  const ref = useRef(null);
  const visible = useRef(true);
  const step = useRef(0);
  const framesRef = useRef(frames);

  // Pause the frame cycle while the hero is off-screen.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return undefined;
    const t = setInterval(() => {
      if (!visible.current || document.hidden || hovered) return;
      const id = CYCLE_ORDER[step.current % CYCLE_ORDER.length];
      step.current += 1;
      const cur = framesRef.current;
      const next = { ...cur, [id]: (cur[id] + 1) % POOLS[id].length };
      framesRef.current = next;
      setPrev((p) => ({ ...p, [id]: POOLS[id][cur[id]] }));
      setFrames(next);
      setLive(id);
    }, CYCLE_MS);
    return () => clearInterval(t);
  }, [reduced, hovered]);

  // Always emit explicit track lists on desktop so the browser can
  // interpolate between the resting and expanded states.
  let style;
  if (desktop && !reduced) {
    const [c0, c1, r0, r1] = hovered ? SPANS[hovered] : [0, 0, 0, 0];
    style = {
      '--cols': tracks(12, c0, c1, 1.45),
      '--rows': tracks(6, r0, r1, 1.25),
    };
  }

  const enter = (id) => () => desktop && setHovered(id);

  return (
    <section
      ref={ref}
      className={`hero shell ${hovered ? 'is-hovering' : ''}`}
      aria-labelledby="hero-title"
      style={style}
      onPointerLeave={() => setHovered(null)}
    >
      <div className="hero__tile hero__word" onPointerEnter={enter('word')}>
        <div className="hero__word-top">
          <span className="label">Portfolio · 2026</span>
          <span className="label">Index of work</span>
        </div>
        <h1 id="hero-title" className="hero__name display">
          <span>Riti</span>
          <span>Shah</span>
        </h1>
        <p className="hero__word-foot label">Data Science · NMIMS · Mumbai</p>
      </div>

      <PhotoTile id="a" photoKey={POOLS.a[frames.a]} prevKey={prev.a} live={live === 'a'} onEnter={enter('a')} />
      <PhotoTile id="b" photoKey={POOLS.b[frames.b]} prevKey={prev.b} live={live === 'b'} onEnter={enter('b')} />

      <div className="hero__tile hero__title" onPointerEnter={enter('title')}>
        <span className="label label--accent">
          <span className="marker" /> Exhibition
        </span>
        <p className="hero__title-text">
          <span className="serif">The</span> Living Grid
        </p>
        <p className="hero__title-note">
          A contact sheet of four projects. Frames shift as you look; each one opens into a full case study.
        </p>
      </div>

      <div className="hero__tile hero__intro" onPointerEnter={enter('intro')}>
        <p className="hero__intro-text">
          Data Science student working with <em>machine learning</em>, <em>NLP</em> and <em>intelligent systems</em>. I like building
          the whole system around a model: the data, the database and the interface someone actually uses.
        </p>
        <div className="hero__actions">
          <SectionLink id="work" className="btn btn--solid">
            View the work <span aria-hidden="true">↓</span>
          </SectionLink>
          <SectionLink id="about" className="btn">
            About
          </SectionLink>
        </div>
      </div>

      <PhotoTile id="c" photoKey={POOLS.c[frames.c]} prevKey={prev.c} live={live === 'c'} onEnter={enter('c')} />
      <PhotoTile id="d" photoKey={POOLS.d[frames.d]} prevKey={prev.d} live={live === 'd'} onEnter={enter('d')} />

      <nav className="hero__tile hero__index" aria-label="Projects" onPointerEnter={enter('index')}>
        <span className="label">Index · 01–04</span>
        <ol>
          {PROJECTS.map((p) => (
            <li key={p.slug}>
              <Link to={`/work/${p.slug}`} viewTransition>
                <span className="label">{p.index}</span>
                <span className="hero__index-title">{p.shortTitle}</span>
                <span className="hero__index-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}
