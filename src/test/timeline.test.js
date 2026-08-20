import { describe, it, expect } from "vitest";
import { createTimeline } from "../anim/timeline.js";
import { toDelta, fromDelta } from "../anim/additive.js";
import { loadRig } from "../rig.node.js";
import { angleBetween, DEG } from "../math/quat.js";

const rig = loadRig();
const deg = (q) => angleBetween(q, [0, 0, 0, 1]) * DEG;

const TURN_30 = [0.2588, 0, 0, 0.9659];

describe("timeline", () => {
  it("keeps keys sorted whatever order they arrive in", () => {
    const tl = createTimeline({ duration: 1000 });
    tl.setKey(1000, { Head: TURN_30 });
    tl.setKey(0, { Head: [0, 0, 0, 1] });
    tl.setKey(500, { Head: [0.1305, 0, 0, 0.9914] });

    expect(tl.keys).toEqual([0, 500, 1000]);
  });

  it("replaces a key at the same time rather than stacking", () => {
    const tl = createTimeline({ duration: 1000 });
    tl.setKey(0, { Head: [0, 0, 0, 1] });
    tl.setKey(500, { Head: TURN_30 });
    tl.setKey(500, { Head: [0, 0, 0, 1] });

    expect(tl.keys).toEqual([0, 500]);
    expect(deg(tl.sampleAt(500).Head)).toBeCloseTo(0, 4);
  });

  it("resamples after a mutation", () => {
    const tl = createTimeline({ duration: 1000 });
    tl.setKey(0, { Head: [0, 0, 0, 1] });
    tl.setKey(1000, { Head: TURN_30 });
    expect(deg(tl.sampleAt(1000).Head)).toBeCloseTo(30, 1);

    tl.setKey(1000, { Head: [0, 0, 0, 1] });
    expect(deg(tl.sampleAt(1000).Head)).toBeCloseTo(0, 4);
  });

  it("walks to the neighbouring keys", () => {
    const tl = createTimeline({ duration: 1000 });
    for (const t of [0, 400, 900]) tl.setKey(t, { Head: [0, 0, 0, 1] });

    expect(tl.nearestKey(400, -1)).toBe(0);
    expect(tl.nearestKey(400, 1)).toBe(900);
    expect(tl.nearestKey(0, -1)).toBe(null);
    expect(tl.nearestKey(900, 1)).toBe(null);
  });

  it("removes keys", () => {
    const tl = createTimeline({ duration: 1000 });
    tl.setKey(0, { Head: [0, 0, 0, 1] });

    expect(tl.removeKey(0)).toBe(true);
    expect(tl.removeKey(0)).toBe(false);
    expect(tl.keys).toEqual([]);
    expect(tl.sampleAt(0)).toEqual({});
  });

  it("round trips through an entry", () => {
    const tl = createTimeline({ type: "ambient", duration: 4300 });
    tl.setKey(0, { Spine_1: [0, 0, 0, 1] });
    tl.setKey(2150, { Spine_1: [0, 0.0113, 0, 0.99994] });

    const entry = tl.toEntry();
    expect(entry.loop).toBe(true);
    expect(entry.keys[0].delta).toBeTruthy();
    expect(entry.keys[0].rotation).toBeUndefined();

    const back = createTimeline();
    back.load(entry);
    expect(back.type).toBe("ambient");
    expect(back.duration).toBe(4300);
    expect(back.keys).toEqual([0, 2150]);
  });

  it("writes rotation for clips and delta for ambient", () => {
    const clip = createTimeline({ type: "clip", duration: 100 });
    clip.setKey(0, { Head: [0, 0, 0, 1] });

    expect(clip.toEntry().keys[0].rotation).toBeTruthy();
    expect(clip.toEntry().loop).toBeUndefined();
  });
});

describe("ambient deltas", () => {
  it("round trips against the bone rest rotation", () => {
    for (const name of rig.poseBones) {
      const bone = rig.bones[name];
      const back = fromDelta(bone, toDelta(bone, bone.rest.rotation));
      expect(angleBetween(back, bone.rest.rotation) * DEG).toBeLessThan(1e-4);
    }
  });

  it("reads a bone at rest as no delta", () => {
    const bone = rig.bones.Spine_1;
    expect(deg(toDelta(bone, bone.rest.rotation))).toBeCloseTo(0, 4);
  });
});
