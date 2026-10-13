import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupWorkspaceTest, visit } from './testUtils';

setupWorkspaceTest();

test('favorite state is shared with the project detail route', async () => {
  visit('/projects');

  fireEvent.click(
    await screen.findByRole('button', { name: /add lunar library to favorites/i }),
  );
  fireEvent.click(screen.getByRole('link', { name: 'Lunar Library' }));

  const detailFavorite = await screen.findByRole('button', {
    name: /remove lunar library from favorites/i,
  });
  expect(detailFavorite).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(detailFavorite);
  expect(
    screen.getByRole('button', { name: /add lunar library to favorites/i }),
  ).toHaveAttribute('aria-pressed', 'false');
});
