<script setup>
import { ref, useId } from "vue";
import Icon from "./Icon.vue";
import IconButton from "./IconButton.vue";

const props = defineProps({
  pages: { type: Number, required: true },
  glyph: { type: String, default: "" },
});

const page = defineModel("page", { type: Number, default: 1 });

const fill = `${useId()}dart`;

const flash = ref(0);
const kick = ref(0);

const go = (step) => {
  page.value = Math.min(props.pages, Math.max(1, page.value + step));
  flash.value = step;
  setTimeout(() => (flash.value = 0), 600);
};
const leave = (step) => {
  kick.value = step;
  setTimeout(() => (kick.value = 0), 420);
};
</script>

<template>
  <nav class="pager" :class="{ bare: glyph }">
    <svg class="defs" aria-hidden="true">
      <linearGradient :id="fill" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="var(--accent)" />
        <stop offset="0.4" stop-color="var(--accent-glow)" />
        <stop offset="0.8" stop-color="var(--accent)" />
        <stop offset="1" stop-color="var(--accent-deep)" />
      </linearGradient>
    </svg>
    <button
      class="arrow prev"
      :class="{ flash: flash === -1, kick: kick === -1 }"
      type="button"
      aria-label="previous page"
      :disabled="page <= 1"
      @click="go(-1)"
      @mouseleave="leave(-1)"
    >
      <IconButton
        class="disc"
        as="span"
        :name="glyph || 'minus'"
        :flip="Boolean(glyph)"
        :bare="Boolean(glyph)"
        :hover-label="false"
        :style="{ '--dart-fill': `url(#${fill})` }"
      />
      <Icon
        class="dart"
        name="arrow"
        flip
        :style="{ '--dart-fill': `url(#${fill})` }"
      />
    </button>

    <slot />

    <button
      class="arrow"
      :class="{ flash: flash === 1, kick: kick === 1 }"
      type="button"
      aria-label="next page"
      :disabled="page >= pages"
      @click="go(1)"
      @mouseleave="leave(1)"
    >
      <IconButton
        class="disc"
        as="span"
        :name="glyph || 'add'"
        :bare="Boolean(glyph)"
        :hover-label="false"
        :style="{ '--dart-fill': `url(#${fill})` }"
      />
      <Icon
        class="dart"
        name="arrow"
        :style="{ '--dart-fill': `url(#${fill})` }"
      />
    </button>
  </nav>
</template>

<style lang="scss" scoped>
.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  pointer-events: none;
}

.defs {
  position: absolute;
  width: 0;
  height: 0;
}

.arrow {
  --arrow-size: calc(var(--control-height) * 1.15);
  --dart-box: calc(var(--arrow-size) * 1.2);
  --dart-width: calc(var(--arrow-size) * 0.436);
  --disc-size: calc(var(--arrow-size) * 1.3);
  --sign: 1;
  --nudge: calc(var(--dart-width) * 0.35 * var(--sign));
  --rock: calc(var(--dart-width) * 0.12);
  --exit: calc(var(--dart-width) * 1.5 * var(--sign));
  flex: none;
  width: calc(var(--disc-size) + var(--dart-width) * 0.65);
  height: var(--disc-size);
  &.prev {
    --sign: -1;
  }
}

button.arrow {
  display: block;
  //animation: rock var(--time-rock) ease-in-out infinite;
  position: relative;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  pointer-events: auto;
  transition:
    opacity var(--time-fade) ease-out,
    translate var(--time-fade) ease-out;

  &:focus-visible {
    outline: 2px solid var(--accent-glow);
    outline-offset: 2px;
    border-radius: var(--radius-control);
  }
  &:hover .disc,
  &:focus-visible .disc {
    scale: 1;
    translate: 0 0;
  }
  .bare & .dart {
    display: none;
  }
  .bare & {
    transition: none;
  }
  .bare &.flash,
  .bare & .disc::after {
    animation: none;
  }
  .bare &:disabled {
    translate: 0 0;
  }
  &.flash {
    animation:
      //rock var(--time-rock) ease-in-out infinite,
      squish var(--time-default) ease-out;
  }
  /*&.kick .dart {
    animation: kick var(--time-bounce) var(--ease-spring);
  }*/
  &:disabled {
    animation: none;
    opacity: 0;
    translate: var(--exit) 0;
    pointer-events: none;
  }
}

.dart {
  position: absolute;
  top: 50%;
  right: calc(var(--dart-box) * -0.282);
  translate: 0 -50%;
  width: var(--dart-box);
  height: var(--dart-box);

  .prev & {
    right: auto;
    left: calc(var(--dart-box) * -0.282);
  }
  :deep(path) {
    fill: var(--dart-fill);
    stroke: var(--accent-deep);
    stroke-width: 0.7;
    stroke-linejoin: round;
  }
}

.disc {
  --control-height: var(--disc-size);
  --glyph: var(--ink-faint);

  .bare & {
    scale: 1;
    translate: 0 0;
    transition: none;
    left: auto;
    right: calc(var(--arrow-size) * -0.39);
  }
  .bare .prev & {
    right: auto;
    left: calc(var(--arrow-size) * -0.39);
  }
  .bare & :deep(path) {
    fill: var(--dart-fill);
    stroke: var(--accent-deep);
    stroke-width: 0.7;
    stroke-linejoin: round;
  }
  .bare .arrow:hover & :deep(path),
  .bare .arrow:focus-visible & :deep(path) {
    fill: var(--accent-deep);
  }

  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  transform-origin: right center;
  scale: 0;
  translate: calc(var(--dart-width) * 0.4 * var(--sign)) 0;
  transition:
    scale var(--time-pop) linear,
    translate var(--time-pop) linear;

  .prev & {
    left: auto;
    right: 0;
    transform-origin: left center;
  }
  .flash &::after {
    animation: flash var(--time-flash) ease-out;
  }
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--surface-control);
    opacity: 0;
  }
}

@keyframes squish {
  0%,
  100% {
    scale: 1 1;
    translate: 0 0;
  }
  40% {
    scale: 1 0.88;
    translate: var(--nudge) 0;
  }
}

/*@keyframes rock {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: var(--rock) 0;
  }
}*/

/*@keyframes kick {
  0% {
    translate: 0 -50%;
  }
  40% {
    translate: var(--nudge) -50%;
  }
  100% {
    translate: 0 -50%;
  }
}*/

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
