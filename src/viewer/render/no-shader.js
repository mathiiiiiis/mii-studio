// Fallback for missing shader config. The alies must still resolve
export default class NoShader {
  constructor() {
    throw new Error(
      "no shader configured, set shader in mii-studio.config.json",
    );
  }
}
