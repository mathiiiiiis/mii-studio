import { createScene } from "./scene.js";
import { loadModel, createJoints } from "./skeleton.js";
import rig from "../../rig.json";

const { scene, onFrame } = createScene();

const model = await loadModel(__MODEL_URL__);
scene.add(model);

const joints = createJoints(model, rig.poseBones);
scene.add(joints.group);
onFrame(joints.sync);

console.log(
  `${joints.joints.length} joints, shader ${__HAS_SHADER__ ? "available" : "off"}`,
);
