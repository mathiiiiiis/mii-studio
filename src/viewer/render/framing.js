import * as THREE from "three";

const box = new THREE.Box3();
const center = new THREE.Vector3();

export function frameModel(camera, controls, model) {
  model.updateMatrixWorld(true);
  box.setFromObject(model, true);
  box.getCenter(center);

  let distance = Math.hypot(
    camera.position.x - controls.target.x,
    camera.position.z - controls.target.z,
  );

  if (distance < 1e-4)
    distance = camera.position.distanceTo(controls.target) || 1;

  controls.target.copy(center);
  camera.position.set(center.x, center.y, center.z + distance);
  controls.update();
}
