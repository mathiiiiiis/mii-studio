<script setup>
import Icon from "./Icon.vue";

defineProps({
  name: { type: String, required: true },
  label: { type: String, default: "" },
  weight: { type: String, default: "filled" },
  flip: { type: Boolean, default: false },
  variant: { type: String, default: "default" },
  disabled: { type: Boolean, default: false },
  as: { type: String, default: "button" },
  hoverLabel: { type: Boolean, default: true },
});

defineEmits(["click"]);
</script>

<template>
  <component
    :is="as"
    class="icon-button"
    :data-variant="variant"
    :disabled="as === 'button' ? disabled : undefined"
    :type="as === 'button' ? 'button' : undefined"
    :aria-label="as === 'button' ? label || name : undefined"
    :aria-hidden="as === 'button' ? undefined : true"
    @click="$emit('click', $event)"
  >
    <Icon class="glyph" :name="name" :weight="weight" :flip="flip" />
    <span v-if="hoverLabel" class="hover-label">{{ label || name }}</span>
  </component>
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
  color: var(--glyph, var(--ink-on-control));
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

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--glint-color, rgb(255 255 255 / 62%));
    mask: var(--icon-glint) center / var(--glint-size, 100%) no-repeat;
    -webkit-mask: var(--icon-glint) center / var(--glint-size, 100%) no-repeat;
    filter: blur(calc(var(--control-height) * 0.07));
    pointer-events: none;
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

  &:hover .hover-label,
  &:focus-visible .hover-label {
    opacity: 1;
    transition-delay: var(--delay-label);
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

.hover-label {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 50%;
  translate: -50% 0;
  z-index: 2;
  padding: 0.25em 0.7em;
  border-radius: var(--radius-control);
  background: var(--surface-card);
  color: var(--ink-on-control);
  box-shadow: var(--lift);
  font-size: var(--text-caption);
  line-height: 1.4;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--time-label) linear;
}
</style>
