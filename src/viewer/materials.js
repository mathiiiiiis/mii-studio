import * as THREE from "three";

// FFlModulateType per mesh, picks specular and fresnel LUT curve
const MODULATE_TYPE = {
  Faceline: 0,
  Nose: 2,
  Hair: 4,
  Mask: 6,
  Noseline: 7,
  clothes_m_ArmsShortsleeve: 9,
  clothes_m_ShirtShortsleeve: 9,
  clothes_m_Shorts: 10,
};

const MODE_CONSTANT = 0;
const MODE_TEXTURE_DIRECT = 1;

export function createMaterials({ renderer, model, setColorSpace }) {
  const meshes = [];
  model.traverse((o) => {
    if (o.isMesh) meshes.push(o);
  });

  for (const mesh of meshes) mesh.userData.plain = mesh.material;

  let lut = false;
  let built = false;

  async function build() {
    const { default: LUTShaderMaterial } = await import("virtual:lut-shader");

    for (const mesh of meshes) {
      const src = mesh.userData.plain;
      const material = new LUTShaderMaterial({
        modulateMode: src.map ? MODE_TEXTURE_DIRECT : MODE_CONSTANT,
        modulateType: MODULATE_TYPE[mesh.name] ?? 0,
        // gltf baseColorFactor is linear, shader wants sRGB
        color: src.color.clone().convertLinearToSRGB(),
        map: src.map,
        transparent: src.transparent,
        opacity: src.opacity,
        side: src.side,
      });

      if (material.transparent) {
        material.depthWrite = false;
        mesh.renderOrder = mesh.name === "Noseline" ? 2 : 1;
      }

      mesh.userData.lut = material;
    }
    built = true;
  }

  async function apply() {
    if (lut && !built) await build();

    for (const mesh of meshes) {
      const src = mesh.userData.plain;
      if (src.map) {
        //LUT shader epects raw sRGB
        src.map.colorSpace = lut ? THREE.NoColorSpace : THREE.SRGBColorSpace;
        src.map.generateMipmaps = true;
        src.map.minFilter = THREE.LinearMipmapLinearFilter;
        src.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
        src.map.needsUpdate = true;
      }

      mesh.material = lut ? mesh.userData.lut : src;
      if (!lut) mesh.renderOrder = 0;
    }

    renderer.outputColorSpace = lut
      ? THREE.LinearSRGBColorSpace
      : THREE.SRGBColorSpace;

    setColorSpace(renderer.outputColorSpace);
  }

  return {
    available: __HAS_SHADER__,
    get lut() {
      return lut;
    },
    async toggle() {
      //if (!__HAS_SHADER__) return false;
      lut = !lut;
      await apply();
      return lut;
    },
  };
}
