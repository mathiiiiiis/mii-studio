const files = import.meta.glob(["./filled/*.svg", "./outlined/*.svg"], {
  query: "?raw",
  import: "default",
  eager: true,
});

export const icons = {};

for (const [path, source] of Object.entries(files)) {
  const [, weight, file] = path.split("/");
  const name = file.replace(`_${weight}.svg`, "");
  (icons[name] ??= {})[weight] = source;
}

export const iconNames = Object.keys(icons).sort();

export function icon(name, weight = "filled") {
  return icons[name]?.[weight] ?? icons[name]?.filled ?? null;
}
