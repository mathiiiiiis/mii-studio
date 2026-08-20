import { createStudio } from "./studio.js";
import { createReadout } from "./edit/readout.js";
import { findCommand } from "../ui/commands.js";

const studio = await createStudio(document.getElementById("viewport"), {
  url: __MODEL_URL__,
});

const readout = createReadout(studio.rig);
studio.onFrame(() => readout(studio.selected(), studio.animate));

addEventListener("keydown", (e) => {
  if (e.target !== document.body) return;

  const command = findCommand(studio.commands, e);
  if (!command) return;

  e.preventDefault();
  Promise.resolve(command.run()).catch((err) => console.error(err.message));
});

console.info(
  `${studio.joints.joints.length} joints, shader ${__HAS_SHADER__ ? "available" : "off"}`,
);
