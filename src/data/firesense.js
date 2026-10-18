import session from './firesense-session.json';

// Real captured session from the Firesense repository
// (data/real_session_20260905.csv), converted by a one-off script.
export const ROWS = session.rows.map(([t, gas, temp, hum, score, level, sig, naive, sup]) => ({
  t, gas, temp, hum, score, level, sig, naive, sup,
}));
export const T_MAX = ROWS.at(-1).t;
