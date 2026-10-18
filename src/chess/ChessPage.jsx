import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useChessGame } from './useChessGame.js';
import { LEVELS } from './engine.js';
import { COLOR_NAMES, GLYPHS } from './pieces.js';
import Board2D from './Board2D.jsx';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import { useMedia } from '../hooks/useMedia.js';
import { useDocumentMeta } from '../hooks/useDocumentMeta.js';
import ChessLoader from './ChessLoader.jsx';
import './chess.css';

// The WebGL scene is its own chunk, so the 2D fallback never downloads it.
const ChessScene = lazy(() => import('./Scene.jsx'));

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

const VIEWS = [
  ['player', 'Player'],
  ['top', 'Top-down'],
  ['cinematic', 'Cinematic'],
];

function Segmented({ label, value, options, onChange }) {
  return (
    <div className="cx-seg" role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

function Promotion({ color, onPick, onCancel }) {
  const first = useRef(null);
  useEffect(() => first.current?.focus(), []);
  return (
    <div className="cx-modal" role="dialog" aria-modal="true" aria-labelledby="promo-title" onKeyDown={(e) => e.key === 'Escape' && onCancel()}>
      <div className="cx-modal__card">
        <p className="cx-label cx-label--accent" id="promo-title">
          Promote pawn
        </p>
        <div className="cx-promo">
          {[
            ['q', 'Queen'],
            ['r', 'Rook'],
            ['b', 'Bishop'],
            ['n', 'Knight'],
          ].map(([t, name], i) => (
            <button key={t} ref={i === 0 ? first : undefined} type="button" onClick={() => onPick(t)}>
              <span className="cx-glyph" aria-hidden="true">
                {GLYPHS[color][t]}
              </span>
              {name}
            </button>
          ))}
        </div>
        <button type="button" className="cx-link" onClick={onCancel}>
          Cancel move
        </button>
      </div>
    </div>
  );
}

export default function ChessPage() {
  useDocumentMeta(
    'Chess / Dimension 001 — Riti Shah',
    'A playable 3D chess board with Stockfish, part of Riti Shah’s portfolio, The Living Grid.',
  );
  const game = useChessGame();
  const reduced = usePrefersReducedMotion();
  const coarse = useMedia('(pointer: coarse), (max-width: 760px)');
  const webgl = useMemo(() => hasWebGL(), []);
  const [surface, setSurface] = useState(webgl ? '3d' : '2d');
  const [view, setView] = useState('player');
  const [resetKey, setResetKey] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [flipLocal, setFlipLocal] = useState(false);
  const [setup, setSetup] = useState({ mode: 'ai', human: 'w' });
  const [panelOpen, setPanelOpen] = useState(() => !window.matchMedia('(max-width: 760px)').matches);
  const [typed, setTyped] = useState('');
  const [typedError, setTypedError] = useState('');
  const movesRef = useRef(null);

  const orientation = game.mode === 'ai' ? game.human : flipLocal ? 'b' : 'w';
  const quality = coarse || reduced ? 'low' : 'high';

  useEffect(() => {
    const el = movesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [game.history.length]);

  const startNew = () => {
    game.newGame(setup);
    setResetKey((k) => k + 1);
  };

  const submitTyped = (e) => {
    e.preventDefault();
    if (game.moveFromText(typed)) {
      setTyped('');
      setTypedError('');
    } else {
      setTypedError(game.over ? 'The game is over. Start a new game to keep playing.' : game.humanTurn ? `“${typed}” is not a legal move here.` : 'Wait for your turn.');
    }
  };

  const captured = (by) =>
    game.pieces
      .filter((p) => p.captured?.by === by)
      .map((p) => (
        <span key={p.id} className="cx-glyph" title={p.type}>
          {GLYPHS[p.color][p.type]}
        </span>
      ));

  const pairs = [];
  for (let i = 0; i < game.history.length; i += 2) pairs.push([game.history[i], game.history[i + 1]]);

  return (
    <div className={`cx ${surface === '2d' ? 'cx--2d' : ''} ${panelOpen ? 'cx--panel' : ''}`}>
      <div className="cx-stage">
        {surface === '3d' ? (
          <Suspense fallback={<ChessLoader inline />}>
            <ChessScene
              game={game}
              view={view}
              orientation={orientation}
              resetKey={resetKey}
              reduced={reduced}
              quality={quality}
              onReady={() => setSceneReady(true)}
            />
          </Suspense>
        ) : (
          <div className="cx-flat">
            {!webgl && (
              <p className="cx-note">
                3D isn&rsquo;t available in this browser (WebGL is off or unsupported), so the game is shown as a flat board.
              </p>
            )}
            <Board2D game={game} orientation={orientation} />
          </div>
        )}
        {surface === '3d' && !sceneReady && <ChessLoader inline />}
      </div>

      <header className="cx-top">
        <div className="cx-brand">
          <Link to="/" className="cx-back">
            <span aria-hidden="true">←</span> The Living Grid
          </Link>
          <h1 className="cx-word">
            Chess <span>/</span> Dimension 001
          </h1>
        </div>
        <div className="cx-views">
          {surface === '3d' && (
            <>
              <Segmented label="Camera view" value={view} options={VIEWS} onChange={(v) => { setView(v); setResetKey((k) => k + 1); }} />
              <button type="button" className="cx-btn cx-btn--ghost" onClick={() => setResetKey((k) => k + 1)}>
                Reset view
              </button>
            </>
          )}
          {webgl && (
            <Segmented
              label="Board"
              value={surface}
              options={[
                ['3d', '3D'],
                ['2d', '2D'],
              ]}
              onChange={setSurface}
            />
          )}
        </div>
      </header>

      <aside className={`cx-panel ${panelOpen ? 'is-open' : ''}`} aria-label="Game panel">
        <button type="button" className="cx-panel__handle" aria-expanded={panelOpen} onClick={() => setPanelOpen((o) => !o)}>
          <span className={`cx-dot ${game.over ? 'is-over' : game.inCheck ? 'is-check' : ''}`} aria-hidden="true" />
          <span className="cx-status" aria-live="polite">
            {game.status}
          </span>
          <span className="cx-label">{panelOpen ? 'Hide' : 'Game'}</span>
        </button>

        <div className="cx-panel__body">
          <section className="cx-block">
            <p className="cx-label">
              {game.mode === 'ai'
                ? `You: ${COLOR_NAMES[game.human]} · Stockfish: ${COLOR_NAMES[game.human === 'w' ? 'b' : 'w']}`
                : 'Two players · same device'}
            </p>
            {game.mode === 'ai' && (
              <p className="cx-engine">
                Engine:{' '}
                {{ idle: 'not started', loading: 'loading Stockfish 18…', ready: 'Stockfish 18 lite (WebAssembly)', error: 'could not load. Try two-player mode.' }[game.engineState]}
              </p>
            )}
            {game.mode === 'ai' && (
              <div className="cx-field">
                <span className="cx-label">Difficulty</span>
                <Segmented
                  label="Difficulty"
                  value={game.level}
                  options={Object.entries(LEVELS).map(([k, l]) => [k, l.label])}
                  onChange={game.setLevel}
                />
              </div>
            )}
          </section>

          <section className="cx-block">
            <div className="cx-captured">
              <div>
                <span className="cx-label">White took</span>
                <p>{captured('w')}</p>
              </div>
              <div>
                <span className="cx-label">Black took</span>
                <p>{captured('b')}</p>
              </div>
            </div>
          </section>

          <section className="cx-block cx-block--moves">
            <span className="cx-label">Moves</span>
            <ol ref={movesRef} className="cx-moves">
              {pairs.length === 0 && <li className="cx-empty">No moves yet</li>}
              {pairs.map(([w, b], i) => (
                <li key={i}>
                  <span className="cx-mn">{i + 1}.</span>
                  <span>{w.san}</span>
                  <span>{b?.san ?? ''}</span>
                </li>
              ))}
            </ol>
            <form className="cx-type" onSubmit={submitTyped}>
              <label htmlFor="cx-move" className="cx-label">
                Type a move
              </label>
              <div>
                <input
                  id="cx-move"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="e4, Nf3, O-O or e2e4"
                  autoComplete="off"
                  spellCheck="false"
                  aria-describedby={typedError ? 'cx-move-err' : undefined}
                />
                <button type="submit" className="cx-btn">
                  Play
                </button>
              </div>
              {typedError && (
                <p id="cx-move-err" className="cx-error" role="alert">
                  {typedError}
                </p>
              )}
            </form>
          </section>

          <section className="cx-block cx-actions">
            <button type="button" className="cx-btn" onClick={game.undo} disabled={!game.canUndo}>
              Undo
            </button>
            {game.mode === 'ai' ? (
              <button type="button" className="cx-btn" onClick={game.swapSides} disabled={!!game.over}>
                Swap sides
              </button>
            ) : (
              <button type="button" className="cx-btn" onClick={() => setFlipLocal((f) => !f)}>
                Flip board
              </button>
            )}
            <button type="button" className="cx-btn" onClick={game.resign} disabled={!!game.over}>
              Resign
            </button>
          </section>

          <section className="cx-block cx-setup">
            <span className="cx-label">New game</span>
            <Segmented
              label="Opponent"
              value={setup.mode}
              options={[
                ['ai', 'vs Stockfish'],
                ['local', 'Two players'],
              ]}
              onChange={(mode) => setSetup((s) => ({ ...s, mode }))}
            />
            {setup.mode === 'ai' && (
              <Segmented
                label="Play as"
                value={setup.human}
                options={[
                  ['w', 'Play White'],
                  ['b', 'Play Black'],
                ]}
                onChange={(human) => setSetup((s) => ({ ...s, human }))}
              />
            )}
            <button type="button" className="cx-btn cx-btn--solid" onClick={startNew}>
              Start new game
            </button>
          </section>
        </div>
      </aside>

      {game.over && (
        <div className="cx-result" role="status">
          <p className="cx-label cx-label--accent">Game over</p>
          <p className="cx-result__text">{game.status}</p>
          <button type="button" className="cx-btn cx-btn--solid" onClick={startNew}>
            Play again
          </button>
        </div>
      )}

      {game.pendingPromotion && <Promotion color={game.turn} onPick={game.choosePromotion} onCancel={game.cancelPromotion} />}

      {surface === '3d' && (
        <p className="cx-hint">Tap or drag a piece · drag empty space to orbit · pinch or scroll to zoom</p>
      )}
    </div>
  );
}
