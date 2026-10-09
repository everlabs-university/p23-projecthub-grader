import { expect, test } from 'vitest';
import { combined } from './testUtils';

test('projects tests cover loading and successful server data', () => {
  const source = combined(/projects/i);
  expect(source).toMatch(/loading/i);
  expect(source).toMatch(/findBy(?:Text|Role)\s*\(/);
  expect(source).toMatch(/HttpResponse\.json|ctx\.json|res\s*\(/);
});
