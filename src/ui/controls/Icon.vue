<script setup>
import { computed } from "vue";
import { icon } from "../theme/icons/index.js";

const props = defineProps({
  name: { type: String, required: true },
  weight: { type: String, default: "filled" },
  flip: { type: Boolean, default: false },
});

const source = computed(() => icon(props.name, props.weight));
</script>

<template>
  <span class="icon" :class="{ flip }" aria-hidden="true" v-html="source" />
</template>

<style lang="scss" scoped>
.icon {
  display: inline-flex;
  width: 100%;
  height: 100%;

  &.flip :deep(svg) {
    transform: scaleX(-1);
  }

  :deep(svg) {
    width: 100%;
    height: 100%;
  }
}
</style>
