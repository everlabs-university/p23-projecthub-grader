import { expect, test } from 'vitest';
import { combined } from './testUtils';

test('dialog tests cover Escape dismissal and focus restoration', () => {
  const source = combined(/(dialog|quick.view)/i);
  expect(source).toMatch(/Escape/);
  expect(source).toMatch(/keyboard\s*\(|keyDown\s*\(/);
  expect(source).toMatch(/not\.toBeInTheDocument|queryByRole/);
  expect(source).toMatch(/toHaveFocus\s*\(/);
});
