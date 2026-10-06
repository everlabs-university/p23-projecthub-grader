import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { openDisplaySettings, setupPrimitivesTest, visit } from './testUtils';

setupPrimitivesTest();

test('display settings can show only favorite projects', async () => {
  visit('/projects');
  fireEvent.click(
    await screen.findByRole('button', { name: /add lunar library to favorites/i }),
  );

  await openDisplaySettings();
  fireEvent.click(
    screen.getByRole('menuitemcheckbox', { name: /show favorites only/i }),
  );

  expect(screen.getByRole('link', { name: /lunar library/i })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /reef monitor/i })).not.toBeInTheDocument();
});
