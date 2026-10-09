import { expect, test } from 'vitest';
import { combined } from './testUtils';

test('routing tests drive ProjectHub through accessible user interactions', () => {
  const source = combined(/(rout|navigation)/i);
  expect(source).toMatch(/userEvent\.setup\s*\(/);
  expect(source).toMatch(/getByRole|findByRole/);
  expect(source).toMatch(/\.click\s*\(/);
  expect(source).toMatch(/projects/i);
});
