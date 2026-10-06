import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';

import { openQuickView, setupPrimitivesTest, visit } from './testUtils';

setupPrimitivesTest();

test('Escape closes quick view and restores focus to its trigger', async () => {
  visit('/projects');
  const { trigger } = await openQuickView('Lunar Library');

  fireEvent.keyDown(document, { key: 'Escape' });

  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: /lunar library/i })).not.toBeInTheDocument(),
  );
  expect(trigger).toHaveFocus();
});
