import { ref } from "vue";

export function createDialog() {
  const open = ref(false);
  const message = ref("");
  const detail = ref("");
  const value = ref("");
  const kind = ref("prompt");

  let settle = null;

  const close = (result) => {
    open.value = false;
    settle?.(result);
    settle = null;
  };

  const request = (type, text, initial = "", note = "") =>
    new Promise((resolve) => {
      settle?.(null);

      kind.value = type;
      message.value = text;
      detail.value = note;
      value.value = String(initial ?? "");
      open.value = true;
      settle = resolve;
    });

  return {
    open,
    message,
    detail,
    value,
    kind,
    ask: (text, initial, note) => request("prompt", text, initial, note),
    confirm: (text, note) => request("confirm", text, "", note),
    accept: () => close(kind.value === "prompt" ? value.value : true),
    cancel: () => close(null),
  };
}
