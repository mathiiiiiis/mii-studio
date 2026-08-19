import { norm, angleBetween, DEG } from "../math/quat.js";
import { isAnimated, isAmbient } from "../anim/sampler.js";
import ranges from "../data/ranges.json" with { type: "json" };

const RANGE_SLACK = 1.15;
const FLOOR_DEG = 5;

const LIMITS = { ambientDeg: 3, clipMs: 2000, resyncMs: 30000 };

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

export function validateClip(rig, entry, limits = LIMITS) {
  const issues = [];
  const ambient = isAmbient(entry);
  const field = ambient ? "delta" : "rotation";

  if (!entry.keys.length) return [error(null, "no keys")];
  if (entry.keys[0].t !== 0)
    issues.push(error(null, "first key is not at t 0"));

  let previous = -1;
  for (const key of entry.keys) {
    if (!Number.isFinite(key.t))
      issues.push(error(null, `key t is not a number`));
    else if (key.t <= previous)
      issues.push(error(null, `key t ${key.t} is not ascending`));
    previous = key.t;

    for (const [name, q] of Object.entries(key[field] ?? {})) {
      if (!checkBone(issues, rig, name)) continue;
      if (Math.abs(norm(q) - 1) > 1e-3) {
        issues.push(
          error(
            name,
            `key ${key.t} not normalised, length ${norm(q).toFixed(4)}`,
          ),
        );
        continue;
      }

      if (ambient) {
        const moved = angleBetween(q, [0, 0, 0, 1]) * DEG;
        if (moved > limits.ambientDeg) {
          issues.push(
            warn(
              name,
              `key ${key.t} moves ${moved.toFixed(1)}deg, over the ${limits.ambientDeg}deg ambient limit`,
            ),
          );
        }
      } else {
        const moved = angleBetween(rig.bones[name].rest.rotation, q) * DEG;
        const ceiling = Math.max(ranges[name] ?? 0, FLOOR_DEG) * RANGE_SLACK;
        if (moved > ceiling) {
          issues.push(
            warn(
              name,
              `key ${key.t} is ${moved.toFixed(1)}deg from rest, reference poses reach ${ranges[name] ?? 0}deg`,
            ),
          );
        }
      }
    }
  }

  const last = entry.keys[entry.keys.length - 1].t;
  if (!Number.isFinite(entry.duration)) {
    issues.push(error(null, "no duration"));
  } else if (!ambient && entry.duration !== last) {
    issues.push(
      warn(
        null,
        `duration ${entry.duration} does not match the last key at ${last}`,
      ),
    );
  } else if (ambient && entry.duration < last) {
    issues.push(
      error(
        null,
        `duration ${entry.duration} is before the last key at ${last}`,
      ),
    );
  }

  if (ambient && entry.loop !== true)
    issues.push(warn(null, "ambient entry is not marked loop"));
  if (!ambient && entry.duration > limits.clipMs) {
    issues.push(
      warn(
        null,
        `${entry.duration}ms is over the ${limits.clipMs}ms clip limit`,
      ),
    );
  }

  return issues;
}

export function validateEntry(rig, entry, limits = LIMITS) {
  return isAnimated(entry)
    ? validateClip(rig, entry, limits)
    : validatePose(rig, entry);
}

export function validateFile(rig, data, limits = LIMITS) {
  const issues = [];

  for (const [name, entry] of Object.entries(data)) {
    for (const issue of validateEntry(rig, entry, limits)) {
      issues.push({ ...issue, entry: name });
    }
  }

  const loops = Object.entries(data).filter(
    ([, e]) => isAmbient(e) && e.duration > 0,
  );
  for (let i = 0; i < loops.length; i++) {
    for (let j = i + 1; j < loops.length; j++) {
      const [an, a] = loops[i];
      const [bn, b] = loops[j];
      const resync = (a.duration * b.duration) / gcd(a.duration, b.duration);
      if (resync < limits.resyncMs) {
        issues.push(
          warn(
            null,
            `${an} and ${bn} resync every ${(resync / 1000).toFixed(1)}s`,
          ),
        );
      }
    }
  }

  return issues;
}

export const hasErrors = (issues) => issues.some((i) => i.level === "error");

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

function checkBone(issues, rig, name) {
  if (!rig.bones[name]) {
    issues.push(error(name, "not a bone in this rig"));
    return false;
  }
  if (!rig.poseBones.includes(name)) {
    issues.push(warn(name, "not a possible bone, it will have no effect"));
  }
  return true;
}
