import { expect, test } from 'vitest';
import { packageJson } from './testUtils';

test('the project exposes a deterministic jsdom test command', () => {
  const pkg = packageJson();
  expect(pkg.scripts?.test).toMatch(/vitest\s+(run|--run)|vitest.*--run/i);
  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const name of ['vitest', 'jsdom', '@testing-library/react', '@testing-library/user-event', '@testing-library/jest-dom', 'msw']) {
    expect(dependencies[name], `missing ${name}`).toEqual(expect.any(String));
  }
});
