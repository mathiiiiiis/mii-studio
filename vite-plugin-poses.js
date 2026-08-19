import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { loadRig } from "./src/rig.js";
import { validatePose, hasErrors } from "./src/pose/validate.js";
import { formatPoses } from "./src/pose/format.js";
import { loadConfig } from "./src/config.js";

const ROUTE = "/__poses";

const read = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
  });

export function poses() {
  return {
    name: "mii-studio-poses",
    configureServer(server) {
      const rig = loadRig();
      const { output } = loadConfig();

      server.middlewares.use(ROUTE, async (req, res) => {
        const send = (status, body) => {
          res.statusCode = status;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(body));
        };

        if (req.method !== "POST") return send(405, { error: "post only" });

        let payload;
        try {
          payload = await read(req);
        } catch {
          return send(400, { error: "bad json" });
        }

        const { name, pose } = payload;
        if (!name || !pose)
          return send(400, { error: "name and pose required" });

        const issues = validatePose(rig, pose);
        if (hasErrors(issues)) return send(422, { written: false, issues });

        //merge, file holds every pose
        const existing = existsSync(output)
          ? JSON.parse(readFileSync(output, "utf8"))
          : {};

        existing[name] = pose;

        mkdirSync(dirname(output), { recursive: true });
        writeFileSync(output, formatPoses(existing));

        send(200, { written: true, name, output, issues });
      });
    },
  };
}
