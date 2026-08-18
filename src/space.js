import { mul, conjugate } from "./quat.js";

const RAD = Math.PI / 180;

export const WORLD = {
  right: [1, 0, 0],
  up: [0, 1, 0],
  forward: [0, 0, 1],
};

// q_local = P^-1 * D * P * R
export function toLocal(bone, worldDelta) {
  const P = bone.parentWorld;
  return mul(mul(mul(conjugate(P), worldDelta), P), bone.rest.rotation);
}

// D = P * q_local * R^-1 * P^-1
export function toWorld(bone, localRotation) {
  const P = bone.parentWorld;
  return mul(
    mul(mul(P, localRotation), conjugate(bone.rest.rotation)),
    conjugate(P),
  );
}

export function axisAngle(axis, degrees) {
  const n = Math.hypot(...axis);
  const h = degrees * RAD * 0.5;
  const s = Math.sin(h) / n;
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(h)];
}

export function toAxisAngle(q) {
  //flip to positive hemisphere for consistent rotation signs
  const sign = q[3] < 0 ? -1 : 1;
  const s = Math.hypot(q[0], q[1], q[2]);
  return {
    axis:
      s < 1e-9
        ? [0, 1, 0]
        : [(sign * q[0]) / s, (sign * q[1]) / s, (sign * q[2]) / 2],
    degrees: (2 * Math.acos(Math.min(1, sign * q[3]))) / RAD,
  };
}
