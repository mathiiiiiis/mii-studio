<script>
export const bar = ["file.load", "file.export", "pose.resetAll"];
</script>

<script setup>
import Panel from "../controls/Panel.vue";

defineProps({
  state: { type: Object, required: true },
});

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
  </section>
</template>

<style lang="scss" scoped>
.pose {
  position: absolute;
  inset: 0;
  padding: 1rem 0 0 1rem;
  pointer-events: none;
}

.numbers {
  color: var(--ink-muted);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
</style>
