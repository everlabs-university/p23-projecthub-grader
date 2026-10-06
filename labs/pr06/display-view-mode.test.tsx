import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { openDisplaySettings, setupPrimitivesTest, visit } from './testUtils';

setupPrimitivesTest();

test('display settings can switch the catalog to compact view', async () => {
  visit('/projects');
  expect(await screen.findByRole('list', { name: /project grid/i })).toBeInTheDocument();

  await openDisplaySettings();
  fireEvent.click(screen.getByRole('menuitemradio', { name: /compact view/i }));

  expect(screen.getByRole('list', { name: /compact project list/i })).toBeInTheDocument();
});
