import * as THREE from "three";
import { toAxisAngle } from "../../math/space.js";

const STYLE = `
position:fixed; top:12px; left:12px; padding:10px 12px;
font:12px/1.5 ui-monospace,monospace; color:#c9d3e0;
background:#1e222acc; border:1px solid #333a46; border-radius:4px;
white-space:pre; pointer-events:none;
`;

export function createReadout(rig) {
  const el = document.createElement("div");
  el.style.cssText = STYLE;
  document.body.append(el);

  const live = new THREE.Quaternion();
  const rest = new THREE.Quaternion();
  const delta = new THREE.Quaternion();

  return (bone) => {
    if (!bone) {
      el.textContent = "no bone selected";
      return;
    }

    //compare live world orientation to cached rest pose
    bone.getWorldQuaternion(live);
    rest.fromArray(rig.bones[bone.name].world);
    delta.multiplyQuaternions(live, rest.invert());

    const { axis, degrees } = toAxisAngle(delta.toArray());
    const q = bone.quaternion.toArray().map((n) => n.toFixed(4));

    el.textContent = [
      bone.name,
      `\nworld: ${degrees.toFixed(1)}def`,
      `\nabout: ${axis.map((n) => n.toFixed(2)).join(" ")}`,
      `\nlocal: ${q.join("  ")}`,
    ];
  };
}
