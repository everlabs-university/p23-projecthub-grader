import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test } from 'vitest';

import { openQuickView, setupPrimitivesTest, visit } from './testUtils';

setupPrimitivesTest();

test('quick view links to the selected project route', async () => {
  visit('/projects');
  await openQuickView('Lunar Library');

  fireEvent.click(screen.getByRole('link', { name: /open full project/i }));

  await waitFor(() => expect(window.location.pathname).toBe('/projects/lunar-library'));
  expect(await screen.findByRole('heading', { name: /lunar library/i })).toBeInTheDocument();
});
