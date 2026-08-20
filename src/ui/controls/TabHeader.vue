<script setup>
defineProps({
  title: { type: String, required: true },
  version: { type: String, default: "" },
});
</script>

<template>
  <header class="tab-header">
    <h1 class="tab">{{ title }}</h1>
    <span v-if="version" class="version">{{ version }}</span>
    <slot />
  </header>
</template>

<style lang="scss" scoped>
.tab-header {
  --tab-height: calc(var(--control-height) * 1.15);
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  padding: 0.75rem 1rem 0;
  background: var(--surface-bar);
}

.tab {
  min-width: min(calc(var(--tab-height) * 4.5), 55vw);
  margin: 0;
  padding-inline: calc(var(--tab-height) * 0.3)
    min(calc(var(--tab-height) * 2.5), 20vw);
  border-start-start-radius: calc(var(--tab-height) * 0.14);
  border-start-end-radius: calc(var(--tab-height) * 0.57);
  background: var(--surface-control);
  color: var(--ink-on-control);
  font-size: calc(var(--tab-height) * 0.45);
  font-weight: inherit;
  line-height: var(--tab-height);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.version {
  margin-inline-start: auto;
  margin-bottom: calc(var(--tab-height) * 0.3);
  color: var(--ink-muted);
  font-size: var(--text-caption);
  white-space: nowrap;
}
</style>
