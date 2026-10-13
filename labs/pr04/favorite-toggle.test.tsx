import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupWorkspaceTest, visit } from './testUtils';

setupWorkspaceTest();

test('a project can be added to and removed from favorites', async () => {
  visit('/projects');

  fireEvent.click(
    await screen.findByRole('button', { name: /add lunar library to favorites/i }),
  );

  expect(
    screen.getByRole('button', { name: /remove lunar library from favorites/i }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText(/1 favorite$/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /remove lunar library from favorites/i }));

  expect(
    screen.getByRole('button', { name: /add lunar library to favorites/i }),
  ).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByText(/0 favorites/i)).toBeInTheDocument();
});
