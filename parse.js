// Extrait le conflit de peer dependencies depuis la sortie npm (v7+ : "npm error" ou "npm ERR!")
const PREFIX = /^npm (?:error|ERR!)\s?/;

export function parseEresolve(output) {
  if (!/ERESOLVE/.test(output)) return null;

  const text = output
    .split('\n')
    .map((line) => line.replace(PREFIX, '').trimEnd())
    .join('\n');

  const peer = text.match(/peer (@?[^@\s"]+)@"?([^"\s]+)"?\s+from\s+(@?[^@\s]+)@(\S+)/);
  const found = text.match(/Found:\s+(@?[^@\s]+)@(\S+)/);
  if (!peer || !found) return null;

  return {
    peer: peer[1],
    range: peer[2],
    requiredBy: peer[3],
    requiredByVersion: peer[4],
    installed: found[2],
  };
}
