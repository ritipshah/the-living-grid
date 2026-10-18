import { useRef, useState } from 'react';
import { COLOR_NAMES, GLYPHS, PIECE_NAMES } from './pieces.js';

// A flat, keyboard-first board. Used when WebGL is unavailable and as an
// optional view: arrow keys move between squares, Enter or Space selects
// a piece and then a destination.
export default function Board2D({ game, orientation }) {
  const [selected, setSelected] = useState(null);
  const [focus, setFocus] = useState(orientation === 'w' ? 'e2' : 'e7');
  const refs = useRef({});

  const [fenSeen, setFenSeen] = useState(game.fen);
  if (fenSeen !== game.fen) {
    setFenSeen(game.fen);
    setSelected(null);
  }

  const files = orientation === 'w' ? 'abcdefgh' : 'hgfedcba';
  const ranks = orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const at = Object.fromEntries(game.pieces.filter((p) => !p.captured).map((p) => [p.square, p]));
  const info = game.targetsInfo(selected);
  const targets = new Set(info.map((t) => t.to));

  const activate = (sq) => {
    if (selected && targets.has(sq)) {
      game.tryMove(selected, sq);
      setSelected(null);
      return;
    }
    const p = at[sq];
    setSelected(p && game.humanTurn && p.color === game.turn && sq !== selected ? sq : null);
  };

  const onKey = (e) => {
    const fi = files.indexOf(focus[0]);
    const ri = ranks.indexOf(Number(focus[1]));
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!d) return;
    e.preventDefault();
    const nf = Math.min(7, Math.max(0, fi + d[0]));
    const nr = Math.min(7, Math.max(0, ri + d[1]));
    const sq = `${files[nf]}${ranks[nr]}`;
    setFocus(sq);
    refs.current[sq]?.focus();
  };

  return (
    <div className="b2d" role="group" aria-label="Chessboard, two-dimensional view. Use arrow keys to move between squares.">
      <div className="b2d__grid" onKeyDown={onKey}>
        {ranks.map((r) =>
          [...files].map((f) => {
            const sq = `${f}${r}`;
            const p = at[sq];
            const dark = (f.charCodeAt(0) - 97 + r) % 2 === 1;
            const isTarget = targets.has(sq);
            const label = [
              sq,
              p ? `${COLOR_NAMES[p.color]} ${PIECE_NAMES[p.type]}` : 'empty',
              selected === sq ? 'selected' : '',
              isTarget ? 'legal move' : '',
              game.kingInCheck === sq ? 'in check' : '',
            ]
              .filter(Boolean)
              .join(', ');
            return (
              <button
                key={sq}
                ref={(el) => (refs.current[sq] = el)}
                type="button"
                tabIndex={focus === sq ? 0 : -1}
                className={[
                  'b2d__sq',
                  dark ? 'is-dark' : 'is-light',
                  selected === sq && 'is-selected',
                  isTarget && 'is-target',
                  game.lastMove && (game.lastMove.from === sq || game.lastMove.to === sq) && 'is-last',
                  game.kingInCheck === sq && 'is-check',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={label}
                onFocus={() => setFocus(sq)}
                onClick={() => activate(sq)}
              >
                {p && <span className={`b2d__piece b2d__piece--${p.color}`}>{GLYPHS[p.color][p.type]}</span>}
                {f === files[0] && <span className="b2d__rank">{r}</span>}
                {r === ranks[7] && <span className="b2d__file">{f}</span>}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
