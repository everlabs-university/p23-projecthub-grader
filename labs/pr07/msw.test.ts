import { expect, test } from 'vitest';
import { combined, studentTests } from './testUtils';

test('server-state tests intercept the projects API with MSW', () => {
  const source = studentTests().map((file) => file.source).join('\n');
  const serverSource = combined(/(server|handler|projects)/i);
  expect(source).toMatch(/from\s+['"]msw(?:\/node)?['"]/);
  expect(source).toMatch(/setupServer\s*\(/);
  expect(serverSource).toMatch(/http\.get\s*\(/);
  expect(serverSource).toMatch(/projects/i);
});
