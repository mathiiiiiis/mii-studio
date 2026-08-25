<template>
  <div class="panel">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.panel {
  --cap: calc(var(--control-height) * 0.5);
  display: inline-block;
  position: relative;
  padding: calc(var(--control-height) * 0.25) calc(var(--control-height) * 0.7);
  border: 3px solid transparent;
  border-radius: calc(var(--control-height) * 0.3);
  background:
    linear-gradient(
        to bottom,
        var(--surface-control) 0 37%,
        var(--surface-control-lo) 44%,
        var(--surface-control)
      )
      padding-box,
    var(--control-edge-default) border-box;
  box-shadow: 0 0 0 3px var(--surface-control);
  font-size: calc(var(--control-height) * 0.42);
  color: var(--ink-on-control);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--surface-control);
    mask:
      var(--row-gloss-start) left center / var(--cap) 100% no-repeat,
      linear-gradient(#000 0 42%, transparent 0) center /
        calc(100% - var(--cap) * 2) 100% no-repeat,
      var(--row-gloss-end) right center / var(--cap) 100% no-repeat;
    -webkit-mask:
      var(--row-gloss-start) left center / var(--cap) 100% no-repeat,
      linear-gradient(#000 0 42%, transparent 0) center /
        calc(100% - var(--cap) * 2) 100% no-repeat,
      var(--row-gloss-end) right center / var(--cap) 100% no-repeat;
    pointer-events: none;
  }

  > * {
    position: relative;
  }
}
</style>
