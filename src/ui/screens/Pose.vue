<script>
export const bar = ["file.load", "file.export", "pose.resetAll"];
</script>

<script setup>
defineProps({
  state: { type: Object, required: true },
});
</script>

<template>
  <section class="pose"></section>
</template>
