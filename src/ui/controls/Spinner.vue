<script setup>
defineProps({
  label: { type: String, default: "Loading" },
});
</script>

<template>
  <span class="spinner" role="status" :aria-label="label">
    <svg class="ring" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="56" r="30" fill="none" stroke="currentColor" />
      <circle class="ball" cx="50" cy="26" r="13" fill="currentColor" />
    </svg>
  </span>
</template>

<style lang="css" scoped>
.spinner {
  display: inline-grid;
  place-items: center;
  width: var(--control-height);
  height: var(--control-height);
  color: var(--accent-glow);
}

.ring {
  width: 100%;
  height: 100%;
  filter: drop-shadow(
    0 0 calc(var(--control-height) * 0.06) var(--accent-glow)
  );

  circle {
    stroke-width: 5.7;
  }
}

.ball {
  transform: view-box;
  transform-origin: 50px 56px;
  animation: spin var(--time-spin) linear infinite;
}

@keyframes spin {
  to {
    rotate: 360deg;
  }
}
</style>
