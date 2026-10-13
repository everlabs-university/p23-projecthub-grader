import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupAuthTest, visit } from './testUtils';

setupAuthTest();

test('a protected route waits while the session is being checked', async () => {
  visit('/projects/new');

  expect(screen.getByRole('status')).toHaveTextContent(/checking session/i);
  expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
});
