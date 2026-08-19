import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadRig } from "../src/rig.js";
import { angleBetween, DEG } from "../src/quat.js";
import { ROOT } from "../src/config.js";

const rig = loadRig();
const poses = JSON.parse(
  readFileSync(resolve(ROOT, "fixtures/poses.json"), "utf8"),
);

const ranges = {};
for (const name of rig.poseBones) {
  const rest = rig.bones[name].rest.rotation;
  const seen = Object.values(poses)
    .map((p) => p.rotation[name])
    .filter(Boolean)
    .map((q) => angleBetween(rest, q) * DEG);

  if (seen.length) ranges[name] = Number(Math.max(...seen).toFixed(1));
}

const out = resolve(ROOT, "src/data/ranges.json");
writeFileSync(out, JSON.stringify(ranges, null, 2) + "\n");
console.log(`${Object.keys(ranges).length} bones -> ${out}`);
