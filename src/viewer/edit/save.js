import { collectPose } from "../../pose/collect.js";

export function createSave(rig, model) {
  const get = (name) => model.getObjectByName(name)?.quaternion.toArray();

  return async (name) => {
    const pose = collectPose(rig, get);
    const bones = Object.keys(pose.rotation).length;

    if (!bones) return { writte: false, issues: [], bones };

    const res = await fetch("/__poses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, pose }),
    });

    return { ...(await res.json()), bones };
  };
}
