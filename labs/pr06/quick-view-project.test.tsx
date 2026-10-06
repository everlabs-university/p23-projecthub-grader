import { within } from '@testing-library/react';
import { expect, test } from 'vitest';

import { openQuickView, setupPrimitivesTest, visit } from './testUtils';

setupPrimitivesTest();

test('each quick view uses the data for the project that opened it', async () => {
  visit('/projects');
  const { dialog } = await openQuickView('Reef Monitor');
  const view = within(dialog);

  expect(view.getByText(/live health indicators for restoration teams/i)).toBeInTheDocument();
  expect(view.queryByText(/searchable archive for the first moon settlement/i)).not.toBeInTheDocument();
});
