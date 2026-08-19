import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadRig } from "../src/rig.js";
import { readPose, toAxisAngle } from "../src/math/space.js";
import { ROOT } from "../src/config.js";

const [name, file] = process.argv.slice(2);
const poses = JSON.parse(
  readFileSync(resolve(ROOT, file ?? "fixtures/poses.json"), "utf8"),
);

if (!poses[name]) {
  console.error(`no pose ${name}, have: ${Object.keys(poses).join(" ")}`);
  process.exit(1);
}

const rig = loadRig();
const deltas = readPose(rig, poses[name]);
console.table(
  rig.poseBones
    .filter((n) => deltas[n])
    .map((n) => {
      const { axis, degrees } = toAxisAngle(deltas[n]);
      return {
        bone: n,
        deg: Number(degrees.toFixed(1)),
        x: Number(axis[0].toFixed(3)),
        y: Number(axis[1].toFixed(3)),
        z: Number(axis[2].toFixed(3)),
      };
    })
    .filter((r) => r.deg > 0.5),
);
