// Builds the fix options from the detected conflict
export function buildSuggestions({ peer, range, requiredBy, requiredByVersion, installed }) {
  return [
    {
      title: `Update ${requiredBy}`,
      why: `${requiredBy}@${requiredByVersion} requires ${peer}@${range}.`,
      command: `npm install ${requiredBy}@latest`,
    },
    {
      title: `Force ${peer}@${installed} for ${requiredBy}`,
      why: `Keeps ${peer}@${installed} via an override. Verify ${requiredBy} still works.`,
      command: `peerfix --apply  (adds overrides.${requiredBy}.${peer})`,
    },
  ];
}
