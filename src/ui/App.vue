<template>
  <RouterView />
</template>

<style lang="scss">
@use "./theme/index.scss";
@use "./theme/_typography.scss" as typography;

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  height: 100%;
  background: var(--surface);
}

body {
  @include typography.base;
}

#app {
  height: 100%;
}

canvas {
  display: block;
}
</style>
