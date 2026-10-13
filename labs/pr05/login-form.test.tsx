import { screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';

import { DEMO_EMAIL, DEMO_PASSWORD, setupAuthTest, visit } from './testUtils';

setupAuthTest();

test('the login screen exposes an accessible form and the demo credentials', async () => {
  visit('/login');

  const email = await screen.findByRole('textbox', { name: /email/i });
  const password = screen.getByLabelText(/password/i);

  expect(email).toHaveAttribute('type', 'email');
  expect(password).toHaveAttribute('type', 'password');
  expect(screen.getByRole('button', { name: /^sign in$/i })).toHaveAttribute('type', 'submit');

  const demoCredentials = screen.getByRole('complementary', { name: /demo credentials/i });
  expect(within(demoCredentials).getByText(DEMO_EMAIL)).toBeInTheDocument();
  expect(within(demoCredentials).getByText(DEMO_PASSWORD)).toBeInTheDocument();
});
