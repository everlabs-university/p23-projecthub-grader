import { screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupAuthTest, visit } from './testUtils';

setupAuthTest();

test('an anonymous visitor is redirected to login with the requested route preserved', async () => {
  visit('/projects/new');

  expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  await waitFor(() => {
    expect(window.location.pathname).toBe('/login');
    expect(new URLSearchParams(window.location.search).get('returnTo')).toBe('/projects/new');
  });
});
