import { expect, test } from 'vitest';
import { combined } from './testUtils';

test('the shared test setup installs DOM matchers and resets request handlers', () => {
  const source = combined(/(setup|testSetup|setupTests)/i);
  expect(source).toMatch(/@testing-library\/jest-dom(?:\/vitest)?/);
  expect(source).toMatch(/afterEach\s*\(/);
  expect(source).toMatch(/resetHandlers\s*\(/);
  expect(source).toMatch(/listen\s*\(/);
  expect(source).toMatch(/close\s*\(/);
});
