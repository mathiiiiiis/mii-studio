import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

const GIZMO_SIZE = 0.5;

export function createGizmo({ camera, renderer, scene, orbit }) {
  const controls = new TransformControls(camera, renderer.domElement);
  controls.setMode("rotate");
  controls.setSpace("world");
  controls.setSize(GIZMO_SIZE);

  scene.add(controls.getHelper());

  controls.addEventListener("dragging-changed", (e) => {
    orbit.enabled = !e.value;
  });

  const starts = [];
  controls.addEventListener("mouseDown", () => {
    for (const fn of starts) fn(controls.object);
  });

  return {
    attach(bone) {
      if (bone) controls.attach(bone);
      else controls.detach();
    },
    //ignore picking while hovering or draging
    busy: () => controls.axis !== null || controls.dragging,
    onChange: (fn) => starts.push(fn),
  };
}
