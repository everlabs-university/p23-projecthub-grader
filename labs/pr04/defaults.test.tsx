import { screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupWorkspaceTest, visit } from './testUtils';

setupWorkspaceTest();

test('/projects renders workspace controls with the documented defaults', async () => {
  visit('/projects');

  const workspace = await screen.findByRole('region', { name: /project workspace/i });

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
  expect(within(workspace).getByRole('button', { name: /reset workspace/i })).toBeInTheDocument();
});
