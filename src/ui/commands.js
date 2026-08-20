export function keyOf(event) {
  const key = event.key === " " ? "space" : event.key;
  const token = key.length === 1 ? key : key.toLowerCase();
  return (event.ctrlKey || event.metaKey ? "ctrl+" : "") + token;
}

export function findCommand(commands, event) {
  const token = keyOf(event);
  return commands.find((c) => c.keys.includes(token)) ?? null;
}

export function byGroup(commands) {
  const groups = new Map();
  for (const command of commands) {
    if (!groups.has(command.group)) groups.set(command.group, []);
    groups.get(command.group).push(command);
  }
  return [...groups].map(([name, items]) => ({ name, items }));
}
