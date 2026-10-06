import { expect, test } from 'vitest';

import { openQuickView, setupPrimitivesTest, visit } from './testUtils';

setupPrimitivesTest();

test('a project exposes a quick view that opens an accessible dialog', async () => {
  visit('/projects');
  const { dialog } = await openQuickView('Lunar Library');

  expect(dialog).toBeInTheDocument();
});
