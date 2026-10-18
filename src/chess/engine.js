// Stockfish 18 (lite, single-threaded WASM) running in a Web Worker.
// The engine files live in /public/engine (GPL-3.0, see README there).
// Every computer move in the game comes from this engine — nothing is simulated.

const ENGINE_URL = '/engine/stockfish-18-lite-single.js';

// Strength settings use Stockfish's own "Skill Level" option (0–20)
// together with a search limit.
export const LEVELS = {
  easy: { label: 'Easy', skill: 0, go: 'go depth 2' },
  medium: { label: 'Medium', skill: 8, go: 'go depth 8' },
  hard: { label: 'Hard', skill: 20, go: 'go movetime 1200' },
};

export class Engine {
  constructor() {
    this.worker = new Worker(ENGINE_URL);
    this.lineHandlers = new Set();
    this.searching = null; // promise of the search in flight
    this.worker.onmessage = (e) => {
      const line = typeof e.data === 'string' ? e.data : String(e.data ?? '');
      this.lineHandlers.forEach((h) => h(line));
    };
    this.ready = new Promise((resolve, reject) => {
      this.worker.onerror = (err) => reject(err instanceof Error ? err : new Error('Engine failed to load'));
      const onLine = (line) => {
        if (line === 'uciok') this.send('isready');
        if (line === 'readyok') {
          this.lineHandlers.delete(onLine);
          resolve();
        }
      };
      this.lineHandlers.add(onLine);
      this.send('uci');
    });
  }

  send(cmd) {
    this.worker.postMessage(cmd);
  }

  // Resolves with a UCI move string such as "e2e4" or "e7e8q".
  async bestMove(fen, levelKey) {
    await this.ready;
    if (this.searching) {
      this.send('stop');
      await this.searching.catch(() => {});
    }
    const level = LEVELS[levelKey] ?? LEVELS.medium;
    this.searching = new Promise((resolve) => {
      const onLine = (line) => {
        if (line.startsWith('bestmove')) {
          this.lineHandlers.delete(onLine);
          this.searching = null;
          resolve(line.split(' ')[1]);
        }
      };
      this.lineHandlers.add(onLine);
      this.send('ucinewgame');
      this.send(`setoption name Skill Level value ${level.skill}`);
      this.send(`position fen ${fen}`);
      this.send(level.go);
    });
    return this.searching;
  }

  stop() {
    if (this.searching) this.send('stop');
  }

  terminate() {
    this.worker.terminate();
  }
}
