import { memo } from 'react';
import { ROWS, T_MAX } from '../data/firesense.js';
import { EDGES, NODES } from '../data/nexus-graph.js';

// Technical "frames" for the contact sheet. Each one is drawn from a real
// source and labelled with it:
//   · Firesense frames plot the captured session from the project repository.
//   · CTI frames apply the repository's scoring rule to illustrative events.
//   · Nexus frames draw the illustrative, synthetic-ID graph used in the case study.
//   · Legal frames are illustrations (no project data is public).

const C = {
  bg: '#0e0e0e',
  grid: '#1d1d1c',
  line: '#2c2b29',
  bone: '#ece8e1',
  ash: '#7b776f',
  dim: '#4a4741',
  orange: '#e8590c',
};

// Deterministic pseudo-random sequence (same picture on every load).
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const GAS_MIN = Math.min(...ROWS.map((r) => r.gas));
const GAS_MAX = Math.max(...ROWS.map((r) => r.gas));
const range = (key) => {
  const v = ROWS.map((r) => r[key]);
  return [Math.min(...v), Math.max(...v)];
};
const linePath = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

function Grid({ w, h, step = 40 }) {
  const lines = [];
  for (let x = step; x < w; x += step) lines.push(<line key={`x${x}`} x1={x} x2={x} y1="0" y2={h} stroke={C.grid} />);
  for (let y = step; y < h; y += step) lines.push(<line key={`y${y}`} x1="0" x2={w} y1={y} y2={y} stroke={C.grid} />);
  return <g>{lines}</g>;
}

/* ── CTI ─────────────────────────────────────────────────────────── */
function Ledger({ w, h }) {
  const r = rng(11);
  const size = 11;
  const gap = 7;
  const cols = Math.floor((w - 40) / (size + gap));
  const rows = Math.floor((h - 30) / (size + gap * 1.6));
  const out = [];
  for (let j = 0; j < rows; j += 1) {
    const p = 0.1 + r() * 0.55; // each user fails at their own rate
    const y = 22 + j * (size + gap * 1.6);
    for (let i = 0; i < cols; i += 1) {
      const x = 30 + i * (size + gap);
      const failed = r() < p;
      out.push(
        failed ? (
          <rect key={`${i}-${j}`} x={x} y={y} width={size} height={size} fill={C.orange} />
        ) : (
          <rect key={`${i}-${j}`} x={x + 0.5} y={y + 0.5} width={size - 1} height={size - 1} fill="none" stroke={C.ash} />
        ),
      );
    }
    out.push(<rect key={`k${j}`} x="12" y={y + 3} width="8" height="5" fill={C.dim} />);
  }
  return <g>{out}</g>;
}

function RiskSteps({ w, h }) {
  const r = rng(5);
  const pad = 18;
  const y = (v) => h - pad - (v / 100) * (h - pad * 3);
  const users = [0.55, 0.35, 0.2, 0.12, 0.06];
  const steps = 22;
  return (
    <g>
      {[40, 70, 100].map((v) => (
        <line key={v} x1={pad} x2={w - pad} y1={y(v)} y2={y(v)} stroke={v === 100 ? C.ash : C.line} strokeDasharray="3 4" />
      ))}
      {users.map((p, u) => {
        let failed = 0;
        const pts = [[pad, y(0)]];
        for (let i = 1; i <= steps; i += 1) {
          if (r() < p) failed += 1;
          const x = pad + (i / steps) * (w - pad * 2);
          pts.push([x, pts.at(-1)[1]], [x, y(Math.min(100, failed * 10))]);
        }
        return <path key={u} d={linePath(pts)} fill="none" stroke={u === 0 ? C.orange : u === 1 ? C.bone : C.ash} strokeWidth={u === 0 ? 2 : 1.2} />;
      })}
    </g>
  );
}

/* ── Nexus ───────────────────────────────────────────────────────── */
const PATH = ['P01', 'P03', 'P05', 'P08', 'P10'];
const onPath = (a, b) => PATH.some((p, i) => p === a && PATH[i + 1] === b);

