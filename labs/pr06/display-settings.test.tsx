import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { openDisplaySettings, setupPrimitivesTest, visit } from './testUtils';

setupPrimitivesTest();

test('display settings opens an accessible menu for workspace preferences', async () => {
  visit('/projects');
  await openDisplaySettings();

  expect(screen.getByRole('menuitemradio', { name: /grid view/i })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  expect(screen.getByRole('menuitemradio', { name: /compact view/i })).toHaveAttribute(
    'aria-checked',
    'false',
  );
  expect(
    screen.getByRole('menuitemcheckbox', { name: /show favorites only/i }),
  ).toHaveAttribute('aria-checked', 'false');
});
