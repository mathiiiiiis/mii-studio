<script>
export const bar = ["key.play", "key.record", "key.erase"];
</script>

<script setup>
defineProps({
  state: { type: Object, required: true },
});
</script>

<template>
  <section class="timeline"></section>
</template>
