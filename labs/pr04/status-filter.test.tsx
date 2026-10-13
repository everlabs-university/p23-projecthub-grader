import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupWorkspaceTest, visit } from './testUtils';

setupWorkspaceTest();

test('status filtering keeps only matching server projects', async () => {
  visit('/projects');
  await screen.findByRole('link', { name: 'Lunar Library' });

  fireEvent.change(screen.getByRole('combobox', { name: /filter by status/i }), {
    target: { value: 'Planned' },
  });

  expect(screen.queryByRole('link', { name: 'Lunar Library' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Reef Monitor' })).toBeInTheDocument();

  fireEvent.change(screen.getByRole('combobox', { name: /filter by status/i }), {
    target: { value: 'On hold' },
  });
  expect(
    screen.getByRole('heading', { name: /no projects match this view/i }),
  ).toBeInTheDocument();
});
