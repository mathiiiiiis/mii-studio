import fixtures from "../../../fixtures/poses.json";
import { isAnimated } from "../../anim/sampler.js";

async function sources() {
  let output = {};
  try {
    output = await (await fetch("/__poses")).json();
  } catch {
    output = {};
  }
  return { ...fixtures, ...output };
}

export function createLoad(model, animate, history) {
  return async (name) => {
    const data = await sources();
    const entry = data[name];

    if (!entry) return { names: Object.keys(data) };

    //reset bones so previous pose does not bleed through
    history.resetAll();

    if (isAnimated(entry)) {
      animate.timeline.load(entry);
      animate.seek(0);
    } else {
      for (const [bone, q] of Object.entries(entry.rotation ?? {})) {
        model.getObjectByName(bone)?.quaternion.fromArray(q);
      }
    }

    return { entry, animated: isAnimated(entry) };
  };
}
