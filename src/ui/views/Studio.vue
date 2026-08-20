<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import { createStudio } from "../../viewer/studio.js";
import { findCommand } from "../state/commands.js";
import { createStudioState } from "../state/studio.js";
import Readout from "../panels/Readout.vue";

const viewport = ref(null);
const studio = shallowRef(null);
const state = shallowRef(null);

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

  state.value = createStudioState(instance);

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
  <Readout v-if="state" :state="state" :commands="studio.commands" />
</template>

<style lang="scss" scoped>
.viewport {
  width: 100%;
  height: 100%;
}
</style>
