import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

const queryClients = vi.hoisted(() => new Set<import('@tanstack/react-query').QueryClient>());

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  const { createElement } = await import('react');

  return {
    ...actual,
    QueryClientProvider: (props: Parameters<typeof actual.QueryClientProvider>[0]) => {
      queryClients.add(props.client);
      return createElement(actual.QueryClientProvider, props);
    },
  };
});

afterEach(() => {
  cleanup();
  for (const client of queryClients) client.clear();
  queryClients.clear();
});
