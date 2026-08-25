<script>
export const bar = ["clip.type", "clip.duration", "file.export"];
</script>

<script setup>
defineProps({
  state: { type: Object, required: true },
});
</script>

<template>
  <section class="clips"></section>
</template>
