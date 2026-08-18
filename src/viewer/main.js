import { createScene } from "./scene.js";
import { loadModel, createJoints } from "./skeleton.js";
import { createPicking } from "./picking.js";
import rig from "../../rig.json";

const { renderer, scene, camera, onFrame } = createScene();

const model = await loadModel(__MODEL_URL__);
scene.add(model);

// nw4f_root is model transform, not a joint. All poses leave it
// untouched. rotating it turns the whole Mii
const posable = rig.poseBones.filter((n) => n !== "nw4f_root");

const joints = createJoints(model, posable);
scene.add(joints.group);
onFrame(joints.sync);

const picking = createPicking({ renderer, camera, joints: joints.joints });
picking.onSelect((marker) => console.log(marker?.userData.name ?? "none"));

console.log(
  `${joints.joints.length} joints, shader ${__HAS_SHADER__ ? "available" : "off"}`,
);
