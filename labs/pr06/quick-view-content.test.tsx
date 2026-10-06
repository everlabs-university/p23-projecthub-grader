import { within } from '@testing-library/react';
import { expect, test } from 'vitest';

import { openQuickView, setupPrimitivesTest, visit } from './testUtils';

setupPrimitivesTest();

test('quick view presents the selected project summary owner and status', async () => {
  visit('/projects');
  const { dialog } = await openQuickView('Lunar Library');
  const view = within(dialog);

  expect(view.getByText(/searchable archive for the first moon settlement/i)).toBeInTheDocument();
  expect(view.getByText(/marta lee/i)).toBeInTheDocument();
  expect(view.getByText(/in progress/i)).toBeInTheDocument();
});
