import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const JOINT_RADIUS = 0.022;

export async function loadModel(url) {
  const gltf = await new GLTFLoader().loadAsync(url);
  const model = gltf.scene;
  model.traverse((o) => {
    if (o.isMesh) o.frustumCulled = false;
  });
  return model;
}

export function createJoints(model, boneNames) {
  const geometry = new THREE.SphereGeometry(JOINT_RADIUS, 12, 8);
  const group = new THREE.Group();
  const joints = [];

  for (const name of boneNames) {
    const bone = model.getObjectByName(name);
    if (!bone) continue;

    const material = new THREE.MeshBasicMaterial({
      color: 0xf0b429,
      depthTest: false,
    });
    const marker = new THREE.Mesh(geometry, material);
    marker.renderOrder = 10;
    marker.userData.bone = bone;
    marker.userData.name = name;

    group.add(marker);
    joints.push(marker);
  }

  const links = new THREE.LineSegments(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0x6f7a8d, depthTest: false }),
  );
  links.renderOrder = 9;
  group.add(links);

  const pairs = [];
  for (const marker of joints) {
    const parent = marker.userData.bone.parent;
    const other = joints.find((j) => j.userData.bone === parent);
    if (other) pairs.push([other, marker]);
  }

  const positions = new Float32Array(pairs.length * 6);
  links.geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  );

  const sync = () => {
    for (const marker of joints) {
      marker.userData.bone.getWorldPosition(marker.position);
    }
    pairs.forEach(([a, b], i) => {
      a.position.toArray(positions, i * 6);
      b.position.toArray(positions, i * 6 + 3);
    });
    links.geometry.attributes.position.needsUpdate = true;
  };

  return { group, joints, sync };
}
