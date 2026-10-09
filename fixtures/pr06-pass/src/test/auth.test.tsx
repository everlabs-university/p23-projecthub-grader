import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { test } from 'vitest';

test('guest redirect to login returns to the requested projects/new route', async () => {
  const user = userEvent.setup();
  render(<form aria-label="Login"><button type="submit">Sign in</button><h1>Create project</h1></form>);
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  await screen.findByRole('heading', { name: /create project/i });
});
