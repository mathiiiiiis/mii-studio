import * as THREE from "three";
import { toAxisAngle } from "../../math/space.js";

const STYLE = `
position:fixed; top:12px; left:12px; padding:10px 12px;
font:12px/1.5 ui-monospace,monospace; color:#c9d3e0;
background:#1e222acc; border:1px solid #333a46; border-radius:4px;
white-space:pre; pointer-events:none;
`;

const TRACK = 48;

const KEYS = [
  ["y x c", "prev key, record, next key"],
  [", .", "step 50ms"],
  ["a", "delete key"],
  ["space", "play/pause"],
  ["t d", "type, duration"],
  ["e", "export"],
  ["r R", "reset bone, reset all"],
  ["ctrl+z", "undo"],
  ["m", "lut shader"],
  ["i", "save icon"],
  ["f", "frame model"],
];

const PAD = Math.max(...KEYS.map(([k]) => k.length));

const help = KEYS.map(([k, what]) => `  ${k.padEnd(PAD)}  ${what}`).join("\n");

const track = (a) => {
  const cells = Array(TRACK).fill("·");
  const at = (t) =>
    Math.round((t / Math.max(1, a.timeline.duration)) * (TRACK - 1));

  for (const t of a.timeline.keys) cells[at(t)] = "|";
  cells[at(a.time)] = a.timeline.keys.includes(a.time) ? "#" : "^";

  return cells.join("");
};

const header = (a) =>
  [
    `${a.playing ? "play" : "stop"}  ${a.time}/${a.timeline.duration}ms  ${a.timeline.type}`,
    track(a),
  ].join("\n");

export function createReadout(rig) {
  const el = document.createElement("div");
  el.style.cssText = STYLE;
  document.body.append(el);

  const live = new THREE.Quaternion();
  const rest = new THREE.Quaternion();
  const delta = new THREE.Quaternion();

  return (bone, animate) => {
    const lines = [header(animate), ""];

    if (bone) {
      //compare live world orientation to cached rest pose
      bone.getWorldQuaternion(live);
      rest.fromArray(rig.bones[bone.name].world).invert();
      delta.multiplyQuaternions(live, rest);

      const { axis, degrees } = toAxisAngle(delta.toArray());
      const q = bone.quaternion.toArray().map((n) => n.toFixed(4));

      lines.push(
        bone.name,
        `world: ${degrees.toFixed(1)}deg`,
        `about: ${axis.map((n) => n.toFixed(2)).join(" ")}`,
        `local: ${q.join("  ")}`,
      );
    } else {
      lines.push("no bone selected");
    }

    el.textContent = [...lines, "", help].join("\n");
  };
}
