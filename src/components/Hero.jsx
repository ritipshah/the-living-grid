import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PROJECTS } from '../data/projects.js';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import SectionLink from './SectionLink.jsx';

/* ─── The Knight's Journey ─────────────────────────────────────────
   An 8 × 8 board on which a knight moves by the real rules (an L: two
   squares one way, one square at right angles). Five squares are
   destinations: the four projects and About. Visitors either move square
   by square, or pick a destination and the knight takes the shortest
   legal route there (breadth-first search). */

const FILES = 'abcdefgh';
const START = 'g1';
const STEP_MS = 420;

const toXY = (sq) => [FILES.indexOf(sq[0]), 8 - Number(sq[1])]; // x: 0–7 left→right, y: 0–7 top→bottom
const toSq = (x, y) => `${FILES[x]}${8 - y}`;
const JUMPS = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];

function knightMoves(sq) {
  const [x, y] = toXY(sq);
  return JUMPS.map(([dx, dy]) => [x + dx, y + dy])
    .filter(([a, b]) => a >= 0 && a < 8 && b >= 0 && b < 8)
    .map(([a, b]) => toSq(a, b));
}

// Shortest knight route from → to, inclusive of both ends.
function route(from, to) {
  const prev = { [from]: null };
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === to) break;
    for (const n of knightMoves(cur)) {
      if (!(n in prev)) {
        prev[n] = cur;
        queue.push(n);
      }
    }
  }
  const path = [];
  for (let s = to; s; s = prev[s]) path.unshift(s);
  return path;
}

const bySlug = Object.fromEntries(PROJECTS.map((p) => [p.slug, p]));
const DESTS = [
  { sq: 'c6', mark: '01', project: bySlug['cyber-threat-intelligence'] },
  { sq: 'f5', mark: '02', project: bySlug['nexus-criminal-intelligence'] },
  { sq: 'b3', mark: '03', project: bySlug.firesense },
  { sq: 'h7', mark: '04', project: bySlug['legal-document-summarization'] },
  {
    sq: 'd8',
    mark: 'Ab',
    about: true,
    title: 'About Riti',
    short: 'Background, education, interests and the tools I work with.',
  },
].map((d) => ({ ...d, title: d.title ?? d.project.title, short: d.short ?? d.project.short }));
const DEST_AT = Object.fromEntries(DESTS.map((d) => [d.sq, d]));

function KnightPiece() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <path
        d="M27 86h48v-7h-4c-1-15 5-27 3-41-2-15-13-25-28-27l-4-8-6 10c-8 5-14 14-18 24l-4 12c-1 5 4 9 9 6l8-6c6 0 11-3 13-8 1 9-6 17-12 26-3 4-4 8-4 12h-4z"
        fill="#ece8e1"
        stroke="#0b0b0b"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="47" cy="29" r="3.2" fill="#0b0b0b" />
      <rect x="24" y="86" width="54" height="7" fill="#e8590c" />
    </svg>
  );
}

const center = (sq) => {
  const [x, y] = toXY(sq);
  return `${x + 0.5},${y + 0.5}`;
};

