import { useMemo, useRef, useState } from 'react';
import { ROWS, T_MAX } from '../data/firesense.js';

const GAS_MAX = 1500;
const LEVELS = ['Normal', 'Warning', 'Critical'];
const NAIVE_PPM = 450; // NAIVE_GAS_THRESHOLD_PPM in config.py

function linePath(rows, x, y, key) {
  return rows.map((r, i) => `${i ? 'L' : 'M'}${x(r.t).toFixed(1)} ${y(r[key]).toFixed(1)}`).join(' ');
}

// Contiguous runs where predicate holds → [{from, to, value}]
function runs(rows, get) {
  const out = [];
  let cur = null;
  rows.forEach((r, i) => {
    const v = get(r);
    if (cur && cur.value === v) {
      cur.to = rows[Math.min(i + 1, rows.length - 1)].t;
    } else {
      if (cur) out.push(cur);
      cur = { from: r.t, to: rows[Math.min(i + 1, rows.length - 1)].t, value: v };
    }
  });
  if (cur) out.push(cur);
  return out;
}

export function FiresenseTile() {
  const x = (t) => 10 + (t / T_MAX) * 380;
  const y = (g) => 210 - (g / GAS_MAX) * 170;
  const levelRuns = runs(ROWS, (r) => r.level);
  return (
    <svg className="viz viz--fire" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect width="400" height="300" fill="#0e0e0e" />
      {[0, 500, 1000].map((g) => (
        <line key={g} x1="10" x2="390" y1={y(g)} y2={y(g)} stroke="#1f1f1e" />
      ))}
      <line x1="10" x2="390" y1={y(NAIVE_PPM)} y2={y(NAIVE_PPM)} stroke="#7b776f" strokeDasharray="3 4" />
      <path d={linePath(ROWS, x, y, 'gas')} fill="none" stroke="#ece8e1" strokeWidth="1.4" className="viz-fire__line" />
      {levelRuns.map((r) => (
        <rect
          key={r.from}
          x={x(r.from)}
          width={Math.max(1, x(r.to) - x(r.from))}
          y="236"
          height="18"
          fill={r.value === 2 ? '#e8590c' : r.value === 1 ? '#7b776f' : '#262625'}
        />
      ))}
      <text x="10" y="276" className="viz-mono" fill="#7b776f">
        gas ppm · level · 10 min capture
      </text>
    </svg>
  );
}

const W = 1000;
const PAD_L = 64;
const PAD_R = 56;
const TOP = 24;
const GAS_B = 300;

