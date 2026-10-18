import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Engine } from './engine.js';
import { COLOR_NAMES, piecesFromHistory } from './pieces.js';

// All rules (legal moves, check, mate, stalemate, castling, en passant,
// promotion, repetition, insufficient material, fifty-move rule) come
// from chess.js. Computer moves come from Stockfish (engine.js).
//
// The game is stored as an immutable list of moves; the chess.js position
// is rebuilt from it, so undo is just "drop the last move(s)".

function replay(moves) {
  const c = new Chess();
  moves.forEach((m) => c.move(m));
  return c;
}

export function useChessGame() {
  const [moves, setMoves] = useState([]); // [{ from, to, promotion? }]
  const [mode, setMode] = useState('ai'); // 'ai' | 'local'
  const [human, setHuman] = useState('w');
  const [level, setLevel] = useState('medium');
  const [resigned, setResigned] = useState(null); // colour that resigned
  const [thinking, setThinking] = useState(false);
  const [engineStatus, setEngineStatus] = useState({ ready: false, error: false });
  const [pendingPromotion, setPendingPromotion] = useState(null); // { from, to }
  const engineRef = useRef(null);
  const searchId = useRef(0);

  const chess = useMemo(() => replay(moves), [moves]);

  const derived = useMemo(() => {
    const history = chess.history({ verbose: true });
    const turn = chess.turn();
    let over = null;
    if (resigned) over = { kind: 'resign', winner: resigned === 'w' ? 'b' : 'w', text: `${COLOR_NAMES[resigned]} resigned` };
    else if (chess.isCheckmate()) over = { kind: 'mate', winner: turn === 'w' ? 'b' : 'w', text: 'Checkmate' };
    else if (chess.isStalemate()) over = { kind: 'draw', text: 'Stalemate' };
    else if (chess.isThreefoldRepetition()) over = { kind: 'draw', text: 'Draw by threefold repetition' };
    else if (chess.isInsufficientMaterial()) over = { kind: 'draw', text: 'Draw by insufficient material' };
    else if (chess.isDrawByFiftyMoves()) over = { kind: 'draw', text: 'Draw by the fifty-move rule' };
    else if (chess.isDraw()) over = { kind: 'draw', text: 'Draw' };
    let kingInCheck = null;
    if (chess.inCheck()) {
      chess.board().forEach((row) => row.forEach((p) => p && p.type === 'k' && p.color === turn && (kingInCheck = p.square)));
    }
    return {
      fen: chess.fen(),
      turn,
      history,
      pieces: piecesFromHistory(history),
      inCheck: chess.inCheck(),
      kingInCheck,
      over,
      lastMove: history.at(-1) ?? null,
    };
  }, [chess, resigned]);

  const engineState = mode !== 'ai' ? 'idle' : engineStatus.error ? 'error' : engineStatus.ready ? 'ready' : 'loading';
  const humanTurn = !derived.over && !pendingPromotion && (mode === 'local' || derived.turn === human) && !thinking;

  const legalTargets = useCallback((square) => (square ? chess.moves({ square, verbose: true }).map((m) => m.to) : []), [chess]);

  // Legal destinations with a capture flag (covers en passant too).
  const targetsInfo = useCallback(
    (square) =>
      square
        ? chess.moves({ square, verbose: true }).map((m) => ({ to: m.to, capture: m.flags.includes('c') || m.flags.includes('e') }))
        : [],
    [chess],
  );

  // Appends a move only if chess.js accepts it from the current position.
  const commit = useCallback(
    (move) => {
      try {
        const probe = new Chess(chess.fen());
        const played = probe.move(move);
        setMoves((ms) => [...ms, { from: played.from, to: played.to, promotion: played.promotion }]);
        return true;
      } catch {
        return false; // illegal moves are rejected
      }
    },
    [chess],
  );

  // Returns 'moved' | 'promote' | 'illegal'.
  const tryMove = useCallback(
    (from, to) => {
      if (!humanTurn) return 'illegal';
      const options = chess.moves({ square: from, verbose: true }).filter((m) => m.to === to);
      if (!options.length) return 'illegal';
      if (options.some((m) => m.promotion)) {
        setPendingPromotion({ from, to });
        return 'promote';
      }
      return commit({ from, to }) ? 'moved' : 'illegal';
    },
    [humanTurn, chess, commit],
  );

  const choosePromotion = (piece) => {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);
    commit({ from, to, promotion: piece });
  };

  // Text move entry for keyboard users: SAN ("Nf3", "O-O") or UCI ("g1f3").
  const moveFromText = (text) => {
    const t = text.trim();
    if (!t || !humanTurn) return false;
    const uci = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/i.exec(t);
    if (!uci) return commit(t);
    const from = uci[1].toLowerCase();
    const to = uci[2].toLowerCase();
    return commit({ from, to, promotion: uci[3]?.toLowerCase() }) || commit({ from, to, promotion: 'q' });
  };

  const cancelSearch = () => {
    searchId.current += 1;
    engineRef.current?.stop();
    setThinking(false);
  };

  const newGame = (opts = {}) => {
    cancelSearch();
    setMoves([]);
    setResigned(null);
    setPendingPromotion(null);
    if (opts.mode) setMode(opts.mode);
    if (opts.human) setHuman(opts.human);
  };

  const undo = () => {
    cancelSearch();
    setPendingPromotion(null);
    if (resigned) {
      setResigned(null);
      return;
    }
    let n = 1;
    // Against the computer, take back the engine's reply and your move.
    if (mode === 'ai' && derived.turn === human) n = Math.min(2, moves.length);
    setMoves((ms) => ms.slice(0, Math.max(0, ms.length - n)));
  };

  const resign = () => {
    if (derived.over) return;
    cancelSearch();
    setResigned(mode === 'ai' ? human : derived.turn);
  };

  const swapSides = () => {
    cancelSearch();
    setHuman((h) => (h === 'w' ? 'b' : 'w'));
  };

  // Engine lifecycle: started for computer games, terminated when leaving
  // that mode or the page. State updates happen in callbacks only.
  useEffect(() => {
    if (mode !== 'ai') return undefined;
    let engine = null;
    let alive = true;
    try {
      engine = new Engine();
      engineRef.current = engine;
      engine.ready.then(
        () => alive && setEngineStatus({ ready: true, error: false }),
        () => alive && setEngineStatus({ ready: false, error: true }),
      );
    } catch {
      queueMicrotask(() => alive && setEngineStatus({ ready: false, error: true }));
    }
    return () => {
      alive = false;
      searchId.current += 1;
      engine?.terminate();
      if (engineRef.current === engine) engineRef.current = null;
      setThinking(false);
      setEngineStatus({ ready: false, error: false });
    };
  }, [mode]);

  // Computer's turn: ask Stockfish, then play its move.
  useEffect(() => {
    if (mode !== 'ai' || derived.over || derived.turn === human || engineState !== 'ready' || !engineRef.current) return undefined;
    const id = ++searchId.current;
    let alive = true;
    queueMicrotask(() => alive && setThinking(true));
    engineRef.current
      .bestMove(derived.fen, level)
      .then((uci) => {
        if (!alive || id !== searchId.current || !uci || uci === '(none)') return;
        commit({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
      })
      .catch(() => alive && setEngineStatus({ ready: false, error: true }))
      .finally(() => alive && id === searchId.current && setThinking(false));
    return () => {
      alive = false;
    };
  }, [mode, human, level, derived.fen, derived.turn, derived.over, engineState, commit]);

  let status;
  if (derived.over) {
    status = derived.over.winner ? `${derived.over.text} · ${COLOR_NAMES[derived.over.winner]} wins` : derived.over.text;
  } else if (thinking) status = 'Stockfish is thinking…';
  else status = `${derived.inCheck ? 'Check · ' : ''}${COLOR_NAMES[derived.turn]} to move`;

  return {
    ...derived,
    mode,
    human,
    level,
    setLevel,
    thinking,
    engineState,
    humanTurn,
    status,
    pendingPromotion,
    legalTargets,
    targetsInfo,
    tryMove,
    choosePromotion,
    cancelPromotion: () => setPendingPromotion(null),
    moveFromText,
    newGame,
    undo,
    resign,
    swapSides,
    canUndo: moves.length > 0 || !!resigned,
  };
}
