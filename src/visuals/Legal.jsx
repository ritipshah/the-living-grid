import { useRef, useState } from 'react';

// Deterministic "sentences": widths in %, with paragraph breaks.
const DOC = (() => {
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const lines = [];
  const paras = [5, 6, 4, 7, 5, 6];
  paras.forEach((n, p) => {
    for (let i = 0; i < n; i += 1) {
      lines.push({ w: i === n - 1 ? 38 + rand() * 30 : 78 + rand() * 22, p });
    }
  });
  return lines;
})();
// Sentences an extractive stage might select (illustrative).
const PICKED = new Set([1, 6, 9, 13, 17, 22, 26, 30]);

const STAGES = [
  { id: 'source', label: 'Source', note: 'A long legal document: dense, structured, repetitive.' },
  { id: 'extract', label: 'Extract', note: 'An extractive model selects the sentences that carry the key information.' },
  { id: 'abstract', label: 'Abstract', note: 'An abstractive model rewrites the selection as a short, readable summary.' },
];

// Pre-computed line positions for the tile's document page.
const TILE_LINES = (() => {
  let y = 44;
  return DOC.slice(0, 26).map((l, i) => {
    if (i > 0 && DOC[i - 1].p !== l.p) y += 5;
    const at = y;
    y += 7;
    return { ...l, y: at, picked: PICKED.has(i) };
  });
})();

export function LegalTile() {
  return (
    <svg className="viz viz--legal" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect width="400" height="300" fill="#171717" />
      <rect x="34" y="26" width="168" height="250" fill="#1f1f1e" stroke="#2c2b29" />
      {TILE_LINES.map((l, i) => (
        <rect key={i} x="46" y={l.y} width={(l.w / 100) * 144} height="3" fill={l.picked ? '#e8590c' : '#5b5853'} className="viz-legal__line" />
      ))}
      <path d="M214 150 H252" stroke="#e8590c" strokeWidth="2" className="viz-legal__arrow" />
      <path d="M246 144 L254 150 L246 156" fill="none" stroke="#e8590c" strokeWidth="2" />
      <rect x="264" y="106" width="104" height="88" fill="#ece8e1" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="276" y={122 + i * 13} width={i === 4 ? 46 : 80} height="4" fill="#0b0b0b" />
      ))}
    </svg>
  );
}

export function LegalInteractive() {
  const [stage, setStage] = useState('source');
  const tabs = useRef([]);
  const i = STAGES.findIndex((s) => s.id === stage);

  const onKey = (e) => {
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % STAGES.length;
    if (e.key === 'ArrowLeft') n = (i - 1 + STAGES.length) % STAGES.length;
    if (n == null) return;
    e.preventDefault();
    setStage(STAGES[n].id);
    tabs.current[n]?.focus();
  };

  return (
    <div className={`flow flow--${stage}`}>
      <div className="flow__tabs" role="tablist" aria-label="Summarization stage">
        {STAGES.map((s, n) => (
          <button
            key={s.id}
            ref={(el) => (tabs.current[n] = el)}
            type="button"
            role="tab"
            id={`flow-tab-${s.id}`}
            aria-selected={stage === s.id}
            aria-controls="flow-panel"
            tabIndex={stage === s.id ? 0 : -1}
            className="flow__tab"
            onClick={() => setStage(s.id)}
            onKeyDown={onKey}
          >
            <span className="label">0{n + 1}</span> {s.label}
          </button>
        ))}
      </div>

      <div className="flow__stage" id="flow-panel" role="tabpanel" aria-labelledby={`flow-tab-${stage}`}>
        <p className="flow__note">{STAGES[i].note}</p>
        <div className="flow__sheets">
          <div className="flow__doc" aria-hidden="true">
            <span className="label">Document</span>
            <div className="flow__lines">
              {DOC.map((l, n) => (
                <span
                  key={n}
                  className={`flow__line ${PICKED.has(n) ? 'is-picked' : ''} ${n > 0 && DOC[n - 1].p !== l.p ? 'is-para' : ''}`}
                  style={{ '--w': `${l.w}%`, '--n': n }}
                />
              ))}
            </div>
          </div>
          <div className="flow__arrow" aria-hidden="true">
            <span />
          </div>
          <div className="flow__summary" aria-hidden="true">
            <span className="label">Summary</span>
            <div className="flow__lines">
              {[96, 88, 92, 54].map((w, n) => (
                <span key={n} className="flow__line" style={{ '--w': `${w}%`, '--n': n }} />
              ))}
            </div>
          </div>
        </div>
        <p className="sr-only">
          Illustration: {DOC.length} sentence bars in the source; {PICKED.size} are selected in the extract stage; the
          abstract stage shows a four-line summary.
        </p>
      </div>
    </div>
  );
}
