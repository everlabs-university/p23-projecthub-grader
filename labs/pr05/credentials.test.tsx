import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupAuthTest, signIn, visit } from './testUtils';

setupAuthTest();

test('wrong demo credentials produce a form-level authentication error', async () => {
  visit('/login');
  await signIn('learner@example.com', 'incorrect');

  expect(await screen.findByRole('alert')).toHaveTextContent(/email or password is incorrect/i);
  expect(window.location.pathname).toBe('/login');
});