export function FiresenseInteractive() {
  const [idx, setIdx] = useState(null);
  const svgRef = useRef(null);

  const x = (t) => PAD_L + (t / T_MAX) * (W - PAD_L - PAD_R);
  const yGas = (g) => GAS_B - (g / GAS_MAX) * (GAS_B - TOP);
  const yScore = (s) => GAS_B - (s / 100) * (GAS_B - TOP);

  const stats = useMemo(() => {
    const count = [0, 0, 0];
    ROWS.forEach((r) => (count[r.level] += 1));
    return {
      samples: ROWS.length,
      peak: Math.max(...ROWS.map((r) => r.gas)),
      count,
      cooking: ROWS.filter((r) => r.sig === 'cooking').length,
      leak: ROWS.filter((r) => r.sig === 'leak').length,
    };
  }, []);

  const levelRuns = useMemo(() => runs(ROWS, (r) => r.level), []);
  const sigRuns = useMemo(() => runs(ROWS, (r) => r.sig).filter((r) => r.value === 'cooking' || r.value === 'leak'), []);

  const nearest = (t) => {
    let best = 0;
    for (let i = 1; i < ROWS.length; i += 1) if (Math.abs(ROWS[i].t - t) < Math.abs(ROWS[best].t - t)) best = i;
    return best;
  };

  const onMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const t = ((px - PAD_L) / (W - PAD_L - PAD_R)) * T_MAX;
    setIdx(nearest(Math.max(0, Math.min(T_MAX, t))));
  };

  const onKey = (e) => {
    const step = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowRight') setIdx((i) => Math.min(ROWS.length - 1, (i ?? -1) + step));
    else if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, (i ?? 1) - step));
    else if (e.key === 'Home') setIdx(0);
    else if (e.key === 'End') setIdx(ROWS.length - 1);
    else return;
    e.preventDefault();
  };

  const r = idx != null ? ROWS[idx] : null;
  const fmtT = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;

  return (
    <figure className="chart">
      <ul className="chart__stats">
        <li>
          <span className="label">Samples</span>
          <b>{stats.samples}</b>
        </li>
        <li>
          <span className="label">Duration</span>
          <b>{fmtT(T_MAX)}</b>
        </li>
        <li>
          <span className="label">Peak gas (compensated)</span>
          <b>{Math.round(stats.peak)} ppm</b>
        </li>
        <li>
          <span className="label">Samples by level</span>
          <b>
            {stats.count[0]} / {stats.count[1]} / <em>{stats.count[2]}</em>
          </b>
        </li>
      </ul>

      <div
        className="chart__plot"
        tabIndex={0}
        role="group"
        aria-label="Firesense captured session chart. Use left and right arrow keys to read samples."
        onKeyDown={onKey}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setIdx(null)}
      >
        <svg ref={svgRef} viewBox={`0 0 ${W} 430`} className="viz viz--chart" aria-hidden="true">
          {[0, 250, 500, 750, 1000, 1250, 1500].map((g) => (
            <g key={g}>
              <line x1={PAD_L} x2={W - PAD_R} y1={yGas(g)} y2={yGas(g)} stroke="#232322" />
              <text x={PAD_L - 10} y={yGas(g) + 4} textAnchor="end" className="viz-mono viz-axis">
                {g}
              </text>
            </g>
          ))}
          {[0, 50, 100].map((s) => (
            <text key={s} x={W - PAD_R + 10} y={yScore(s) + 4} className="viz-mono viz-axis viz-axis--accent">
              {s}
            </text>
          ))}
          <text x={PAD_L - 10} y={TOP - 10} textAnchor="end" className="viz-mono viz-axis">
            ppm
          </text>
          <text x={W - PAD_R + 10} y={TOP - 10} className="viz-mono viz-axis viz-axis--accent">
            score
          </text>

          <line x1={PAD_L} x2={W - PAD_R} y1={yGas(NAIVE_PPM)} y2={yGas(NAIVE_PPM)} stroke="#a29d95" strokeDasharray="4 5" />
          <text x={PAD_L + 6} y={yGas(NAIVE_PPM) - 6} className="viz-mono viz-axis">
            fixed 450 ppm threshold
          </text>

          <path d={linePath(ROWS, x, yGas, 'gas')} fill="none" stroke="#ece8e1" strokeWidth="1.6" />
          <path d={linePath(ROWS, x, yScore, 'score')} fill="none" stroke="#e8590c" strokeWidth="1.6" />

          <text x={PAD_L - 10} y={GAS_B + 37} textAnchor="end" className="viz-mono viz-axis">
            level
          </text>
          {levelRuns.map((lr) => (
            <rect
              key={lr.from}
              x={x(lr.from)}
              width={Math.max(1, x(lr.to) - x(lr.from))}
              y={GAS_B + 24}
              height="18"
              className={`viz-level viz-level--${lr.value}`}
            />
          ))}
          <text x={PAD_L - 10} y={GAS_B + 67} textAnchor="end" className="viz-mono viz-axis">
            pattern
          </text>
          <rect x={PAD_L} width={W - PAD_L - PAD_R} y={GAS_B + 54} height="18" fill="#141414" />
          {sigRuns.map((sr) => (
            <rect
              key={sr.from}
              x={x(sr.from)}
              width={Math.max(2, x(sr.to) - x(sr.from))}
              y={GAS_B + 54}
              height="18"
              className={`viz-sig viz-sig--${sr.value}`}
            />
          ))}
          {[0, 120, 240, 360, 480, 600].map((t) => (
            <text key={t} x={x(t)} y={GAS_B + 100} textAnchor="middle" className="viz-mono viz-axis">
              {t / 60} min
            </text>
          ))}

          {r && (
            <g>
              <line x1={x(r.t)} x2={x(r.t)} y1={TOP} y2={GAS_B + 72} stroke="#ece8e1" strokeWidth="1" />
              <circle cx={x(r.t)} cy={yGas(r.gas)} r="5" fill="#0b0b0b" stroke="#ece8e1" strokeWidth="2" />
              <circle cx={x(r.t)} cy={yScore(r.score)} r="5" fill="#0b0b0b" stroke="#e8590c" strokeWidth="2" />
            </g>
          )}
        </svg>
      </div>

      <div className="chart__readout" aria-live="polite">
        {r ? (
          <dl>
            <div><dt>t</dt><dd>{fmtT(r.t)}</dd></div>
            <div><dt>gas</dt><dd>{r.gas} ppm</dd></div>
            <div><dt>temp</dt><dd>{r.temp} °C</dd></div>
            <div><dt>humidity</dt><dd>{r.hum} %</dd></div>
            <div><dt>score</dt><dd className="is-accent">{r.score}</dd></div>
            <div><dt>level</dt><dd>{LEVELS[r.level]}</dd></div>
            <div><dt>pattern</dt><dd>{r.sig}{r.sup ? ' · suppressed' : ''}</dd></div>
          </dl>
        ) : (
          <p className="label">Hover or tap the chart to read a sample; when it has focus, the arrow keys step through it. On a phone it also scrolls sideways.</p>
        )}
      </div>

      <ul className="chart__legend label">
        <li><i className="k k--gas" /> Compensated gas (ppm)</li>
        <li><i className="k k--score" /> Fusion score (0–100)</li>
        <li><i className="k k--warn" /> Warning</li>
        <li><i className="k k--crit" /> Critical</li>
        <li><i className="k k--cook" /> Cooking pattern ({stats.cooking})</li>
        <li><i className="k k--leak" /> Leak pattern ({stats.leak})</li>
      </ul>

      <figcaption className="sr-only">
        Ten-minute capture with {stats.samples} samples. Gas peaks at {Math.round(stats.peak)} ppm. The engine
        reported {stats.count[0]} normal, {stats.count[1]} warning and {stats.count[2]} critical samples.
      </figcaption>

      <details className="chart__table">
        <summary className="label">View as a table (one row every ~30 s)</summary>
        <div className="chart__table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">t</th>
                <th scope="col">gas ppm</th>
                <th scope="col">temp °C</th>
                <th scope="col">humidity %</th>
                <th scope="col">score</th>
                <th scope="col">level</th>
                <th scope="col">pattern</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.filter((_, i) => i % 20 === 0).map((row) => (
                <tr key={row.t}>
                  <td>{fmtT(row.t)}</td>
                  <td>{row.gas}</td>
                  <td>{row.temp}</td>
                  <td>{row.hum}</td>
                  <td>{row.score}</td>
                  <td>{LEVELS[row.level]}</td>
                  <td>{row.sig}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
