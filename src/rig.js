import { readFileSync } from "node:fs";
import { mul, rotateVec } from "./math/quat.js";
import { loadConfig } from "./config.js";

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;
const IDENTITY = [0, 0, 0, 1];

export const POSE_BONES = [
  //spine and stuff
  "nw4f_root",
  "Skl_Root",
  "Spine_1",
  "Spine_2",
  "Head",
  //arm left
  "Arm_1_L",
  "Arm_2_L",
  "Wrist_L",
  //arm right
  "Arm_1_R",
  "Arm_2_R",
  "Wrist_R",
  //body or so
  "Waist",
  //leg left
  "Leg_1_L",
  "Leg_2_L",
  "Ankle_L",
  //leg right
  "Leg_1_R",
  "Leg_2_R",
  "Ankle_R",
];

export function parseGlb(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, true) !== GLB_MAGIC) throw new Error("not a glb file");

  const total = view.getUint32(8, true);
  let json = null;
  let bin = null;
  let off = 12;

  while (off < total) {
    const len = view.getUint32(off, true);
    const type = view.getUint32(off + 4, true);
    const body = bytes.subarray(off + 8, off + 8 + len);
    if (type === CHUNK_JSON) json = JSON.parse(new TextDecoder().decode(body));
    else if (type === CHUNK_BIN) bin = body;
    off += 8 + len;
  }

  if (!json) throw new Error("glb has no json chunk");
  return { json, bin };
}

export function buildRig(gltf) {
  const nodes = gltf.nodes ?? [];
  const skin = gltf.skins?.[0];
  if (!skin) throw new Error("glb has no skin");

  // Mesh nodes sit in the same array, so joint membership is the filter
  const joints = new Set(skin.joints);

  const childOf = new Map();
  nodes.forEach((n, i) => (n.children ?? []).forEach((c) => childOf.set(c, i)));

  const bones = {};
  const order = [];

  const walk = (index, parentName, parentWorld, parentPos) => {
    const bone = buildBone(
      nodes[index],
      index,
      parentName,
      parentWorld,
      parentPos,
    );
    bones[bone.name] = bone;
    order.push(bone.name);
    for (const c of nodes[index].children ?? []) {
      if (!joints.has(c)) continue;
      bone.children.push(nodes[c].name);
      walk(c, bone.name, bone.world, bone.position);
    }
  };

  // A root is a joint whose parent is not itself a joint
  for (const j of skin.joints) {
    if (joints.has(childOf.get(j))) continue;
    walk(j, null, IDENTITY, [0, 0, 0]);
  }

  // Letters assigned in traversal order
  // Not hardcoded, so a reexport that shifts the conversion regroups
  // instead of mislabelling
  const groups = {};
  const letters = new Map();
  for (const name of order) {
    const bone = bones[name];
    if (!letters.has(bone.signature)) {
      const letter = String.fromCharCode(65 + letters.size);
      letters.set(bone.signature, letter);
      groups[letter] = [];
    }
    bone.group = letters.get(bone.signature);
    groups[bone.group].push(name);
  }

  return {
    boneCount: order.length,
    order,
    bones,
    groups,
    poseBones: POSE_BONES.filter((n) => bones[n]),
  };
}

export function loadRig(path) {
  const model = path ?? loadConfig().model;
  const { json } = parseGlb(readFileSync(model));
  return { source: model, ...buildRig(json) };
}

function axisLabel(v) {
  //rig axes land on cardinal directions, so dominant component is exact
  let i = 0;
  for (let k = 1; k < 3; k++) if (Math.abs(v[k]) > Math.abs(v[i])) i = k;
  return (v[i] > 0 ? "+" : "-") + "xyz"[i];
}

function buildBone(node, index, parentName, parentWorld, parentPos) {
  const rest = {
    translation: node.translation ?? [0, 0, 0],
    rotation: node.rotation ?? IDENTITY,
  };

  //no node carries scale, this is a plain product and needs no matrices
  const world = mul(parentWorld, rest.rotation);
  const position = rotateVec(parentWorld, rest.translation);
  position[0] += parentPos[0];
  position[1] += parentPos[1];
  position[2] += parentPos[2];

  const axes = {
    x: axisLabel(rotateVec(world, [1, 0, 0])),
    y: axisLabel(rotateVec(world, [0, 1, 0])),
    z: axisLabel(rotateVec(world, [0, 0, 1])),
  };

  return {
    name: node.name,
    node: index,
    parent: parentName,
    children: [],
    rest,
    parentWorld, // P in q_local P P^1 * D * P * R
    world,
    position,
    axes,
    signature: axes.x + axes.y + axes.z,
    group: null,
  };
}
