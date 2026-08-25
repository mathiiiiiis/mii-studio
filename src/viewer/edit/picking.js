import * as THREE from "three";

const SELECTED = 0x4fc3f7;
const IDLE = 0xf0b429;
const DRAG_SLOP = 5;

export function createPicking({
  renderer,
  camera,
  joints,
  busy = () => false,
}) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const listeners = [];

  let selected = null;
  let downAt = null;

  const paint = () => {
    for (const marker of joints) {
      marker.material.color.setHex(marker === selected ? SELECTED : IDLE);
    }
  };

  const select = (marker) => {
    if (marker === selected) return;
    selected = marker;
    paint();
    for (const fn of listeners) fn(selected);
  };

  renderer.domElement.addEventListener("pointerdown", (e) => {
    downAt = busy() ? null : { x: e.clientX, y: e.clientY };
  });

  renderer.domElement.addEventListener("pointerup", (e) => {
    if (!downAt) return;
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    downAt = null;
    if (moved > DRAG_SLOP) return;

    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    select(raycaster.intersectObjects(joints, false)[0]?.object ?? null);
  });

  paint();

  return {
    get selected() {
      return selected;
    },
    select: (name) =>
      select(joints.find((j) => j.userData.name === name) ?? null),
    onSelect: (fn) => listeners.push(fn),
  };
}