function NetworkFrame({ w, h }) {
  const tall = h > w;
  // Lay the graph across the long side of the frame.
  const [gw, gh] = tall ? [380, 600] : [600, 380];
  const s = Math.min(w / gw, h / gh) * 0.92;
  const ox = (w - gw * s) / 2;
  const oy = (h - gh * s) / 2;
  const at = (id) => {
    const [x, y] = NODES[id];
    return tall ? [ox + y * s, oy + x * s] : [ox + x * s, oy + y * s];
  };
  return (
    <g>
      {EDGES.map(([a, b]) => {
        const [x1, y1] = at(a);
        const [x2, y2] = at(b);
        const hot = onPath(a, b);
        return <line key={a + b} x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot ? C.orange : C.ash} strokeWidth={hot ? 2 : 1} />;
      })}
      {Object.keys(NODES).map((id) => {
        const [x, y] = at(id);
        const hot = PATH.includes(id);
        return (
          <g key={id}>
            <rect x={x - 7} y={y - 7} width="14" height="14" fill={hot ? C.orange : C.bg} stroke={hot ? C.orange : C.bone} />
            <text x={x + 11} y={y + 4} fontSize="9" fill={C.ash} fontFamily="IBM Plex Mono, monospace">
              {id}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Matrix({ w, h }) {
  const ids = Object.keys(NODES);
  const n = ids.length;
  const size = Math.min(w, h) - 48;
  const cell = size / n;
  const ox = (w - size) / 2 + 8;
  const oy = (h - size) / 2 + 8;
  const has = new Set(EDGES.map(([a, b]) => `${a}>${b}`));
  const cells = [];
  ids.forEach((a, i) =>
    ids.forEach((b, j) => {
      const edge = has.has(`${a}>${b}`);
      cells.push(
        <rect
          key={`${a}${b}`}
          x={ox + j * cell + 1}
          y={oy + i * cell + 1}
          width={cell - 2}
          height={cell - 2}
          fill={edge ? (onPath(a, b) ? C.orange : C.bone) : i === j ? C.line : '#161616'}
        />,
      );
    }),
  );
  return (
    <g>
      {cells}
      {ids.map((id, i) => (
        <text key={id} x={ox - 6} y={oy + i * cell + cell / 2 + 3} textAnchor="end" fontSize="7" fill={C.ash} fontFamily="IBM Plex Mono, monospace">
          {id.slice(1)}
        </text>
      ))}
    </g>
  );
}

/* ── Firesense (captured data) ───────────────────────────────────── */
function GasTrace({ w, h }) {
  const pad = 16;
  const strip = 14;
  const x = (t) => pad + (t / T_MAX) * (w - pad * 2);
  const y = (g) => h - pad - strip - 10 - ((g - GAS_MIN) / (GAS_MAX - GAS_MIN)) * (h - pad * 2 - strip - 20);
  const ys = (s) => h - pad - strip - 10 - (s / 100) * (h - pad * 2 - strip - 20);
  return (
    <g>
      <Grid w={w} h={h} step={32} />
      <path d={linePath(ROWS.map((r) => [x(r.t), ys(r.score)]))} fill="none" stroke={C.orange} strokeWidth="1.2" />
      <path d={linePath(ROWS.map((r) => [x(r.t), y(r.gas)]))} fill="none" stroke={C.bone} strokeWidth="1.5" />
      {ROWS.map((r, i) =>
        r.level ? (
          <rect key={i} x={x(r.t)} y={h - pad - strip} width={Math.max(1.5, (w - pad * 2) / ROWS.length + 0.5)} height={strip} fill={r.level === 2 ? C.orange : C.ash} />
        ) : null,
      )}
    </g>
  );
}

function Climate({ w, h }) {
  const pad = 16;
  const half = (h - pad * 3) / 2;
  const x = (t) => pad + (t / T_MAX) * (w - pad * 2);
  const panel = (key, top, stroke) => {
    const [lo, hi] = range(key);
    const y = (v) => top + half - ((v - lo) / (hi - lo)) * (half - 8);
    return <path d={linePath(ROWS.map((r) => [x(r.t), y(r[key])]))} fill="none" stroke={stroke} strokeWidth="1.4" />;
  };
  return (
    <g>
      {ROWS.map((r, i) =>
        r.level === 2 ? <rect key={i} x={x(r.t)} y={pad} width="2.2" height={h - pad * 2} fill={C.orange} opacity="0.16" /> : null,
      )}
      <line x1={pad} x2={w - pad} y1={pad + half + pad / 2} y2={pad + half + pad / 2} stroke={C.line} />
      {panel('temp', pad, C.bone)}
      {panel('hum', pad * 2 + half, C.ash)}
    </g>
  );
}

function Barcode({ w, h }) {
  const pad = 14;
  const bw = (w - pad * 2) / ROWS.length;
  return (
    <g>
      {ROWS.map((r, i) => {
        const bh = Math.max(2, (r.score / 100) * (h - pad * 2));
        return (
          <rect
            key={i}
            x={pad + i * bw}
            y={h - pad - bh}
            width={Math.max(0.6, bw - 0.4)}
            height={bh}
            fill={r.level === 2 ? C.orange : r.level === 1 ? C.bone : C.dim}
          />
        );
      })}
    </g>
  );
}

function Samples({ w, h }) {
  const n = ROWS.length;
  const cols = Math.max(4, Math.round(Math.sqrt((n * w) / h)));
  const rows = Math.ceil(n / cols);
  const cw = w / cols;
  const ch = h / rows;
  const rMax = Math.min(cw, ch) * 0.48;
  return (
    <g>
      {ROWS.map((r, i) => {
        const k = (r.gas - GAS_MIN) / (GAS_MAX - GAS_MIN);
        return (
          <circle
            key={i}
            cx={(i % cols) * cw + cw / 2}
            cy={Math.floor(i / cols) * ch + ch / 2}
            r={Math.max(0.9, 0.9 + k * rMax)}
            fill={r.level === 2 ? C.orange : r.level === 1 ? C.bone : C.ash}
            opacity={r.level ? 1 : 0.55}
          />
        );
      })}
    </g>
  );
}

/* ── Legal NLP (illustration) ────────────────────────────────────── */
function textBars(seed, n, x, y, width, lineH, picked) {
  const r = rng(seed);
  const out = [];
  let yy = y;
  for (let i = 0; i < n; i += 1) {
    if (i && i % 6 === 0) yy += lineH * 0.8;
    const wl = i % 6 === 5 ? width * (0.35 + r() * 0.3) : width * (0.78 + r() * 0.22);
    out.push(<rect key={i} x={x} y={yy} width={wl} height={Math.max(2, lineH * 0.42)} fill={picked.has(i) ? C.orange : C.dim} />);
    yy += lineH;
  }
  return out;
}

function SourceText({ w, h }) {
  const pw = Math.min(w - 40, 260);
  const px = (w - pw) / 2;
  const lineH = 11;
  const n = Math.floor((h - 60) / lineH) - 3;
  return (
    <g>
      <rect x={px} y="18" width={pw} height={h - 36} fill="#161616" stroke={C.line} />
      <rect x={px + 14} y="32" width={pw * 0.4} height="5" fill={C.ash} />
      {textBars(3, n, px + 14, 52, pw - 28, lineH, new Set([2, 7, 9, 15, 20, 26, 31]))}
    </g>
  );
}

function Condense({ w, h }) {
  const tall = h > w;
  const lineH = 9;
  if (tall) {
    const pw = w - 40;
    const docH = h * 0.56;
    const n = Math.floor((docH - 24) / lineH) - 2;
    const sy = docH + 60;
    return (
      <g>
        <rect x="20" y="16" width={pw} height={docH} fill="#161616" stroke={C.line} />
        {textBars(9, n, 32, 30, pw - 24, lineH, new Set([1, 5, 8, 13, 17, 22]))}
        <line x1={w / 2} x2={w / 2} y1={docH + 22} y2={sy - 8} stroke={C.orange} strokeWidth="1.5" />
        <rect x="34" y={sy} width={pw - 28} height={h - sy - 18} fill={C.bone} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="46" y={sy + 14 + i * 12} width={i === 3 ? (pw - 52) * 0.5 : pw - 52} height="4" fill="#0b0b0b" />
        ))}
      </g>
    );
  }
  const docW = w * 0.5;
  const n = Math.floor((h - 50) / lineH) - 1;
  const sx = docW + 56;
  return (
    <g>
      <rect x="18" y="16" width={docW} height={h - 32} fill="#161616" stroke={C.line} />
      {textBars(9, n, 30, 30, docW - 24, lineH, new Set([1, 5, 8, 13, 17, 22]))}
      <line x1={docW + 26} x2={sx - 8} y1={h / 2} y2={h / 2} stroke={C.orange} strokeWidth="1.5" />
      <rect x={sx} y={h / 2 - 34} width={w - sx - 18} height="68" fill={C.bone} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={sx + 12} y={h / 2 - 22 + i * 12} width={i === 3 ? (w - sx - 42) * 0.5 : w - sx - 42} height="4" fill="#0b0b0b" />
      ))}
    </g>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const FRAMES = {
  ledger: { no: '01', title: 'Login ledger', source: 'CTI · illustrative events', Draw: Ledger },
  risk: { no: '02', title: 'Risk steps', source: 'CTI · scoring rule', Draw: RiskSteps },
  graph: { no: '03', title: 'Network walk', source: 'Nexus · synthetic IDs', Draw: NetworkFrame },
  matrix: { no: '04', title: 'Adjacency', source: 'Nexus · synthetic IDs', Draw: Matrix },
  gas: { no: '05', title: 'Gas trace', source: 'Firesense · captured data', Draw: GasTrace },
  climate: { no: '06', title: 'Temp + humidity', source: 'Firesense · captured data', Draw: Climate },
  barcode: { no: '07', title: 'Engine level', source: 'Firesense · captured data', Draw: Barcode },
  samples: { no: '08', title: '410 samples', source: 'Firesense · captured data', Draw: Samples },
  source: { no: '09', title: 'Source text', source: 'Legal NLP · illustration', Draw: SourceText },
  condense: { no: '10', title: 'Condensation', source: 'Legal NLP · illustration', Draw: Condense },
};

// One frame rendered at a fixed design size; CSS scales it to the tile.
export const TechFrame = memo(function TechFrame({ name, w = 340, h = 260, className = '' }) {
  const { Draw } = FRAMES[name];
  return (
    <svg
      className={`frame-svg ${className}`}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <rect width={w} height={h} fill={C.bg} />
      <Draw w={w} h={h} />
    </svg>
  );
});
