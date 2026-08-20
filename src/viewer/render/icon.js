import * as THREE from "three";

const SIZE = 512;
const BACKGROUND = "#ededed";
const SUPERSAMPLE = 4;

export function createIcon({ renderer, scene, camera, hide = [], lines }) {
  const previous = new THREE.Vector2();

  return async function capture(size = SIZE, background = BACKGROUND) {
    const ratio = renderer.getPixelRatio();
    const aspect = camera.aspect;
    const hidden = hide.map((o) => o.visible);
    const sceneBackground = scene.background;
    const render = size * SUPERSAMPLE;
    renderer.getSize(previous);

    for (const o of hide) o.visible = false;

    scene.background = background ? new THREE.Color(background) : null;

    //render a fixed square without changing the CSS size
    renderer.setPixelRatio(1);
    renderer.setSize(render, render, false);
    lines?.resize(render, render, SUPERSAMPLE);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);

    //read buffer before its cleared
    const url = renderer.domElement.toDataURL("image/png");

    renderer.setPixelRatio(ratio);
    renderer.setSize(previous.x, previous.y, false);
    lines?.resize(previous.x, previous.y);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    scene.background = sceneBackground;
    hide.forEach((o, i) => (o.visible = hidden[i]));

    const image = new Image();
    image.src = url;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = true;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size);
    ctx.clip();
    ctx.drawImage(image, 0, 0, size, size);

    const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
    const href = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = href;
    a.download = `icon-${size}.png`;
    a.click();
    URL.revokeObjectURL(href);

    return size;
  };
}
