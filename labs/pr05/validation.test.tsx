import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupAuthTest, visit } from './testUtils';

setupAuthTest();

test('invalid login values are rejected before authentication', async () => {
  visit('/login');
  fireEvent.change(await screen.findByRole('textbox', { name: /email/i }), {
    target: { value: 'not-an-email' },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'short' },
  });
  fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

  expect(await screen.findByText(/valid email address/i)).toHaveAttribute('role', 'alert');
  expect(screen.getByText(/at least 8 characters/i)).toHaveAttribute('role', 'alert');
  expect(window.location.pathname).toBe('/login');
});
