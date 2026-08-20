import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const BACKGROUND = 0x16181d;

const GRID = 0x6b7789;
const GRID_SIZE = 4;
const GRID_STEP = 0.25;

function createGrid() {
  const points = [];
  const half = GRID_SIZE / 2;
  for (let v = -half; v <= half; v += GRID_STEP) {
    points.push(-half, 0, v, half, 0, v, v, 0, -half, v, 0, half);
  }
  return new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3),
    ),
    new THREE.LineBasicMaterial({ color: GRID }),
  );
}

export function createScene(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  camera.position.set(0.9, 1.4, 3.4);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.05, 0);
  controls.enableDamping = true;

  scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x2a2f3a, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(2, 3, 4);
  scene.add(key);

  const grid = createGrid();
  scene.add(grid);

  const setColorSpace = (space) => {
    scene.background.setHex(BACKGROUND, space);
    grid.material.color.setHex(GRID, space);
  };

  const perFrame = [];
  const perResize = [];

  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;

    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    for (const fn of perResize) fn(w, h);
  };

  //observe container size
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  renderer.setAnimationLoop(() => {
    controls.update();
    for (const fn of perFrame) fn();
    renderer.render(scene, camera);
  });

  const dispose = () => {
    observer.disconnect();
    renderer.setAnimationLoop(null);
    controls.dispose();
    grid.geometry.dispose();
    grid.material.dispose();
    renderer.domElement.remove();
    perFrame.length = 0;
    perResize.length = 0;
  };

  return {
    renderer,
    scene,
    camera,
    controls,
    grid,
    onFrame: (fn) => perFrame.push(fn),
    onResize: (fn) => perResize.push(fn),
    setColorSpace,
    dispose,
  };
}
