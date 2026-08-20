import { createScene } from "./render/scene.js";
import { loadModel, createJoints } from "./render/skeleton.js";
import { createMaterials } from "./render/materials.js";
import { createIcon } from "./render/icon.js";
import { frameModel } from "./render/framing.js";
import { createPicking } from "./edit/picking.js";
import { createGizmo } from "./edit/gizmo.js";
import { createHistory } from "./edit/history.js";
import { createSave } from "./edit/save.js";
import { createLoad } from "./edit/load.js";
import { createAnimate } from "./edit/animate.js";

//injectable prompt for commands that need a name
const defaultAsk = async (message, initial) => window.prompt(message, initial);

export async function createStudio(container, { url, ask = defaultAsk } = {}) {
  const stage = createScene(container);
  const { renderer, scene, camera, controls, grid, onFrame, onResize } = stage;

  const { model, rig } = await loadModel(url);
  scene.add(model);

  // nw4f_root is model transform, not a joint. All poses leave it
  // untouched. rotating it turns the whole Mii
  const posable = rig.poseBones.filter((n) => n !== "nw4f_root");

  const joints = createJoints(model, posable);
  scene.add(joints.group);
  onFrame(joints.sync);
  onResize((w, h) => joints.resize(w, h));

  const gizmo = createGizmo({ camera, renderer, scene, orbit: controls });
  const picking = createPicking({
    renderer,
    camera,
    joints: joints.joints,
    busy: gizmo.busy,
  });

  const history = createHistory(rig, model);
  const materials = createMaterials({
    renderer,
    model,
    setColorSpace: stage.setColorSpace,
  });
  const save = createSave(rig, model);
  const animate = createAnimate(rig, model);
  const load = createLoad(model, animate, history);
  const icon = createIcon({
    renderer,
    scene,
    camera,
    controls,
    model,
    hide: [grid],
    lines: joints,
  });

  onFrame(animate.tick);

  const selected = () => picking.selected?.userData.bone ?? null;

  picking.onSelect((marker) => gizmo.attach(marker?.userData.bone ?? null));
  gizmo.onDragStart(() => history.push(selected()));

  const exportPose = async () => {
    const name = await ask("pose name");
    if (!name) return;

    const result = await save(name);
    return { name, ...result };
  };

  const loadPose = async () => {
    const name = await ask("pose name");
    if (!name) return;

    return { name, ...(await load(name)) };
  };

  async function setDuration() {
    const ms = Number(await ask("duration in ms", animate.timeline.duration));
    if (Number.isFinite(ms) && ms > 0) animate.setDuration(ms);
  }

  const command = (id, label, group, keys, run) => ({
    id,
    label,
    group,
    keys,
    run,
  });

  const commands = [
    // ==== timeline ====
    command("key.record", "record", "timeline", ["x"], () => animate.record()),
    command("key.erase", "delete key", "timeline", ["a"], () =>
      animate.erase(),
    ),
    command("key.prev", "previous key", "timeline", ["y"], () =>
      animate.jump(-1),
    ),
    command("key.next", "next key", "timeline", ["c"], () => animate.jump(1)),
    command("key.back", "step back", "timeline", [","], () => animate.step(-1)),
    command("key.forward", "step forward", "timeline", ["."], () =>
      animate.step(1),
    ),
    command("key.play", "play/pause", "timeline", ["space"], () =>
      animate.toggle(),
    ),
    command("clip.type", "clip or ambient", "timeline", ["t"], () =>
      animate.setType(animate.timeline.type === "clip" ? "ambient" : "clip"),
    ),
    command("clip.duration", "set duration", "timeline", ["d"], setDuration),

    // ==== history ====
    command("pose.reset", "reset bone", "pose", ["r"], () =>
      history.reset(selected()),
    ),
    command("pose.resetAll", "reset all", "pose", ["R"], () =>
      history.resetAll(),
    ),
    command("pose.undo", "undo", "pose", ["ctrl+z"], () => history.undo()),

    // ==== file ====
    command("file.export", "export pose", "file", ["e"], exportPose),
    command("file.load", "load pose", "file", ["o"], loadPose),
    command("file.icon", "save icon", "file", ["i"], () => icon(512, null)),
    command("file.iconGrey", "save icon on grey", "file", ["I"], () =>
      icon(512, "#ededed"),
    ),

    // ==== view ====
    command("view.frame", "face and centre", "view", ["f"], () =>
      frameModel(camera, controls, model),
    ),
    command("view.shader", "lut shader", "view", ["m"], () =>
      materials.toggle(),
    ),
  ];

  return {
    ...stage,
    rig,
    model,
    joints,
    animate,
    history,
    materials,
    commands,
    selected,
    onSelect: picking.onSelect,
    dispose: stage.dispose,
  };
}
