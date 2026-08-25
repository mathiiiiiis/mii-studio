<script>
export const bar = ["file.load", "file.export", "pose.resetAll"];
</script>

<script setup>
import { computed, ref } from "vue";
import Pager from "../controls/Pager.vue";
import Panel from "../controls/Panel.vue";
import Row from "../controls/Row.vue";

const props = defineProps({
  state: { type: Object, required: true },
});

const groups = [
  {
    title: "spine",
    bones: ["Skl_Root", "Spine_1", "Spine_2", "Head", "Waist"],
  },
  {
    title: "arms",
    bones: ["Arm_1_L", "Arm_2_L", "Wrist_L", "Arm_1_R", "Arm_2_R", "Wrist_R"],
  },
  {
    title: "legs",
    bones: ["Leg_1_L", "Leg_2_L", "Ankle_L", "Leg_1_R", "Leg_2_R", "Ankle_R"],
  },
];

const group = ref(1);
const bones = computed(() =>
  groups[group.value - 1].bones.filter(
    (name) => name in props.state.deviations.value,
  ),
);

const fixed = (n, places = 2) => Number(n).toFixed(places);
</script>

<template>
  <section class="pose">
    <Panel v-if="state.bone.value">
      <div class="name">{{ state.bone.value }}</div>
      <div class="numbers">
        {{ fixed(state.degrees.value, 1) }}deg about
        {{ state.axis.value.map((n) => fixed(n)).join(" ") }}
      </div>
    </Panel>

    <div class="list">
      <Row
        v-for="name in bones"
        :key="name"
        :label="name"
        :value="`${fixed(state.deviations.value[name], 1)}deg`"
        numeric
        :selected="state.bone.value === name"
        @click="state.select(name)"
      />


      <Pager
        v-model:page="group"
        :pages="groups.length"
        glyph="arrow"
        class="groups"
      >
        <span class="group">{{ groups[group - 1].title }}</span>
      </Pager>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.pose {
  display: grid;
  position: absolute;
  inset: 0;
  align-content: start;
  justify-items: start;
  gap: calc(var(--control-height) * 0.2);
  padding: calc(var(--control-height) * 0.5);
  pointer-events: none;
}

.list {
  display: grid;
  gap: calc(var(--control-height) * 0.2);
  width: min(20rem, 32vw);
  pointer-events: auto;
}


.groups {
  width: 100%;
  padding-inline: calc(var(--control-height) * 0.25);
}

.group {
  color: var(--ink-muted);
  font-size: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.numbers {
  color: var(--ink-muted);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
</style>
