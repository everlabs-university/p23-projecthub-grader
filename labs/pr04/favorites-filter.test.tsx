import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupWorkspaceTest, visit } from './testUtils';

setupWorkspaceTest();

test('favorites-only view renders only saved projects', async () => {
  visit('/projects');

  await screen.findByRole('link', { name: 'Lunar Library' });
  fireEvent.click(screen.getByRole('button', { name: /show favorites only/i }));
  expect(
    screen.getByRole('heading', { name: /no favorite projects/i }),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /show all projects/i }));

  fireEvent.click(
    screen.getByRole('button', { name: /add lunar library to favorites/i }),
  );
  fireEvent.click(screen.getByRole('button', { name: /show favorites only/i }));

  expect(screen.getByRole('button', { name: /show all projects/i })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(screen.getByRole('link', { name: 'Lunar Library' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Reef Monitor' })).not.toBeInTheDocument();
});
