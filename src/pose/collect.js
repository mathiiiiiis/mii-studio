import { angleBetween, DEG, normalize } from "../math/quat.js";
import { toWorld, toAxisAngle } from "../math/space.js";

//ignore negligible movement
const MOVED_DEG = 0.01;
const PRECISION = 5;

const round = (n) => Number(n.toFixed(PRECISION));

export function collectPose(rig, getQuaternion) {
  const rotation = {};

  for (const name of rig.poseBones) {
    const bone = rig.bones[name];
    const q = getQuaternion(name);
    if (!q) continue;
    if (angleBetween(q, bone.rest.rotation) * DEG < MOVED_DEG) continue;

    rotation[name] = normalize(q).map(round);
  }

  return { rotation };
}

export function describePose(rig, pose) {
  return Object.entries(pose.rotation).map(([name, q]) => {
    const { axis, degrees } = toAxisAngle(toWorld(rig.bones[name], q));
    return { name, degrees, axis };
  });
}
