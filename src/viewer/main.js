import { createScene } from "./render/scene.js";
import { loadModel, createJoints } from "./render/skeleton.js";
import { createPicking } from "./edit/picking.js";
import { createGizmo } from "./edit/gizmo.js";
import { createReadout } from "./edit/readout.js";
import { createHistory } from "./edit/history.js";
import { createSave } from "./edit/save.js";
import { createAnimate } from "./edit/animate.js";
import { createMaterials } from "./render/materials.js";
import rig from "../../rig.json";

const { renderer, scene, camera, controls, onFrame, setColorSpace } =
  createScene();

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

const history = createHistory(rig, model);
const materials = createMaterials({ renderer, model, setColorSpace });
const save = createSave(rig, model);
const animate = createAnimate(rig, model);
onFrame(animate.tick);
const readout = createReadout(rig);

const selected = () => picking.selected?.userData.bone ?? null;

picking.onSelect((marker) => gizmo.attach(marker?.userData.bone ?? null));
gizmo.onDragStart(() => history.push(selected()));
onFrame(() => readout(selected()));

addEventListener("keydown", (e) => {
  if (e.target !== document.body) return;

  if (e.key === "z" && (e.ctrlKey || e.metaKey)) history.undo();
  else if (e.key === "r") history.reset(selected());
  else if (e.key === "R") history.resetAll();
  else if (e.key === "m")
    materials.toggle().catch((err) => console.error(err.message));
  else if (e.key === "e") exportPose();
  else if (e.key === "k")
    console.log(`key at ${animate.time}, ${animate.record()} bones`);
  else if (e.key === "x") animate.erase();
  else if (e.key === " ") animate.toggle();
  else if (e.key === ",") animate.step(-1);
  else if (e.key === ".") animate.step(1);
  else if (e.key === "j") animate.step(-1);
  else if (e.key === "k") animate.step(1);
  else return;

  e.preventDefault();
});

async function exportPose() {
  const name = prompt("pose name");
  if (!name) return;

  const { written, bones, issues = [], error } = await save(name);
  if (error) return console.error(error);

  console.log(`${written ? "wrote" : "refused"} ${name}, ${bones} bones`);
  for (const i of issues)
    console[i.level === "error" ? "error" : "warn"](`${i.bone}: ${i.message}`);
}

console.info(
  `${joints.joints.length} joints, shader ${__HAS_SHADER__ ? "available" : "off"}`,
);
