import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupWorkspaceTest, visit } from './testUtils';

setupWorkspaceTest();

test('reset workspace restores every preference to its default', async () => {
  visit('/projects');
  const workspace = await screen.findByRole('region', { name: /project workspace/i });

  fireEvent.click(screen.getByRole('button', { name: /add lunar library to favorites/i }));
  fireEvent.change(within(workspace).getByRole('combobox', { name: /filter by status/i }), {
    target: { value: 'Planned' },
  });
  fireEvent.click(within(workspace).getByRole('button', { name: /compact view/i }));
  fireEvent.click(within(workspace).getByRole('button', { name: /show favorites only/i }));

  fireEvent.click(within(workspace).getByRole('button', { name: /reset workspace/i }));

  expect(within(workspace).getByRole('combobox', { name: /filter by status/i })).toHaveValue(
    'All projects',
  );
  expect(within(workspace).getByRole('button', { name: /grid view/i })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(within(workspace).getByRole('button', { name: /compact view/i })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  expect(within(workspace).getByRole('button', { name: /show favorites only/i })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  expect(within(workspace).getByText(/0 favorites/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Lunar Library' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Reef Monitor' })).toBeInTheDocument();
});
