import '@testing-library/jest-dom/vitest';

import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

import App from '@student/App';

export const SERVER_PROJECTS = [
  {
    id: 'lunar-library',
    name: 'Lunar Library',
    summary: 'A searchable archive for the first Moon settlement.',
    description: 'Books, field notes, and technical manuals for lunar crews.',
    owner: 'Marta Lee',
    status: 'In progress',
  },
  {
    id: 'reef-monitor',
    name: 'Reef Monitor',
    summary: 'Live health indicators for restoration teams.',
    description: 'Sensor observations and field reports in one shared catalog.',
    owner: 'Noah Kim',
    status: 'Planned',
  },
];

export function setupWorkspaceTest() {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    window.localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify(SERVER_PROJECTS), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
}

export function visit(path: string) {
  window.history.pushState({}, '', path);
  return render(<App />);
}
