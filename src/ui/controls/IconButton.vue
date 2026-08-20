<script setup>
import Icon from "./Icon.vue";

defineProps({
  name: { type: String, required: true },
  label: { type: String, default: "" },
  weight: { type: String, default: "filled" },
  flip: { type: Boolean, default: false },
  variant: { type: String, default: "default" },
  disabled: { type: Boolean, default: false },
});

defineEmits(["click"]);
</script>

<template>
  <button
    class="icon-button"
    :data-variant="variant"
    :disabled="disabled"
    :aria-label="label || name"
    :title="label || name"
    type="button"
    @click="$emit('click', $event)"
  >
    <Icon class="glyph" :name="name" :weight="weight" :flip="flip" />
  </button>
</template>

<style lang="scss" scoped>
.icon-button {
  --control-fill: var(--control-fill-default);
  --control-edge: var(--control-edge-default);
  display: inline-flex;
  position: relative;
  align-items: center;
  justify-content: center;
  width: var(--control-height);
  height: var(--control-height);
  border-radius: var(--radius-control);
  border: 2px solid transparent;
  color: var(--ink-on-control);
  cursor: pointer;
  transition: transform var(--time-hover) linear;

  background:
    var(--control-fill) padding-box,
    var(--control-edge) border-box;
  flex: none;
  box-sizing: border-box;

  .glyph {
    position: relative;
    width: 68%;
    height: 68%;
  }

  &:hover {
    transform: scale(1.1);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-glow);
    outline-offset: 2px;
    transform: scale(1.05);
  }

  &:disabled {
    filter: grayscale(1) contrast(0.5) brightness(1.2);
    color: var(--ink-faint);
    cursor: default;
    pointer-events: none;
  }

  &[data-variant="alt"] {
    --control-edge: linear-gradient(
      to bottom,
      var(--control-line),
      var(--control-line)
    );
    --control-fill: var(--control-fill-alt);
  }
}
</style>
