import { mul, conjugate } from "../math/quat.js";

//ambient deltas are applies in bone local space
export const toDelta = (bone, local) =>
  mul(conjugate(bone.rest.rotation), local);

export const fromDelta = (bone, delta) => mul(bone.rest.rotation, delta);
