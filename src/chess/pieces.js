import { Chess } from 'chess.js';

// Turns a game's verbose move list into persistent piece objects with
// stable ids, so the 3D scene can animate the same piece from square to
// square (including castling rooks, en passant and promotion).
export function piecesFromHistory(verboseMoves) {
  const start = new Chess();
  const pieces = [];
  const at = {};
  start.board().forEach((row) =>
    row.forEach((p) => {
      if (!p) return;
      const piece = { id: `${p.color}${p.type}-${p.square}`, color: p.color, type: p.type, square: p.square, captured: null };
      pieces.push(piece);
      at[p.square] = piece;
    }),
  );

  let capturedCount = { w: 0, b: 0 }; // per capturing side
  verboseMoves.forEach((m) => {
    const mover = at[m.from];
    let victimSquare = m.to;
    if (m.flags.includes('e')) victimSquare = `${m.to[0]}${m.from[1]}`; // en passant
    const victim = m.captured ? at[victimSquare] : null;
    if (victim) {
      victim.captured = { by: m.color, slot: capturedCount[m.color]++ };
      delete at[victimSquare];
    }
    delete at[m.from];
    mover.square = m.to;
    if (m.promotion) mover.type = m.promotion;
    at[m.to] = mover;

    if (m.flags.includes('k') || m.flags.includes('q')) {
      const rank = m.from[1];
      const [rf, rt] = m.flags.includes('k') ? [`h${rank}`, `f${rank}`] : [`a${rank}`, `d${rank}`];
      const rook = at[rf];
      delete at[rf];
      rook.square = rt;
      at[rt] = rook;
    }
  });
  return pieces;
}

export const PIECE_NAMES = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
export const COLOR_NAMES = { w: 'White', b: 'Black' };
// Text-presentation chess glyphs (U+FE0E stops emoji rendering).
export const GLYPHS = {
  w: { k: '♔︎', q: '♕︎', r: '♖︎', b: '♗︎', n: '♘︎', p: '♙︎' },
  b: { k: '♚︎', q: '♛︎', r: '♜︎', b: '♝︎', n: '♞︎', p: '♟︎' },
};
