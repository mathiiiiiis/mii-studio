<script setup>
defineProps({
  edge: { type: String, default: "bottom" },
});

defineSlots();
</script>

<template>
  <div class="toolbar" :data-edge="edge">
    <div v-if="$slots.start" class="corner start">
      <span class="shelf" />
      <slot name="start" />
    </div>

    <div class="middle"><slot /></div>

    <div v-if="$slots.end" class="corner end">
      <span class="shelf" />
      <slot name="end" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  position: relative;
  align-items: center;
  gap: 1rem;
  min-height: calc(var(--control-height) * 1.9);
  padding-inline: calc(var(--control-height) * 0.5);
  background: var(--surface-bar);
  border-top: 2px solid var(--accent);

  &[data-edge="top"] {
    border-top: 0;
    border-bottom: 2px solid var(--accent);
  }
}

.middle {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-width: 0;
}

.corner {
  display: grid;
  position: absolute;
  top: calc(var(--control-height) * -0.35);
  align-items: center;

  [data-edge="top"] & {
    top: auto;
    bottom: calc(var(--control-height) * -0.35);
  }

  &.start {
    left: 0;
  }

  &.end {
    right: 0;
  }

  > :not(.shelf) {
    grid-area: 1 / 1;
    margin-inline: calc(var(--control-height) * 0.3);
  }

  &.start > :not(.shelf) {
    justify-self: end;
  }

  &.end > :not(.shelf) {
    justify-self: start;
  }
}

.shelf {
  grid-area: 1 / 1;
  width: calc(var(--control-height) * 3.4);
  height: calc(var(--control-height) * 1.5);
  border: 3px solid var(--surface-control-lo);
  border-radius: 999px;
  background: var(--surface-bar);

  .start & {
    border-inline-start: 0;
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  .end & {
    border-inline-end: 0;
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
}
</style>
