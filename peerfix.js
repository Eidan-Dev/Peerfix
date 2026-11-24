#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parseEresolve } from '../src/parse.js';
import { buildSuggestions } from '../src/suggest.js';

const apply = process.argv.includes('--apply');
const npmArgs = process.argv.slice(2).filter((a) => a !== '--apply');

const run = spawnSync('npm', ['install', ...npmArgs], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
});

if (run.status === 0) {
  console.log('✓ npm install succeeded. Nothing to fix.');
  process.exit(0);
}

const output = `${run.stdout ?? ''}\n${run.stderr ?? ''}`;
const info = parseEresolve(output);

if (!info) {
  console.error("peerfix doesn't recognize this error. Raw npm output:\n");
  process.stderr.write(output);
  process.exit(run.status ?? 1);
}

console.log('\nDependency conflict detected:');
console.log(`  ${info.requiredBy}@${info.requiredByVersion} wants ${info.peer}@${info.range}`);
console.log(`  but your project has ${info.peer}@${info.installed}\n`);

buildSuggestions(info).forEach((s, i) => {
  console.log(`${i + 1}. ${s.title}\n   ${s.why}\n   → ${s.command}\n`);
});

if (apply) {
  if (!existsSync('package.json')) {
    console.error('No package.json found in this folder.');
    process.exit(1);
  }
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  pkg.overrides ??= {};
  pkg.overrides[info.requiredBy] = {
    ...(pkg.overrides[info.requiredBy] ?? {}),
    [info.peer]: info.installed,
  };
  writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log('✓ Override added to package.json. Run `npm install` again.');
} else {
  console.log('Tip: `peerfix --apply` writes option 2 into package.json.');
}
