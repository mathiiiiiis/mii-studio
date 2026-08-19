import { compile, sample } from "./sampler.js";

const DEFAULT_MS = 1000;

export function createTimeline({ type = "clip", duration = DEFAULT_MS } = {}) {
  let keys = [];
  let compiled = null;

  const state = { type, duration };
  const invalidate = () => (compiled = null);

  const entry = () => ({
    type: state.type,
    duration: state.duration,
    ...(state.type === "ambient" ? { loop: true } : {}),
    keys: keys.map(({ t, map }) => ({
      t,
      [state.type === "ambient" ? "delta" : "rotation"]: map,
    })),
  });

  return {
    get type() {
      return state.type;
    },
    set type(value) {
      state.type = value;
      invalidate();
    },
    get duration() {
      return state.duration;
    },
    set duration(value) {
      state.duration = Math.max(0, value);
      invalidate();
    },
    get keys() {
      return keys.map((k) => k.t);
    },

    //replace keys at the same timestamp
    setKey(t, map) {
      keys = keys.filter((k) => k.t !== t).concat({ t, map });
      keys.sort((a, b) => a.t - b.t);
      invalidate();
    },

    removeKey(t) {
      const before = keys.length;
      keys = keys.filter((k) => k.t !== t);
      invalidate();
      return keys.length !== before;
    },

    keyAt(t) {
      return keys.find((k) => k.t === t)?.map ?? null;
    },

    nearestKey(t, direction) {
      const times = keys.map((k) => k.t);
      return direction < 0
        ? (times.filter((k) => k < t).pop() ?? null)
        : (times.find((k) => k > t) ?? null);
    },

    sampleAt(t) {
      if (!keys.length) return {};
      compiled ??= compile(entry());
      return sample(compiled, t);
    },

    load(source) {
      state.type = source.type ?? "clip";
      state.duration = source.duration ?? DEFAULT_MS;
      const field = state.type === "ambient" ? "delta" : "rotation";
      keys = (source.keys ?? []).map((k) => ({ t: k.t, map: { ...k[field] } }));
      keys.sort((a, b) => a.t - b.t);
      invalidate();
    },

    toEntry: entry,
  };
}
