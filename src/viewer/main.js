import { createScene } from "./scene.js";
import { loadModel, createJoints } from "./skeleton.js";
import { createPicking } from "./picking.js";
import { createGizmo } from "./gizmo.js";
import rig from "../../rig.json";

const { renderer, scene, camera, controls, onFrame } = createScene();

const model = await loadModel(__MODEL_URL__);
scene.add(model);

// nw4f_root is model transform, not a joint. All poses leave it
// untouched. rotating it turns the whole Mii
const posable = rig.poseBones.filter((n) => n !== "nw4f_root");

const joints = createJoints(model, posable);
scene.add(joints.group);
onFrame(joints.sync);

const gizmo = createGizmo({ camera, renderer, scene, orbit: controls });
const picking = createPicking({
  renderer,
  camera,
  joints: joints.joints,
  busy: gizmo.busy,
});

picking.onSelect((marker) => gizmo.attach(marker?.userData.bone ?? null));

console.info(
  `${joints.joints.length} joints, shader ${__HAS_SHADER__ ? "available" : "off"}`,
);
