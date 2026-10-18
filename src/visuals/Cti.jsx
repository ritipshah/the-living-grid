import { useState } from 'react';

// The scoring rule from server/server.js → updateRisk():
//   risk = COUNT(events WHERE status = 'FAILED') * 10, capped at 100.
const riskFor = (failed) => Math.min(100, failed * 10);

// Dashboard colour bands from public/dashboard.html (> 40, > 70).
const band = (s) => (s > 70 ? 'high' : s > 40 ? 'mid' : 'low');

// Three illustrative user lanes; F = failed, S = success.
const LANES = [
  'SFFSFFFFSFFS',
  'SSFSSSSFSSSS',
  'SFFFFSFFFFFS',
];

export function CtiTile() {
  return (
    <svg className="viz viz--cti" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect width="400" height="300" fill="#0e0e0e" />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={40 + i * 42} x2={40 + i * 42} y1="0" y2="300" stroke="#1d1d1c" />
      ))}
      <text x="22" y="294" className="viz-mono" fill="#7b776f">
        security_events · per user
      </text>
      {LANES.map((lane, li) => {
        let failed = 0;
        const y = 56 + li * 50;
        return (
          <g key={li} className="viz-cti__lane" style={{ '--d': `${li * 120}ms` }}>
            <text x="22" y={y + 4} className="viz-mono" fill="#a29d95">
              u{li + 1}
            </text>
            {lane.split('').map((c, i) => {
              if (c === 'F') failed += 1;
              const x = 56 + i * 25;
              return c === 'F' ? (
                <rect key={i} x={x} y={y - 8} width="14" height="14" fill="#e8590c" className="viz-cti__tick" />
              ) : (
                <rect key={i} x={x + 0.5} y={y - 7.5} width="13" height="13" fill="none" stroke="#ece8e1" className="viz-cti__tick" />
              );
            })}
            <text x="384" y={y + 4} textAnchor="end" className="viz-mono" fill={riskFor(failed) > 70 ? '#e8590c' : '#ece8e1'}>
              {riskFor(failed)}
            </text>
          </g>
        );
      })}
      {/* Stepped risk line for lane 3 */}
      <path
        className="viz-cti__step"
        d={(() => {
          let f = 0;
          let d = 'M56 270';
          LANES[2].split('').forEach((c, i) => {
            if (c === 'F') f += 1;
            const y = 270 - riskFor(f) * 0.8;
            d += ` H${56 + i * 25} V${y}`;
          });
          return `${d} H384`;
        })()}
        fill="none"
        stroke="#e8590c"
        strokeWidth="2"
      />
      <line x1="56" x2="384" y1="190" y2="190" stroke="#2c2b29" strokeDasharray="3 4" />
      <text x="384" y="184" textAnchor="end" className="viz-mono" fill="#7b776f">
        cap 100
      </text>
    </svg>
  );
}

export function CtiInteractive() {
  const [events, setEvents] = useState([
    { id: 1, ok: true },
    { id: 2, ok: false },
    { id: 3, ok: false },
  ]);
  const failed = events.filter((e) => !e.ok).length;
  const score = riskFor(failed);
  const add = (ok) => setEvents((ev) => [...ev, { id: (ev.at(-1)?.id ?? 0) + 1, ok }]);

  return (
    <div className="ledger">
      <div className="ledger__controls">
        <button type="button" className="btn btn--solid" onClick={() => add(false)}>
          + Failed attempt
        </button>
        <button type="button" className="btn" onClick={() => add(true)}>
          + Successful attempt
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => setEvents([])}>
          Reset
        </button>
      </div>

      <div className="ledger__body">
        <div className="ledger__table-wrap">
          <table className="ledger__table">
            <caption className="sr-only">Simulated security_events rows for one user</caption>
            <thead>
              <tr>
                <th scope="col">event_id</th>
                <th scope="col">event_type</th>
                <th scope="col">severity</th>
                <th scope="col">status</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="ledger__empty">
                    No events yet. Add an attempt.
                  </td>
                </tr>
              )}
              {events.slice(-8).map((e) => (
                <tr key={e.id} className={e.ok ? '' : 'is-failed'}>
                  <td>{String(e.id).padStart(3, '0')}</td>
                  <td>{e.ok ? 'SUCCESSFUL_LOGIN' : 'FAILED_LOGIN'}</td>
                  <td>{e.ok ? 'LOW' : 'HIGH'}</td>
                  <td>{e.ok ? 'SUCCESS' : 'FAILED'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length > 8 && <p className="ledger__more label">+ {events.length - 8} earlier rows</p>}
        </div>

        <div className={`ledger__score ledger__score--${band(score)}`}>
          <p className="label">risk_scores.current_score</p>
          <p className="ledger__num" aria-live="polite">
            {score}
            <span className="sr-only"> out of 100</span>
          </p>
          <div className="ledger__gauge" aria-hidden="true">
            <span style={{ width: `${score}%` }} />
            <i style={{ left: '40%' }} />
            <i style={{ left: '70%' }} />
          </div>
          <p className="ledger__formula">
            min(100, 10 × <b>{failed}</b> failed) = <b>{score}</b>
          </p>
          <p className="ledger__bands label">Dashboard bands: ≤ 40 · 41–70 · &gt; 70</p>
        </div>
      </div>
    </div>
  );
}
