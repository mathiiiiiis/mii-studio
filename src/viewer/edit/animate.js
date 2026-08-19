import { createTimeline } from "../../anim/timeline.js";
import { collectPose } from "../../pose/collect.js";
import { toDelta, fromDelta } from "../../anim/additive.js";

const STEP_MS = 50;

export function createAnimate(rig, model) {
  const timeline = createTimeline();

  let time = 0;
  let playing = false;
  let last = 0;

  const boneOf = (name) => model.getObjectByName(name);
  const get = (name) => boneOf(name)?.quaternion.toArray();

  const apply = () => {
    const sampled = timeline.sampleAt(time);
    for (const [name, q] of Object.entries(sampled)) {
      const bone = boneOf(name);
      if (!bone) continue;
      bone.quaternion.fromArray(
        timeline.type === "ambient" ? fromDelta(rig.bones[name], q) : q,
      );
    }
  };

  const seek = (t) => {
    time = Math.max(0, Math.min(timeline.duration, t));
    apply();
  };

  return {
    timeline,
    get time() {
      return time;
    },
    get playing() {
      return playing;
    },

    //recording is explicit, unrecorded scrubbing changes are discarded
    record() {
      const { rotation } = collectPose(rig, get);
      const map =
        timeline.type === "ambient"
          ? Object.fromEntries(
              Object.entries(rotation).map(([name, q]) => [
                name,
                toDelta(rig.bones[name], q),
              ]),
            )
          : rotation;

      timeline.setKey(time, map);
      return Object.keys(map).length;
    },

    erase() {
      const removed = timeline.removeKey(time);
      if (removed) apply();
      return removed;
    },

    step(direction) {
      seek(time + direction * STEP_MS);
    },

    jump(direction) {
      const t = timeline.nearestKey(t, direction);
      if (t !== null) seek(t);
    },

    seek,

    toggle() {
      if (
        !playing &&
        timeline.type !== "ambient" &&
        time >= timeline.duration
      ) {
        seek(0);
      }
      playing = !playing;
      last = performance.now();
      return playing;
    },

    setType(type) {
      timeline.type = type;
      apply();
    },

    setDuration(ms) {
      timeline.duration = ms;
      if (time > ms) seek(ms);
    },

    tick() {
      if (!playing) return;
      const now = performance.now();
      const next = time + (now - last);
      last = now;

      //use wall time so playback is independent of refresh rate
      if (next > timeline.duration) {
        if (timeline.type === "ambient") seek(next % timeline.duration);
        else {
          seek(timeline.duration);
          playing = false;
        }
        return;
      }
      seek(next);
    },
  };
}
