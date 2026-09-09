import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';

import { setupWorkspaceTest, visit } from './testUtils';

setupWorkspaceTest();

test('workspace choices are persisted in local storage', async () => {
  visit('/projects');

  fireEvent.click(
    await screen.findByRole('button', { name: /add lunar library to favorites/i }),
  );
  fireEvent.change(screen.getByRole('combobox', { name: /filter by status/i }), {
    target: { value: 'Planned' },
  });
  fireEvent.click(screen.getByRole('button', { name: /compact view/i }));

  await waitFor(() => {
    const stored = window.localStorage.getItem('projecthub-workspace');
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored ?? '{}');
    expect(parsed.state).toEqual({
      statusFilter: 'Planned',
      favoriteIds: ['lunar-library'],
      favoritesOnly: false,
      viewMode: 'compact',
    });
  });
});
