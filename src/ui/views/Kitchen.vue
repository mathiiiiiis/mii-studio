<script setup>
import { ref } from "vue";
import Button from "../controls/Button.vue";
import IconButton from "../controls/IconButton.vue";
import TabHeader from "../controls/TabHeader.vue";
import { iconNames } from "../theme/icons/index.js";

const surface = ref("black");
const disabled = ref(false);
const last = ref("");

const variants = ["Default", "Alt"];
</script>

<template>
  <div class="kitchen" :data-surface="surface">
    <div class="bar">
      <button @click="surface = surface === 'black' ? 'paper' : 'black'">
        surface: {{ surface }}
      </button>
      <RouterLink to="/">studio (root)</RouterLink>
      <span class="last">{{ last }}</span>
    </div>

    <section>
      <h2>TabHeader</h2>
      <TabHeader title="Mii Studio" version="Ver 0.1.0" />
      <TabHeader title="Pose" />
    </section>

    <section>
      <h2>Button</h2>
      <div class="row">
        <Button
          v-for="variant in variants"
          :key="variant"
          :variant="variant.toLocaleLowerCase()"
          :disabled="disabled"
          @click="last = `clicked ${variant}`"
        >
          {{ variant }}
        </Button>
      </div>
    </section>

    <section>
      <h2>IconButton</h2>
      <div class="row">
        <IconButton
          v-for="name in iconNames"
          :key="name"
          :name="name"
          :disabled="disabled"
          @click="last = `clicked ${name}`"
        />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.kitchen {
  min-height: 100%;
  padding: 2rem;
  background: var(--surface);
  color: var(--ink);
}

.bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  margin-bottom: 2rem;
  font: 12px/1.5 var(--font-mono);

  button,
  a {
    font: inherit;
    color: var(--ink-muted);
    background: none;
    border: 1px solid var(--line);
    border-radius: 3px;
    padding: 4px 8px;
    cursor: pointer;
    text-decoration: none;
  }
}

.last {
  color: var(--accent-text);
}

h2 {
  font-size: var(--text-caption);
  color: var(--ink-muted);
  font-weight: normal;
  margin: 0 0 1rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
}
</style>
