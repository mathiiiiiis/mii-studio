import { slerp } from "../math/quat.js";

export const isAnimated = (entry) => Array.isArray(entry?.keys);
export const isAmbient = (entry) => entry?.type === "ambient";

export function compile(entry) {
  const additive = isAmbient(entry);
  const field = additive ? "delta" : "roatation";
  const tracks = {};

  for (const key of entry.keys) {
    for (const [bone, q] of Object.entries(key[field] ?? {})) {
      (tracks[bone] ??= []).push({ t: key.t, q });
    }
  }

  for (const track of Object.values(tracks)) track.sort((a, b) => a.t - b.t);

  return {
    additive,
    loop: entry.loop === true,
    duration: entry.duration ?? Math.max(0, ...entry.keys.map((k) => k.t)),
    tracks,
  };
}

function sampleTrack(track, t, duration, loop) {
  if (t <= track[0].t) {
    //looping interpolates across last => first key
    if (!loop || track.length < 2) return track[0].q;
    const last = track[track.length - 1];
    const span = duration - last.t + track[0].t;
    return span <= 0
      ? track[0].q
      : slerp(last.q, track[0].q, (t - last.t) / span);
  }

  for (let i = 1; i < track.length; i++) {
    if (t > track[i].t) continue;
    const a = track[i - 1];
    const b = track[i];
    return b.t === a.t ? b.q : slerp(a.q, b.q, (t - a.t) / (b.t - a.t));
  }

  const last = track[track.length - 1];
  if (!loop) return last.q;

  const span = duration - last.t + track[0].t;
  return span <= 0 ? last.q : slerp(last.q, track[0].q, (t - last.t) / span);
}

export function sample(compiled, time) {
  const { duration, loop, tracks } = compiled;
  const t =
    loop && duration > 0 ? ((time % duration) + duration) % duration : time;

  const out = {};
  for (const [bone, track] of Object.entries(tracks)) {
    out[bone] = sampleTrack(track, t, duration, loop);
  }
  return out;
}
