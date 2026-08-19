import { norm, angleBetween, DEG } from "../math/quat.js";
import ranges from "../data/ranges.json" with { type: "json" };

const RANGE_SLACK = 1.15;
const FLOOR_DEG = 5;

const error = (bone, message) => ({ level: "error", bone, message });
const warn = (bone, message) => ({ level: "warn", bone, message });

export function validatePose(rig, pose) {
  const issues = [];

  if (!pose.rotation || typeof pose.rotation !== "object") {
    return [error(null, "pose has no rotation map")];
  }

  for (const key of Object.keys(pose)) {
    if (key === "rotation" || key === "rootOffsetY") {
      continue;
    }
    issues.push(error(null, `unsupported key ${key}`));
  }

  for (const [name, q] of Object.entries(pose.rotation)) {
    const bone = rig.bones[name];

    if (!bone) {
      issues.push(error(name, "not a bone in this rig"));
      continue;
    }
    if (!rig.poseBones.includes(name)) {
      issues.push(warn(name, "not a posable bone, it will have no effect"));
    }
    if (
      !Array.isArray(q) ||
      q.length !== 4 ||
      q.some((n) => !Number.isFinite(n))
    ) {
      issues.push(error(name, "rotation is not four finite numbers"));
      continue;
    }
    if (Math.abs(norm(q) - 1) > 1e-3) {
      issues.push(error(name, `not normalized, length ${norm(q).toFixed(4)}`));
    }

    const moved = angleBetween(bone.rest.rotation, q) * DEG;
    const ceiling = Math.max(ranges[name] ?? 0, FLOOR_DEG) * RANGE_SLACK;
    if (moved > ceiling) {
      issues.push(
        warn(
          name,
          `${moved.toFixed(1)}deg from rest, reference poses reach ${ranges[name] ?? 0}deg`,
        ),
      );
    }
  }

  return issues;
}

export const hasErrors = (issues) => issues.some((i) => i.level === "error");
