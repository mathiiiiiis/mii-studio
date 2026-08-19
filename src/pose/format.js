export function formatPoses(data) {
  return (
    JSON.stringify(data, null, 2).replace(
      /\[\s*([^[\]{}"]*?)\s*\]/g,
      (_, body) =>
        `[${body
          .trim()
          .split(/\s*,\s*/)
          .join(", ")}]`,
    ) + "\n"
  );
}
