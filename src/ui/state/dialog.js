import { ref } from "vue";

export function createDialog() {
  const open = ref(false);
  const message = ref("");
  const value = ref("");
  const kind = ref("prompt");

  let settle = null;

  const close = (result) => {
    open.value = false;
    settle?.(result);
    settle = null;
  };

  const request = (type, text, initial = "") =>
    new Promise((resolve) => {
      settle?.(null);

      kind.value = type;
      message.value = text;
      value.value = String(initial ?? "");
      open.value = true;
      settle = resolve;
    });

  return {
    open,
    message,
    value,
    kind,
    ask: (text, initial) => request("prompt", text, initial),
    confirm: (text) => request("confirm", text),
    accept: () => close(kind.value === "prompt" ? value.value : true),
    cancel: () => close(null),
  };
}
