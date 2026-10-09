import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { test } from 'vitest';

test('navigation opens projects through the accessible link', async () => {
  const user = userEvent.setup();
  render(<a href="/projects">Projects</a>);
  await user.click(screen.getByRole('link', { name: /projects/i }));
});
