<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: "" },
  numeric: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

defineEmits(["click"]);
</script>

<template>
  <button
    class="row"
    :class="{ selected }"
    type="button"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <span class="label">{{ label }}</span>
    <span v-if="value !== ''" class="value" :class="{ numeric }">
      {{ value }}
    </span>
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.row {
  --row-edge: var(--control-edge-default);
  --row-fill: linear-gradient(
    to bottom,
    var(--surface-control) 0 37%,
    var(--surface-control-lo) 44%,
    var(--surface-control)
  );
  --row-gloss: var(--surface-control);
  --cap: calc(var(--control-height) * 0.5);
  display: flex;
  position: relative;
  align-items: center;
  gap: 1rem;
  width: min(34rem, 100%);
  min-height: var(--control-height);
  margin-inline: auto;
  padding: 0 calc(var(--control-height) * 0.7);
  border: 3px solid transparent;
  border-radius: calc(var(--control-height) * 0.3);
  background:
    var(--row-fill) padding-box,
    var(--row-edge) border-box;
  box-shadow: 0 0 0 3px var(--surface-control);
  font: inherit;
  font-size: calc(var(--control-height) * 0.42);
  color: var(--ink-on-control);
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--row-gloss);
    mask:
      var(--row-gloss-start) left center / var(--cap) 100% no-repeat,
      linear-gradient(#000 0 42%, transparent 0) center /
        calc(100% - var(--cap) * 2) 100% no-repeat,
      var(--row-gloss-end) right center / var(--cap) 100% no-repeat;
    -webkit-mask:
      var(--row-gloss-start) left center / var(--cap) 100% no-repeat,
      linear-gradient(#000 0 42%, transparent 0) center /
        calc(100% - var(--cap) * 2) 100% no-repeat,
      var(--row-gloss-end) right center / var(--cap) 100% no-repeat;
    pointer-events: none;
  }

  .label {
    flex: 1;
    position: relative;
    overflow: hidden;
    text-align: var(--row-align, center);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .value {
    position: absolute;
    right: calc(var(--control-height) * 0.7);
    color: var(--ink-soft);
    font-size: var(--text-caption);

    &.numeric {
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
    }
  }

  &.selected::after {
    --arm: calc(var(--control-height) * 0.38);
    --thick: calc(var(--control-height) * 0.1);
    content: "";
    position: absolute;
    inset: calc(var(--control-height) * -0.23);
    background:
      linear-gradient(var(--select-frame) 0 0) left top / var(--arm)
        var(--thick) no-repeat,
      linear-gradient(var(--select-frame) 0 0) left top / var(--thick)
        var(--arm) no-repeat,
      linear-gradient(var(--select-frame) 0 0) right top / var(--arm)
        var(--thick) no-repeat,
      linear-gradient(var(--select-frame) 0 0) right top / var(--thick)
        var(--arm) no-repeat,
      linear-gradient(var(--select-frame) 0 0) left bottom / var(--arm)
        var(--thick) no-repeat,
      linear-gradient(var(--select-frame) 0 0) left bottom / var(--thick)
        var(--arm) no-repeat,
      linear-gradient(var(--select-frame) 0 0) right bottom / var(--arm)
        var(--thick) no-repeat,
      linear-gradient(var(--select-frame) 0 0) right bottom / var(--thick)
        var(--arm) no-repeat;
    pointer-events: none;
  }

  &:hover,
  &:focus-visible {
    --row-edge: var(--control-edge-active);
    --row-fill: var(--control-fill-active);
    --row-gloss: var(--control-gloss-active);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-glow);
    outline-offset: 2px;
  }

  &:disabled {
    filter: grayscale(1) contrast(0.5) brightness(1.2);
    color: var(--ink-faint);
    cursor: default;
    pointer-events: none;
  }
}
</style>
