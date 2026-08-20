import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { LineSegments2 } from "three/examples/jsm/lines/webgpu/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/Addons.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

const JOINT_RADIUS = 0.022;
const LINE_WIDTH = 3;

// Skl_Root, Spine_1 and Waist overlap, causing raycasts to select the
// wrong bone. Only the marker moves
const MARKER_OFFSET = {
  Spine_1: [0, 0.06, 0],
  Waist: [0, -0.06, 0],
};

export async function loadModel(url) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
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

    // Stored bone local, so marker rotates with body instead of
    // sliding off joint once torso bends
    const world = MARKER_OFFSET[name];
    marker.userData.offset = world
      ? new THREE.Vector3(...world).applyQuaternion(
          bone.getWorldQuaternion(new THREE.Quaternion()).invert(),
        )
      : null;

    group.add(marker);
    joints.push(marker);
  }

  const links = new LineSegments2(
    new LineSegmentsGeometry(),
    new LineMaterial({
      color: 0x6f7a8d,
      linewidth: LINE_WIDTH,
      depthTest: false,
    }),
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

  const spin = new THREE.Quaternion();
  const tmp = new THREE.Vector3();
  const sync = () => {
    for (const marker of joints) {
      const bone = marker.userData.bone;
      bone.getWorldPosition(marker.position);
      if (marker.userData.offset) {
        marker.position.add(
          tmp
            .copy(marker.userData.offset)
            .applyQuaternion(bone.getWorldQuaternion(spin)),
        );
      }
    }
    pairs.forEach(([a, b], i) => {
      a.position.toArray(positions, i * 6);
      b.position.toArray(positions, i * 6 + 3);
    });
    links.geometry.setPositions(positions);
  };

  const resize = (width, height, scale = 1) => {
    links.material.resolution.set(width, height);
    links.material.linewidth = LINE_WIDTH * scale;
  };

  resize(innerWidth, innerHeight);

  return { group, joints, sync, resize };
}
