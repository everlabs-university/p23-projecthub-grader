import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupAuthTest, signIn, visit } from './testUtils';

setupAuthTest();

test('an authenticated session is restored after the application remounts', async () => {
  const firstRender = visit('/projects/new');
  await screen.findByRole('heading', { name: /sign in/i });
  await signIn();
  await screen.findByRole('heading', { name: /create project/i });

  firstRender.unmount();
  window.history.pushState({}, '', '/projects/new');
  visit('/projects/new');

  expect(await screen.findByRole('heading', { name: /create project/i })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /sign in/i })).not.toBeInTheDocument();
});
