import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupAuthTest, signIn, visit } from './testUtils';

setupAuthTest();

test('signing out clears the session and protects the route again', async () => {
  const firstRender = visit('/projects/new');
  await screen.findByRole('heading', { name: /sign in/i });
  await signIn();
  await screen.findByRole('heading', { name: /create project/i });

  fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
  expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();

  firstRender.unmount();
  window.history.pushState({}, '', '/projects/new');
  visit('/projects/new');
  expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
});
