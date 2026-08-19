import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, isAbsolute, relative } from "node:path";
import { defineConfig } from "vite";
import { poses } from "./vite-plugin-poses.js";

const root = dirname(fileURLToPath(import.meta.url));
const config = existsSync(resolve(root, "mii-studio.config.json"))
  ? JSON.parse(readFileSync(resolve(root, "mii-studio.config.json"), "utf8"))
  : {};

const model = config.model ?? "assets/mii.glb";
const shader = config.shader ? resolve(root, config.shader) : null;

export default defineConfig({
  plugins: [poses()],
  server: {
    fs: { allow: [root, ...(shader ? [dirname(shader)] : [])] },
  },
  resolve: {
    //always alias it so the dynamic import resolves at build time
    alias: {
      "virtual:lut-shader":
        shader ?? resolve(root, "src/viewer/render/no-shader.js"),
    },
  },
  define: {
    __MODEL_URL__: JSON.stringify(
      "/" + (isAbsolute(model) ? relative(root, model) : model),
    ),
    __HAS_SHADER__: JSON.stringify(Boolean(shader)),
  },
});
