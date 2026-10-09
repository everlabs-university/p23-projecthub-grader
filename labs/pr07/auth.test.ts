import { expect, test } from 'vitest';
import { combined } from './testUtils';

test('auth tests cover protected redirects and return navigation', () => {
  const source = combined(/(auth|login|protected)/i);
  expect(source).toMatch(/redirect|login/i);
  expect(source).toMatch(/projects\/new|return|requested/i);
  expect(source).toMatch(/userEvent\.setup\s*\(/);
  expect(source).toMatch(/findByRole|getByRole/);
});
