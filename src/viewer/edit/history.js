const LIMIT = 100;

export function createHistory(rig, model) {
  const stack = [];

  const push = (bone) => {
    if (!bone) return;
    stack.push({ bone, quaternion: bone.quaternion.clone() });
    if (stack.length > LIMIT) stack.shift();
  };

  const undo = () => {
    const last = stack.pop();
    if (last) last.bone.quaternion.copy(last.quaternion);
    return last?.bone ?? null;
  };

  const reset = (bone) => {
    if (!bone) return;
    push(bone);
    bone.quaternion.fromArray(rig.bones[bone.name].rest.rotation);
  };

  const resetAll = () => {
    for (const name of Object.keys(rig.bones)) {
      const bone = model.getObjectByName(name);
      if (!bone) continue;
      push(bone);
      bone.quaternion.fromArray(rig.bones[name].rest.rotation);
    }
  };

  return { push, undo, reset, resetAll };
}
