<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import { createStudio } from "../viewer/studio.js";
import { createReadout } from "../viewer/edit/readout.js";
import { findCommand } from "./commands.js";

const viewport = ref(null);
const studio = shallowRef(null);

let teardown = null;

async function onKeydown(event) {
  if (event.target !== document.body) return;

  const command = findCommand(studio.value.commands, event);
  if (!command) return;

  event.preventDefault();
  try {
    await command.run();
  } catch (error) {
    console.error(error.message);
  }
}

onMounted(async () => {
  const instance = await createStudio(viewport.value, { url: __MODEL_URL__ });
  studio.value = instance;

  const readout = createReadout(instance.rig);
  instance.onFrame(() => readout(instance.selected(), instance.animate));

  addEventListener("keydown", onKeydown);
  teardown = () => {
    removeEventListener("keydown", onKeydown);
    instance.dispose();
  };
});

onBeforeUnmount(() => teardown?.());
</script>

<template>
  <div ref="viewport" class="viewport"></div>
</template>

<style lang="scss">
html,
body {
  margin: 0;
  height: 100%;
  background: #16181d;
}

#app {
  height: 100%;
}

canvas {
  display: block;
}
</style>

<style lang="scss" scoped>
.viewport {
  width: 100%;
  height: 100%;
}
</style>
