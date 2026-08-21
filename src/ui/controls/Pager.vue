<script setup>
import { ref, useId } from "vue";

const props = defineProps({
  pages: { type: Number, required: true },
});

const page = defineModel("page", { type: Number, default: 1 });

const fill = `${useId()}dart`;
const dart = "M2 1 Q13 12 24 21 Q13 32 2 43 Q8 22 2 1 Z";

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
  <nav class="pager">
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
      <span class="disc">
        <svg class="sign" viewBox="0 0 24 24">
          <rect x="3" y="10.5" width="18" height="3" rx="1.5" />
        </svg>
      </span>
      <svg class="dart" viewBox="0 0 25 44">
        <path :d="dart" :fill="`url(#${fill})`" />
      </svg>
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
      <span class="disc">
        <svg class="sign" viewBox="0 0 24 24">
          <rect x="3" y="10.5" width="18" height="3" rx="1.5" />
          <rect x="10.5" y="3" width="3" height="18" rx="1.5" />
        </svg>
      </span>
      <svg class="dart" viewBox="0 0 25 44">
        <path :d="dart" :fill="`url(#${fill})`" />
      </svg>
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
  --dart-width: calc(var(--arrow-size) * 25 / 44);
  --disc-size: calc(var(--arrow-size) * 1.3);
  --sign: 1;
  --nudge: calc(var(--dart-width) * 0.35 * var(--sign));
  --rock: calc(var(--dart-width) * 0.12);
  --exit: calc(var(--dart-width) * 1.5 * var(--sign));
  flex: none;
  width: calc(var(--disc-size) + var(--dart-width) * 0.52);
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
    opacity: 1;
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
  right: 0;
  translate: 0 -50%;
  width: var(--dart-width);
  height: var(--arrow-size);
  stroke: var(--accent-deep);
  stroke-width: 1.4;
  stroke-linejoin: round;

  .prev & {
    right: auto;
    left: 0;
    transform: scaleX(-1);
  }
}

.disc {
  display: grid;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  place-items: center;
  z-index: 1;
  width: var(--disc-size);
  height: var(--disc-size);
  border: 2px solid transparent;
  border-radius: var(--radius-control);
  background:
    var(--control-fill-default) padding-box,
    var(--control-edge-default) border-box;
  opacity: 0;

  .prev & {
    left: auto;
    right: 0;
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

.sign {
  width: 54%;
  height: 54%;
  fill: var(--ink-faint);
}
</style>
