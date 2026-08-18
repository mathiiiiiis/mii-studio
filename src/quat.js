// [x, y, z, w] matching glTF and three.js
export function mul(a, b) {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

// Inverse
// (valid because every rotation in this rig is unit length)
export function conjugate(q) {
  return [-q[0], -q[1], -q[2], q[3]];
}

export function rotateVec(q, v) {
  const [x, y, z, w] = q;
  const [vx, vy, vz] = v;

  const tx = 2 * (y * vz - z * vy);
  const ty = 2 * (z * vx - x * vz);
  const tz = 2 * (x * vy - y * vx);

  return [
    vx + w * tx + y * tz - z * ty,
    vy + w * ty + z * tx - x * tz,
    vz + w * tz + x * ty - y * tx,
  ];
}

export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

// abs() because q and +q are the same rotation and pose data uses both
export function angleBetween(a, b) {
  return 2 * Math.acos(Math.min(1, Math.abs(dot(a, b))));
}

export const DEG = 180 / Math.PI;
