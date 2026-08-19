import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, isAbsolute } from "node:path";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const DEFAULTS = {
  model: "assets/mii.glb",
  output: "build/poses.json",
};

export const LIMITS = {
  ambientDeg: 3,
  clipMs: 2000,
  resyncMs: 30000,
};

export function loadConfig(overrides = {}) {
  const file = resolve(ROOT, "mii-studio.config.json");
  const user = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
  const merged = { ...DEFAULTS, ...user, ...overrides };

  for (const key of Object.keys(DEFAULTS)) {
    const value = merged[key];
    if (typeof value !== "string") {
      throw new Error(
        `config "${key}" must be a path string, got ${typeof value}`,
      );
    }
    merged[key] = isAbsolute(value) ? value : resolve(ROOT, value);
  }
  merged.limits = { ...LIMITS, ...user.limits, ...overrides.limits };
  return merged;
}
