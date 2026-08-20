import { readFileSync } from "node:fs";
import { parseGlb, buildRig } from "./rig.js";
import { loadConfig } from "./config.js";

export function loadRig(path) {
  const model = path ?? loadConfig().model;
  const { json } = parseGlb(readFileSync(model));
  return { source: model, ...buildRig(json) };
}
