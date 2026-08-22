<script setup>
import { ref } from "vue";

defineProps({
  variant: { type: String, default: "default" },
  type: { type: String, default: "button" },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["click"]);

const flash = ref(false);

const press = (event) => {
  flash.value = false;
  requestAnimationFrame(() => (flash.value = true));
  emit("click", event);
};
</script>

<template>
  <button
    class="pill"
    :class="{ flash }"
    :data-variant="variant"
    :disabled="disabled"
    :type="type"
    @click="press"
    @animationend="flash = false"
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
  --cap: var(--control-height);
  height: var(--control-height);
  padding: 0 calc(var(--control-height) * 0.9);
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
    mask:
      var(--control-gloss-start) left center / var(--cap) 100% no-repeat,
      var(--control-gloss-middle) center / calc(100% - var(--cap) * 2) 100%
        no-repeat,
      var(--control-gloss-end) right center / var(--cap) 100% no-repeat;
    -webkit-mask:
      var(--control-gloss-start) left center / var(--cap) 100% no-repeat,
      var(--control-gloss-middle) center / calc(100% - var(--cap) * 2) 100%
        no-repeat,
      var(--control-gloss-end) right center / var(--cap) 100% no-repeat;

    filter: blur(0.5px);
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--surface-control);
    opacity: 0;
    pointer-events: none;
  }

  &.flash::after {
    animation: flash var(--time-flash) ease-out;
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

  &[data-variant="settings"] {
    border: 0;
    &:hover,
    &:focus-visible {
      --control-fill: var(--control-fill-active);
      --control-edge: var(--control-edge-active);
      transform: none;
    }
  }

  &[data-variant="bare"] {
    border: 0;
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

@keyframes flash {
  0%,
  10% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
  }
}
</style>
