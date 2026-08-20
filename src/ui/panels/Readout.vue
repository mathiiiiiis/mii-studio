<script setup>
import { computed } from "vue";
import { byGroup } from "../state/commands.js";

const props = defineProps({
  state: { type: Object, required: true },
  commands: { type: Array, required: true },
});

const TRACK = 48;

const track = computed(() => {
  const cells = Array(TRACK).fill("·");
  const at = (t) =>
    Math.round((t / Math.max(1, props.state.duration.value)) * (TRACK - 1));

  for (const t of props.state.keys.value) cells[at(t)] = "|";

  const now = at(props.state.time.value);
  cells[now] = props.state.keys.value.includes(props.state.time.value)
    ? "#"
    : "^";

  return cells.join("");
});

const groups = computed(() => byGroup(props.commands));

const pad = computed(() =>
  Math.max(...props.commands.map((c) => c.keys.join(" ").length)),
);

const fixed = (n, places = 2) => Number(n).toFixed(places);
</script>

<template>
  <div class="readout">
    <div class="line">
      {{ state.playing.value ? "play" : "stop" }}
      {{ state.time.value }}/{{ state.duration.value }}ms
      {{ state.type.value }}
    </div>
    <div class="track">{{ track }}</div>

    <div v-if="state.bone.value" class="bone">
      <div>{{ state.bone.value }}</div>
      <div>world: {{ fixed(state.degrees.value, 1) }}deg</div>
      <div>about: {{ state.axis.value.map((n) => fixed(n)).join(" ") }}</div>
      <div>
        local: {{ state.local.value.map((n) => fixed(n, 4)).join(" ") }}
      </div>
    </div>
    <div v-else class="bone">no bone selected</div>

    <div v-for="group in groups" :key="group.name" class="group">
      <div v-for="command in group.items" :key="command.id" class="bind">
        <span class="keys">{{ command.keys.join(" ").padEnd(pad) }}</span>
        {{ command.label }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.readout {
  position: fixed;
  top: 12px;
  left: 12px;
  padding: 10px 12px;
  font:
    12px/1.5 ui-monospace,
    monospace;
  color: #c9d3e0;
  background: rgb(30 34 42 / 80%);
  border: 1px solid #333a46;
  border-radius: 4px;
  white-space: pre;
  pointer-events: none;
}

.track,
.bone {
  margin-bottom: 1em;
}

.group {
  margin-top: 0.5em;
}

.keys {
  display: inline-block;
  margin-right: 1em;
  color: #8b97a8;
}
</style>
