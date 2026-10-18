import { useEffect, useMemo, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';

// Illustrative graph with synthetic IDs — not data from the project.
const NODES = {
  P01: [60, 190],
  P02: [175, 105],
  P03: [175, 275],
  P04: [295, 55],
  P05: [295, 190],
  P06: [295, 325],
  P07: [420, 85],
  P08: [420, 215],
  P09: [420, 330],
  P10: [545, 150],
  P11: [545, 290],
};
// Directed, acyclic connections: person_a → person_b
const EDGES = [
  ['P01', 'P02'], ['P01', 'P03'], ['P02', 'P04'], ['P02', 'P05'], ['P03', 'P05'],
  ['P03', 'P06'], ['P04', 'P07'], ['P05', 'P08'], ['P06', 'P09'], ['P08', 'P10'],
  ['P07', 'P10'], ['P11', 'P06'], ['P11', 'P09'],
];
const MAX_DEPTH = 5; // WHERE n.depth < 5

// Mirrors the recursive CTE: each row is extended by every outgoing
// connection until the depth limit; a person reachable by two routes
// appears once per route.
function walk(start) {
  const rows = [{ id: start, depth: 0, path: [start] }];
  let frontier = rows;
  for (let d = 0; d < MAX_DEPTH; d += 1) {
    const next = [];
    for (const r of frontier) {
      for (const [a, b] of EDGES) {
        if (a === r.id) next.push({ id: b, depth: d + 1, path: [...r.path, b] });
      }
    }
    if (!next.length) break;
    rows.push(...next);
    frontier = next;
  }
  return rows;
}

function Graph({ reached = new Set(), hot = new Set(), start, onPick, tile = false }) {
  return (
    <svg
      className={`viz viz--nexus ${tile ? 'viz--tile' : ''}`}
      viewBox="0 0 600 380"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden={tile ? 'true' : undefined}
      role={tile ? undefined : 'group'}
      aria-label={tile ? undefined : 'Network graph. Choose a starting person.'}
    >
      <defs>
        <marker id={`arrow-${tile ? 't' : 'i'}`} viewBox="0 0 8 8" refX="15" refY="4" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="currentColor" />
        </marker>
      </defs>
      {EDGES.map(([a, b]) => {
        const [x1, y1] = NODES[a];
        const [x2, y2] = NODES[b];
        const on = hot.has(`${a}-${b}`);
        return (
          <line
            key={`${a}-${b}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className={`viz-nexus__edge ${on ? 'is-on' : ''}`}
            markerEnd={`url(#arrow-${tile ? 't' : 'i'})`}
          />
        );
      })}
      {Object.entries(NODES).map(([id, [x, y]]) => {
        const cls = id === start ? 'is-start' : reached.has(id) ? 'is-reached' : '';
        const body = (
          <>
            <rect x={x - 22} y={y - 13} width="44" height="26" className={`viz-nexus__node ${cls}`} />
            <text x={x} y={y + 4} textAnchor="middle" className="viz-mono viz-nexus__label">
              {id}
            </text>
          </>
        );
        if (!onPick) return <g key={id}>{body}</g>;
        return (
          <g
            key={id}
            role="button"
            tabIndex={0}
            aria-label={`Start from ${id}`}
            aria-pressed={id === start}
            className="viz-nexus__pick"
            onClick={() => onPick(id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPick(id);
              }
            }}
          >
            {body}
          </g>
        );
      })}
    </svg>
  );
}

const TILE_PATH = ['P01', 'P03', 'P05', 'P08', 'P10'];

export function NexusTile() {
  const hot = new Set(TILE_PATH.slice(1).map((b, i) => `${TILE_PATH[i]}-${b}`));
  return <Graph tile start="P01" reached={new Set(TILE_PATH)} hot={hot} />;
}

export function NexusInteractive() {
  const reduced = usePrefersReducedMotion();
  const [start, setStart] = useState('P01');
  const [shown, setShown] = useState(MAX_DEPTH);
  const rows = useMemo(() => walk(start), [start]);
  const maxD = rows.at(-1).depth;

  // Step through depths one at a time after each new start.
  useEffect(() => {
    if (reduced || shown >= maxD) return undefined;
    const t = setTimeout(() => setShown((s) => s + 1), 650);
    return () => clearTimeout(t);
  }, [shown, maxD, reduced]);

  const pick = (id) => {
    setStart(id);
    setShown(reduced ? MAX_DEPTH : 0);
  };

  const visible = rows.filter((r) => r.depth <= shown);
  const reached = new Set(visible.map((r) => r.id));
  const hot = new Set();
  visible.forEach((r) => r.path.slice(1).forEach((b, i) => hot.add(`${r.path[i]}-${b}`)));

  return (
    <div className="walk">
      <div className="walk__graph">
        <Graph start={start} reached={reached} hot={hot} onPick={pick} />
        <p className="label walk__hint">Select a node to start from it · edges are person_a → person_b</p>
      </div>
      <div className="walk__result">
        <div className="walk__head">
          <p className="label" aria-live="polite">
            Result · {visible.length} row{visible.length === 1 ? '' : 's'} · depth ≤ {Math.min(shown, maxD)}
          </p>
          <button type="button" className="btn btn--ghost" onClick={() => pick(start)}>
            Replay
          </button>
        </div>
        <div className="walk__table-wrap">
          <table className="walk__table">
            <caption className="sr-only">Rows returned by the network walk from {start}</caption>
            <thead>
              <tr>
                <th scope="col">depth</th>
                <th scope="col">person</th>
                <th scope="col">path</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.path.join('>')}>
                  <td>{r.depth}</td>
                  <td>{r.id}</td>
                  <td>{r.path.join(' → ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="walk__note">
          A person reachable by two routes appears once per route, just as in the SQL result. Start from P11 to see how
          direction limits the walk.
        </p>
      </div>
    </div>
  );
}
