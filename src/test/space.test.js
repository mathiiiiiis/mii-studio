import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadRig } from "../rig.js";
import { angleBetween, rotateVec, DEG } from "../math/quat.js";
import {
  toLocal,
  toWorld,
  readPose,
  writePose,
  axisAngle,
  toAxisAngle,
  WORLD,
} from "../math/space.js";
import { ROOT } from "../config.js";

const rig = loadRig();
const fixtures = JSON.parse(
  readFileSync(resolve(ROOT, "fixtures/poses.json"), "utf8"),
);

const degreesApart = (a, b) => angleBetween(a, b) * DEG;

describe("world to local", () => {
  it("leaves a bone at rest when the world delta is nothing", () => {
    for (const name of rig.poseBones) {
      const bone = rig.bones[name];
      expect(
        degreesApart(toLocal(bone, [0, 0, 0, 1]), bone.rest.rotation),
      ).toBeLessThan(1e-4);
    }
  });

  it("round trips every bone of every pose", () => {
    for (const pose of Object.values(fixtures)) {
      for (const [name, local] of Object.entries(pose.rotation)) {
        const bone = rig.bones[name];
        expect(
          degreesApart(toLocal(bone, toWorld(bone, local)), local),
        ).toBeLessThan(1e-4);
      }
    }
  });
});

describe("axis and angle", () => {
  it("swings forward onto right at 90 degrees about up", () => {
    expect(
      rotateVec(axisAngle(WORLD.up, 90), WORLD.forward).map(Math.round),
    ).toEqual([1, 0, 0]);
  });

  it("inverts itself", () => {
    const { axis, degrees } = toAxisAngle(axisAngle(WORLD.right, 33));
    expect(degrees).toBeCloseTo(33, 6);
    expect(axis.map((n) => Math.round(n))).toEqual([1, 0, 0]);
  });

  it("returns a unit axis", () => {
    const deltas = readPose(rig, fixtures["Pose.06"]);
    for (const [name, q] of Object.entries(deltas)) {
      const { axis, degrees } = toAxisAngle(q);
      if (degrees < 0.5) continue;
      expect(`${name} ${Math.hypot(...axis).toFixed(6)}`).toBe(
        `${name} 1.000000`,
      );
    }
  });
});

describe("poses", () => {
  it("reads Pose.01 as the rest pose", () => {
    for (const delta of Object.values(readPose(rig, fixtures["Pose.01"]))) {
      expect(degreesApart(delta, [0, 0, 0, 1])).toBeLessThan(0.01);
    }
  });

  it("survives a read and write cycle", () => {
    for (const pose of Object.values(fixtures)) {
      const rebuilt = writePose(rig, readPose(rig, pose));
      for (const [name, local] of Object.entries(pose.rotation)) {
        expect(degreesApart(rebuilt[name], local)).toBeLessThan(1e-4);
      }
    }
  });

  it("reads a symmetric pose symmetrically", () => {
    const deltas = readPose(rig, fixtures["Pose.02"]);
    const left = toAxisAngle(deltas.Arm_1_L);
    const right = toAxisAngle(deltas.Arm_1_R);

    expect(left.degrees).toBeCloseTo(right.degrees, 0);
    expect(left.axis[1]).toBeCloseTo(-right.axis[1], 1);
    expect(left.axis[2]).toBeCloseTo(-right.axis[2], 1);
  });
});
