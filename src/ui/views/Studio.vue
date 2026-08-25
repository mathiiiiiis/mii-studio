<script setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import { createStudio } from "../../viewer/studio.js";
import { findCommand, pickCommands } from "../state/commands.js";
import { createStudioState } from "../state/studio.js";
import { createDialog } from "../state/dialog.js";
//import Readout from "../panels/Readout.vue";
import Bar from "../controls/Bar.vue";
import Button from "../controls/Button.vue";
import Dialog from "../controls/Dialog.vue";
import Pager from "../controls/Pager.vue";
import TabHeader from "../controls/TabHeader.vue";
import Clips, { bar as clipsBar } from "../screens/Clips.vue";
import Pose, { bar as poseBar } from "../screens/Pose.vue";
import Timeline, { bar as timelineBar } from "../screens/Timeline.vue";

const screens = [
  { title: "Pose", view: Pose, bar: poseBar },
  { title: "Timeline", view: Timeline, bar: timelineBar },
  { title: "Clips", view: Clips, bar: clipsBar },
];

const page = ref(1);
const screen = computed(() => screens[page.value - 1]);
const actions = computed(() =>
  pickCommands(studio.value?.commands ?? [], screen.value.bar),
);

const version = `Ver ${__VERSION__}`;

const viewport = ref(null);
const studio = shallowRef(null);
const state = shallowRef(null);
const dialog = createDialog();

let teardown = null;

async function run(command) {
  try {
    await command.run();
  } catch (error) {
    console.error(error.message);
  }
}

async function onKeydown(event) {
  if (event.target !== document.body) return;

  const command = findCommand(studio.value.commands, event);
  if (!command) return;

  event.preventDefault();
  run(command);
}

onMounted(async () => {
  const instance = await createStudio(viewport.value, {
    url: __MODEL_URL__,
    ask: dialog.ask,
  });
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
  <div class="studio">
    <TabHeader :title="screen.title" :version="version" />

    <div class="stage">
      <div ref="viewport" class="viewport"></div>
      <component :is="screen.view" v-if="state" :state="state" />
      <Pager class="arrows" :pages="screens.length" v-model:page="page" />
    </div>

    <Bar>
      <Button
        v-for="command in actions"
        :key="command.id"
        @click="run(command)"
      >
        {{ command.label }}
      </Button>
    </Bar>
  </div>
  <!--<Readout v-if="state" :state="state" :commands="studio.commands" />-->
  <Dialog :dialog="dialog" />
</template>

<style lang="scss" scoped>
.studio {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
}

.stage {
  position: relative;
  min-height: 0;
  background: var(--surface-stage);
}

.arrows {
  position: absolute;
  inset: 0;
  padding-inline: calc(var(--control-height) * 0.5);
}

.viewport {
  width: 100%;
  height: 100%;
}
</style>