export default function Hero() {
  const reduced = usePrefersReducedMotion();
  const [pos, setPos] = useState(START);
  const [trail, setTrail] = useState([START]);
  const [moving, setMoving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [announce, setAnnounce] = useState('');
  const timers = useRef([]);
  const boardRef = useRef(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const arrive = (sq) => {
    const d = DEST_AT[sq];
    setAnnounce(
      d
        ? `Knight reached ${sq}: ${d.title}. Open it from the destination panel.`
        : `Knight to ${sq}. ${knightMoves(sq).length} legal moves.`,
    );
  };

  const moveTo = (sq) => {
    if (moving || !knightMoves(pos).includes(sq)) return;
    setPos(sq);
    setTrail((t) => [...t, sq]);
    arrive(sq);
    // The clicked square is now the knight's square (not a button), so keep
    // keyboard focus on the board; Tab then reaches the new legal moves.
    boardRef.current?.focus({ preventScroll: true });
  };

  const travel = (dest) => {
    if (moving) return;
    clearTimers();
    const path = route(pos, dest.sq).slice(1);
    if (!path.length) {
      arrive(dest.sq);
      return;
    }
    if (reduced) {
      setPos(dest.sq);
      setTrail((t) => [...t, ...path]);
      arrive(dest.sq);
      return;
    }
    setMoving(true);
    setAnnounce(`Knight travelling to ${dest.title}: ${path.length} move${path.length === 1 ? '' : 's'}.`);
    path.forEach((sq, i) => {
      timers.current.push(
        setTimeout(() => {
          setPos(sq);
          setTrail((t) => [...t, sq]);
          if (i === path.length - 1) {
            setMoving(false);
            arrive(sq);
          }
        }, (i + 1) * STEP_MS),
      );
    });
  };

  const reset = () => {
    clearTimers();
    setMoving(false);
    setPos(START);
    setTrail([START]);
    setAnnounce('Knight returned to g1.');
  };

  const valid = new Set(moving ? [] : knightMoves(pos));
  const here = DEST_AT[pos];
  const previewPath = preview && !moving ? route(pos, preview) : null;
  const [kx, ky] = toXY(pos);

  const squares = [];
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const sq = toSq(x, y);
      const dest = DEST_AT[sq];
      const cls = [
        'sq',
        (x + y) % 2 ? 'sq--dark' : 'sq--light',
        dest && 'sq--dest',
        valid.has(sq) && 'is-valid',
        sq === pos && 'is-here',
        preview === sq && 'is-preview',
      ]
        .filter(Boolean)
        .join(' ');
      const inner = (
        <>
          {dest && <span className="sq__mark">{dest.mark}</span>}
          {x === 0 && <span className="sq__rank">{8 - y}</span>}
          {y === 7 && <span className="sq__file">{FILES[x]}</span>}
        </>
      );
      squares.push(
        valid.has(sq) ? (
          <button
            key={sq}
            type="button"
            className={cls}
            onClick={() => moveTo(sq)}
            aria-label={`Move knight to ${sq}${dest ? `, ${dest.title}` : ''}`}
          >
            {inner}
          </button>
        ) : (
          <div key={sq} className={cls} aria-hidden="true">
            {inner}
          </div>
        ),
      );
    }
  }

  return (
    <section className="hero shell" aria-labelledby="hero-title">
      <div className="hero__tile hero__word">
        <div className="hero__word-top">
          <span className="label">Portfolio · 2026</span>
          <span className="label">The Living Grid</span>
        </div>
        <h1 id="hero-title" className="hero__name display">
          <span>Riti</span>
          <span>Shah</span>
        </h1>
        <p className="hero__word-foot label">Data Science · NMIMS · Mumbai</p>
      </div>

      <div className="hero__tile hero__intro">
        <p className="hero__intro-text">
          Data Science student working with <em>machine learning</em>, <em>NLP</em> and <em>intelligent systems</em>. I like building
          the whole system around a model: the data, the database and the interface someone actually uses.
        </p>
        <div className="hero__actions">
          <SectionLink id="work" className="btn btn--solid">
            Explore all projects <span aria-hidden="true">↓</span>
          </SectionLink>
          <SectionLink id="about" className="btn">
            About
          </SectionLink>
        </div>
        <Link to="/chess" className="play-chess">
          <span className="play-chess__grid" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="play-chess__text">
            <span className="play-chess__title">Play chess</span>
            <span className="play-chess__sub">Dimension 001 · 3D · vs Stockfish</span>
          </span>
          <span className="play-chess__arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>

      <div className="hero__tile hero__board">
        <div className="board__bar">
          <span className="label">
            <span className="marker" /> Knight on <b>{pos}</b> · {moving ? 'moving' : `${valid.size} legal moves`}
          </span>
          <button type="button" className="board__reset label" onClick={reset} disabled={pos === START && trail.length === 1}>
            Reset
          </button>
        </div>
        <div className="board__wrap">
          <div
            ref={boardRef}
            tabIndex={-1}
            className={`board ${moving ? 'is-moving' : ''}`}
            role="group"
            aria-label={`Chessboard. The knight is on ${pos}. Legal moves are buttons.`}
          >
            {squares}
            <svg className="board__trail" viewBox="0 0 8 8" aria-hidden="true">
              {trail.length > 1 && <polyline points={trail.map(center).join(' ')} />}
              {previewPath && previewPath.length > 1 && (
                <polyline className="is-preview" points={previewPath.map(center).join(' ')} />
              )}
            </svg>
            <div
              className="board__knight"
              style={{ transform: `translate(${kx * 100}%, ${ky * 100}%)` }}
              aria-hidden="true"
            >
              <KnightPiece />
            </div>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </div>

      <div className="hero__tile hero__journey">
        <div className="journey__head">
          <span className="label label--accent">
            <span className="marker" /> Exhibition
          </span>
          <h2 className="journey__title">
            <span className="serif">The</span> Knight&rsquo;s Journey
          </h2>
          <p className="journey__note">
            Move the knight in an L across the board, or pick a destination and it will take the shortest legal route.
          </p>
        </div>

        <div className={`journey__card ${here ? 'is-arrived' : ''}`}>
          {here ? (
            <>
              <p className="label label--accent">
                Arrived · {here.sq} · {here.mark}
              </p>
              <h3 className="journey__card-title">{here.title}</h3>
              <p className="journey__card-text">{here.short}</p>
              {here.about ? (
                <SectionLink id="about" className="btn btn--solid">
                  Read about Riti <span aria-hidden="true">→</span>
                </SectionLink>
              ) : (
                <Link to={`/work/${here.project.slug}`} viewTransition className="btn btn--solid">
                  Open case study <span aria-hidden="true">→</span>
                </Link>
              )}
            </>
          ) : (
            <p className="journey__card-text">
              Five squares are marked: four projects and About. Land on one to open it.
            </p>
          )}
        </div>

        <ol className="journey__list" aria-label="Destinations">
          {DESTS.map((d) => {
            const steps = route(pos, d.sq).length - 1;
            return (
              <li key={d.sq}>
                <button
                  type="button"
                  className={`journey__dest ${pos === d.sq ? 'is-here' : ''}`}
                  onClick={() => travel(d)}
                  onPointerEnter={() => setPreview(d.sq)}
                  onPointerLeave={() => setPreview(null)}
                  onFocus={() => setPreview(d.sq)}
                  onBlur={() => setPreview(null)}
                  aria-disabled={moving}
                >
                  <span className="label">{d.mark}</span>
                  <span className="journey__dest-title">{d.about ? 'About' : d.project.shortTitle}</span>
                  <span className="journey__dest-meta label">
                    {d.sq} · {steps === 0 ? 'here' : `${steps} move${steps === 1 ? '' : 's'}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
