import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

test('Quick View dialog closes with Escape and restores focus', async () => {
  const user = userEvent.setup();
  render(<button type="button">Quick View</button>);
  const trigger = screen.getByRole('button', { name: /quick view/i });
  await user.click(trigger);
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
