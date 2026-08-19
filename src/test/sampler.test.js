import { describe, it, expect } from "vitest";
import { compile, sample, isAnimated, isAmbient } from "../anim/sampler.js";
import { angleBetween, DEG } from "../math/quat.js";

const deg = (q) => angleBetween(q, [0, 0, 0, 1]) * DEG;

const CLIP = {
  type: "clip",
  duration: 1400,
  keys: [
    { t: 0, rotation: { Arm_1_L: [0, 0, 0, 1] } },
    { t: 600, rotation: { Arm_1_L: [0.1, 0.2, 0, 0.97468] } },
    { t: 1400, rotation: { Arm_1_L: [0, 0, 0, 1] } },
  ],
};

const AMBIENT = {
  type: "ambient",
  duration: 4300,
  loop: true,
  keys: [
    { t: 0, delta: { Spine_1: [0, 0, 0, 1] } },
    { t: 2150, delta: { Spine_1: [0, 0.0113, 0, 0.99994] } },
  ],
};

describe("entry kinds", () => {
  it("tells poses from animated entries by the key list", () => {
    expect(isAnimated(CLIP)).toBe(true);
    expect(isAnimated({ rotation: {} })).toBe(false);
    expect(isAmbient(AMBIENT)).toBe(true);
    expect(isAmbient(CLIP)).toBe(false);
  });
});

describe("clips", () => {
  const compiled = compile(CLIP);

  it("hits every key exactly", () => {
    expect(deg(sample(compiled, 0).Arm_1_L)).toBeCloseTo(0, 4);
    expect(deg(sample(compiled, 600).Arm_1_L)).toBeCloseTo(25.84, 1);
    expect(deg(sample(compiled, 1400).Arm_1_L)).toBeCloseTo(0, 4);
  });

  it("interpolates between them", () => {
    expect(deg(sample(compiled, 300).Arm_1_L)).toBeCloseTo(12.92, 1);
  });

  it("holds the last key past the end", () => {
    expect(deg(sample(compiled, 9000).Arm_1_L)).toBeCloseTo(0, 4);
  });
});

describe("ambient loops", () => {
  const compiled = compile(AMBIENT);

  it("peaks at half the period", () => {
    expect(deg(sample(compiled, 2150).Spine_1)).toBeCloseTo(1.295, 2);
  });

  it("wraps without a jump", () => {
    const before = deg(sample(compiled, 4299).Spine_1);
    const after = deg(sample(compiled, 4301).Spine_1);
    expect(Math.abs(after - before)).toBeLessThan(0.01);
  });

  it("repeats after one period", () => {
    expect(deg(sample(compiled, 1000).Spine_1)).toBeCloseTo(
      deg(sample(compiled, 1000 + 4300).Spine_1),
      6,
    );
  });

  it("handles a negative time", () => {
    expect(deg(sample(compiled, -1000).Spine_1)).toBeCloseTo(
      deg(sample(compiled, 3300).Spine_1),
      6,
    );
  });
});

describe("sparse tracks", () => {
  it("holds a bone that has no key at this time", () => {
    const compiled = compile({
      type: "clip",
      duration: 1000,
      keys: [
        { t: 0, rotation: { Head: [0, 0, 0, 1], Waist: [0, 0, 0, 1] } },
        { t: 500, rotation: { Head: [0.2588, 0, 0, 0.9659] } },
        { t: 1000, rotation: { Head: [0, 0, 0, 1] } },
      ],
    });

    expect(deg(sample(compiled, 500).Waist)).toBeCloseTo(0, 4);
    expect(deg(sample(compiled, 500).Head)).toBeCloseTo(30, 1);
  });
});
