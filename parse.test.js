import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEresolve } from '../src/parse.js';

const FIXTURE = `npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
npm error
npm error While resolving: my-app@1.0.0
npm error Found: react@18.2.0
npm error node_modules/react
npm error   react@"^18.2.0" from the root project
npm error
npm error Could not resolve dependency:
npm error peer react@"^17.0.0" from react-foo@2.1.0
npm error node_modules/react-foo
npm error   react-foo@"2.1.0" from the root project`;

test('détecte le conflit de peer dependency', () => {
  assert.deepEqual(parseEresolve(FIXTURE), {
    peer: 'react',
    range: '^17.0.0',
    requiredBy: 'react-foo',
    requiredByVersion: '2.1.0',
    installed: '18.2.0',
  });
});

test('ignore les erreurs qui ne sont pas ERESOLVE', () => {
  assert.equal(parseEresolve('npm error 404 Not Found - GET https://registry'), null);
});
