import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseGlb, buildRig, POSE_BONES } from "../rig.js";
import { loadConfig } from "../config.js";

const { json } = parseGlb(readFileSync(loadConfig().model));
const rig = buildRig(json);

const AXES = {
  nw4f_root: "+x+y+z",
  Skl_Root: "+y-x+z",
  Spine_1: "+y-x+z",
  Spine_2: "+y-x+z",
  Head: "+y-x+z",
  Arm_1_L: "-y+x+z",
  Arm_2_L: "-y+x+z",
  Wrist_L: "-y+x+z",
  Arm_1_R: "-y-x-z",
  Arm_2_R: "-y-x-z",
  Wrist_R: "-y-x-z",
  Waist: "-y+x+z",
  Leg_1_L: "-y-x-z",
  Leg_2_L: "-y-x-z",
  Ankle_L: "-y-x-z",
  Leg_1_R: "-y+x+z",
  Leg_2_R: "-y+x+z",
  Ankle_R: "-y+x+z",
};

describe("rig extraction", () => {
  it("finds every joint and every posable bone", () => {
    expect(rig.boneCount).toBe(31);
    expect(rig.poseBones).toEqual(POSE_BONES);
  });

  it("matches the measured local axis orientation", () => {
    for (const [name, signature] of Object.entries(AXES)) {
      expect(`${name} ${rig.bones[name].signature}`).toBe(
        `${name} ${signature}`,
      );
    }
  });

  it("does not inherit orientation down the hierarchy", () => {
    expect(rig.bones.Waist.parent).toBe("Skl_Root");
    expect(rig.bones.Waist.group).not.toBe(rig.bones.Skl_Root.group);
  });

  it("keeps world rotations unit length", () => {
    for (const name of rig.order) {
      expect(Math.hypot(...rig.bones[name].world)).toBeCloseTo(1, 6);
    }
  });

  it("carries no scale anywhere", () => {
    for (const node of json.nodes) {
      expect(node.scale ?? [1, 1, 1]).toEqual([1, 1, 1]);
      expect(node.matrix).toBeUndefined();
    }
  });

  it("stacks the spine upward from the root", () => {
    const y = (name) => rig.bones[name].position[1];
    expect(y("Ankle_L")).toBeLessThan(y("Skl_Root"));
    expect(y("Skl_Root")).toBeLessThan(y("Spine_2"));
    expect(y("Spine_2")).toBeLessThan(y("Head"));
  });
});
