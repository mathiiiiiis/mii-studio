import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadRig } from "../src/rig.js";
import { ROOT } from "../src/config.js";

const args = process.argv.slice(2);
const model = args.find((a) => a.endsWith(".glb"));
const rig = loadRig(model ? resolve(process.cwd(), model) : null);

if (args.includes("--table")) {
  console.table(
    rig.poseBones.map((n) => {
      const b = rig.bones[n];
      return {
        bone: n,
        parent: b.parent ?? "-",
        "+X": b.axes.x,
        "+Y": b.axes.y,
        "+Z": b.axes.z,
        group: b.group,
        y: Number(b.position[1].toFixed(4)),
      };
    }),
  );
  process.exit(0);
}

const out = resolve(ROOT, "rig.json");
writeFileSync(out, JSON.stringify(rig, null, 2));
console.log(
  `${rig.boneCount} bones, ${rig.poseBones.length} posable, ${Object.keys(rig.groups).length} groups`,
);
