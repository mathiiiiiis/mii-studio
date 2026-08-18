import { mul, conjugate } from "./quat.js";

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
