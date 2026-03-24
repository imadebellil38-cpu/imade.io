const state = new Map();
const listeners = new Map();

export function setState(key, value) {
  state.set(key, value);
  const fns = listeners.get(key);
  if (fns) {
    fns.forEach(fn => fn(value));
  }
}

export function getState(key) {
  return state.get(key);
}

export function subscribe(key, fn) {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key).add(fn);
  return () => listeners.get(key).delete(fn);
}
