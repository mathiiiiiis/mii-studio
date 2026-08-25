import { ref } from "vue";
import * as THREE from "three";
import { toAxisAngle } from "../../math/space.js";

const RATE = 1000 / 15;

export function createStudioState(studio) {
  const bone = ref(null);
  const degrees = ref(0);
  const axis = ref([0, 0, 0]);
  const local = ref([0, 0, 0, 1]);

  const posable = studio.rig.poseBones
    .filter((name) => name !== "nw4f_root")
    .map((name) => ({ name, bone: studio.model.getObjectByName(name) }))
    .filter((entry) => entry.bone);

  const deviations = ref(
    Object.fromEntries(posable.map((entry) => [entry.name, 0])),
  );

  const time = ref(0);
  const duration = ref(studio.animate.timeline.duration);
  const type = ref(studio.animate.timeline.type);
  const playing = ref(false);
  const keys = ref([]);

  const live = new THREE.Quaternion();
  const rest = new THREE.Quaternion();
  const delta = new THREE.Quaternion();

  let last = 0;

  studio.onFrame(() => {
    const now = performance.now();
    if (now - last < RATE) return;
    last = now;

    const { animate, rig } = studio;
    const timeline = animate.timeline;

    if (time.value !== animate.time) time.value = animate.time;
    if (duration.value !== timeline.duration)
      duration.value = timeline.duration;
    if (type.value !== timeline.type) type.value = timeline.type;
    if (playing.value !== animate.playing) playing.value = animate.playing;

    if (keys.value.join() !== timeline.keys.join()) keys.value = timeline.keys;

    for (const entry of posable) {
      entry.bone.getWorldQuaternion(live);
      rest.fromArray(rig.bones[entry.name].world).invert();
      delta.multiplyQuaternions(live, rest);

      //avoid rerenders from float noise
      const value = Math.round(toAxisAngle(delta.toArray()).degrees * 10) / 10;
      if (deviations.value[entry.name] !== value)
        deviations.value[entry.name] = value;
    }

    const selected = studio.selected();
    if (bone.value !== (selected?.name ?? null))
      bone.value = selected?.name ?? null;
    if (!selected) return;

    selected.getWorldQuaternion(live);
    rest.fromArray(rig.bones[selected.name].world).invert();
    delta.multiplyQuaternions(live, rest);

    const read = toAxisAngle(delta.toArray());
    degrees.value = read.degrees;
    axis.value = read.axis;
    local.value = selected.quaternion.toArray();
  });

  return {
    select: studio.select,
    bone,
    degrees,
    axis,
    local,
    deviations,
    time,
    duration,
    type,
    playing,
    keys,
  };
}
