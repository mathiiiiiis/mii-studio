<script setup>
import { ref, watch, nextTick } from "vue";
import Button from "./Button.vue";

const props = defineProps({
  dialog: { type: Object, required: true },
});

const element = ref(null);
const field = ref(null);
const EXIT_MS = 500;

watch(
  () => props.dialog.open.value,
  async (isOpen) => {
    if (!isOpen) {
      element.value?.classList.add("closing");
      setTimeout(() => {
        element.value?.classList.remove("closing");
        element.value?.close();
      }, EXIT_MS);
      return;
    }

    element.value?.showModal();
    await nextTick();
    field.value?.select();
  },
);
</script>

<template>
  <dialog ref="element" data-surface="paper" @cancel.prevent="dialog.cancel()">
    <form method="dialog" @submit.prevent="dialog.accept()">
      <div class="copy">
        <p class="message">{{ dialog.message.value }}</p>
        <p v-if="dialog.detail.value" class="detail">
          {{ dialog.detail.value }}
        </p>
      </div>

      <input
        v-if="dialog.kind.value === 'prompt'"
        ref="field"
        v-model="dialog.value.value"
        type="text"
      />

      <div class="actions">
        <Button variant="alt" @click="dialog.cancel()">Cancel</Button>
        <Button type="submit" @click="dialog.accept()">OK</Button>
      </div>
    </form>
  </dialog>
</template>

<style lang="scss" scoped>
dialog {
  width: min(34rem, 90vw);
  height: 24rem;
  padding: 0;
  border: none;
  border-block: 3vh solid var(--band);
  border-radius: var(--radius-card);
  background: var(--surface-lines) var(--surface-card);
  color: var(--ink-soft);
  box-shadow: var(--lift);

  opacity: 0;
  translate: 0 -100vh;
  transition:
    opacity 80ms linear,
    translate var(--time-fade) var(--ease-drop),
    display var(--time-fade) allow-discrete,
    overlay var(--time-fade) allow-discrete;

  &[open]:not(.closing) {
    opacity: 1;
    translate: 0 0;
    transition-delay: var(--delay-drop);

    @starting-style {
      opacity: 0;
      translate: 0 100vh;
    }
  }

  &::backdrop {
    background: rgb(0 0 0 / 40%);
  }
}

form {
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  height: 100%;
  align-content: space-between;
  gap: 1.25rem;
  padding: 1.75rem 1.5rem 0.25rem;
}

.copy {
  display: grid;
  gap: 0.75rem;
}

.message {
  margin: 0;
  font-size: var(--text-title);
  font-family: var(--font-dialog);
  line-height: var(--leading-body);
  letter-spacing: var(--tracking-copy);
  text-align: center;
  text-wrap: balance;
}

.detail {
  margin: 0;
  font-size: var(--text-body);
  font-family: var(--font-dialog);
  line-height: var(--leading-body);
  color: var(--ink-body);
  text-align: center;
  text-wrap: pretty;
}

input {
  font: inherit;
  align-self: end;
  font-size: var(--text-control);
  min-height: var(--control-height);
  padding: 0 calc(var(--control-height) * 0.25);
  border: 2px solid var(--control-line);
  border-radius: var(--radius-control);
  color: inherit;
  font-family: var(--font-dialog);

  &:focus-visible {
    outline: 2px solid var(--accent-glow);
    outline-offset: 2px;
    border-color: var(--accent);
  }
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-items: stretch;
  gap: 1rem;
  align-self: end;
}
</style>
