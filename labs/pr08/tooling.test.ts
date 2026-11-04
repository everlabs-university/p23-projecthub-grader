import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

test('the project installs XState and its React integration', () => {
  const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };

  expect(dependencies.xstate).toEqual(expect.any(String));
  expect(dependencies['@xstate/react']).toEqual(expect.any(String));
});
