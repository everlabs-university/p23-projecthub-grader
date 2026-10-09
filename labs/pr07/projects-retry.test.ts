import { expect, test } from 'vitest';
import { combined } from './testUtils';

test('projects tests cover a failed request and retry recovery', () => {
  const source = combined(/projects/i);
  expect(source).toMatch(/status\s*:\s*500|HttpResponse\.error|networkError/i);
  expect(source).toMatch(/retry/i);
  expect(source).toMatch(/userEvent\.setup\s*\(/);
  expect(source).toMatch(/\.click\s*\(/);
});
