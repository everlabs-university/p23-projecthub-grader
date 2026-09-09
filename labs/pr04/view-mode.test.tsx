import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupWorkspaceTest, visit } from './testUtils';

setupWorkspaceTest();

test('compact view becomes the active catalog presentation', async () => {
  visit('/projects');
  expect(await screen.findByRole('list', { name: /project grid/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /compact view/i }));

  expect(screen.getByRole('button', { name: /compact view/i })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(screen.getByRole('button', { name: /grid view/i })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  expect(screen.getByRole('list', { name: /compact project list/i })).toBeInTheDocument();
});
