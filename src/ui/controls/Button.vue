<script setup>
defineProps({
  variant: { type: String, default: "default" },
  disabled: { type: Boolean, default: false },
});

defineEmits(["click"]);
</script>

<template>
  <button
    class="pill"
    :data-variant="variant"
    :disabled="disabled"
    type="button"
    @click="$emit('click', $event)"
  >
    <span class="label"><slot /></span>
  </button>
</template>

<style lang="scss" scoped>
.pill {
  --control-fill: var(--control-fill-default);
  --control-edge: var(--control-edge-default);
  display: inline-flex;
  position: relative;
  align-items: center;
  justify-content: center;
  min-height: var(--control-height);
  padding: 0 calc(var(--control-height) * 0.9);
  aspect-ratio: 3 / 1;
  border-radius: var(--radius-control);
  border: 2px solid transparent;
  font: inherit;
  font-size: calc(var(--control-height) * 0.5);
  color: var(--ink-on-control);
  cursor: pointer;
  transition: transform var(--time-hover) linear;

  background:
    var(--control-fill) padding-box,
    var(--control-edge) border-box;

  .label {
    position: relative;
    margin-bottom: calc(var(--control-height) * 0.15);
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      to bottom,
      rgb(255 255 255 / 82%) 8%,
      rgb(255 255 255 / 60%) 32%,
      rgb(255 255 255 / 12%) 50%,
      rgb(255 255 255 / 10%) 62%
    );
    mask-image: var(--control-gloss);
    -webkit-mask-image: var(--control-gloss);
    mask-size: 100% 100%;
    -webkit-mask-size: 100% 100%;
    filter: blur(0.5px);
    pointer-events: none;
  }

  &:hover {
    transform: scale(1.05);
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
