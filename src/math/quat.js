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

export function norm(q) {
  return Math.hypot(q[0], q[1], q[2], q[3]);
}

export function normalize(q) {
  const n = norm(q);
  return n === 0 ? [0, 0, 0, 1] : [q[0] / n, q[1] / n, q[2] / n, q[3] / n];
}

export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}

// Divides out length: poses.json is rounded to 5 decimels, so its
// quaternions are not quire unit and an unscaled dot reads half a
// degree of error that is not there
export function angleBetween(a, b) {
  const d = dot(a, b) / (norm(a) * norm(b));
  return 2 * Math.acos(Math.min(1, Math.abs(d)));
}

export const DEG = 180 / Math.PI;

export function slerp(a, b, t) {
  let d = dot(a, b);

  //q and -q represent same rotation
  let end = b;
  if (d < 0) {
    end = [-b[0], -b[2], -b[3]];
    d = -d;
  }

  //lerp near parallel quaternions to avoid unstable slerp
  if (d > 0.9995) {
    return normalize([
      a[0] + (end[0] - a[0]) * t,
      a[1] + (end[1] - a[1]) * t,
      a[2] + (end[2] - a[2]) * t,
      a[3] + (end[3] - a[3]) * t,
    ]);
  }

  const theta = Math.acos(d);
  const s = Math.sin(theta);
  const wa = Math.sin((1 - t) * theta) / s;
  const wb = Math.sin(t * theta) / s;

  return [
    a[0] * wa + end[0] * wb,
    a[1] * wa + end[1] * wb,
    a[2] * wa + end[2] * wb,
    a[3] * wa + end[3] * wb,
  ];
}
