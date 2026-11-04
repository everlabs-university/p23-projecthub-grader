import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';

import { ProjectWorkflowPanel } from '@student/features/project-workflow/ProjectWorkflowPanel';

test('the workflow panel exposes the current state and available actions accessibly', () => {
  render(<ProjectWorkflowPanel projectId="lunar-library" projectName="Lunar Library" />);

  expect(screen.getByRole('heading', { name: /workflow for lunar library/i })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(/draft/i);
  expect(screen.getByRole('textbox', { name: /review note/i })).toBeVisible();
  expect(screen.getByRole('button', { name: /submit for review/i })).toBeEnabled();
});

test('the workflow panel completes the draft review approval user flow', async () => {
  const user = userEvent.setup();
  render(<ProjectWorkflowPanel projectId="lunar-library" projectName="Lunar Library" />);

  await user.type(screen.getByRole('textbox', { name: /review note/i }), 'Ready for final review.');
  await user.click(screen.getByRole('button', { name: /submit for review/i }));
  expect(screen.getByRole('status')).toHaveTextContent(/in review/i);

  await user.click(screen.getByRole('button', { name: /^approve$/i }));
  expect(screen.getByRole('status')).toHaveTextContent(/approved/i);
  expect(screen.queryByRole('button', { name: /^approve$/i })).not.toBeInTheDocument();
});
