import { screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupAuthTest, signIn, visit } from './testUtils';

setupAuthTest();

test('valid credentials return the user to the protected route and show their identity', async () => {
  visit('/projects/new');
  await screen.findByRole('heading', { name: /sign in/i });
  await signIn();

  expect(await screen.findByRole('heading', { name: /create project/i })).toBeInTheDocument();
  expect(screen.getByText(/alex morgan/i)).toBeInTheDocument();
  await waitFor(() => expect(window.location.pathname).toBe('/projects/new'));
});
