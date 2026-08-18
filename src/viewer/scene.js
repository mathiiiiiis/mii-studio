import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function createScene() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  document.body.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x16181d);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  camera.position.set(0.9, 1.4, 3.4);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.05, 0);
  controls.enableDamping = true;

  scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x2a2f3a, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(2, 3, 4);
  scene.add(key);

  const grid = new THREE.GridHelper(4, 16, 0x3a4150, 0x262b34);
  scene.add(grid);

  const resize = () => {
    const w = innerWidth;
    const h = innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  addEventListener("resize", resize);
  resize();

  const perFrame = [];
  const onFrame = (fn) => perFrame.push(fn);

  renderer.setAnimationLoop(() => {
    controls.update();
    for (const fn of perFrame) fn();
    renderer.render(scene, camera);
  });

  return { renderer, scene, camera, controls, onFrame };
}
