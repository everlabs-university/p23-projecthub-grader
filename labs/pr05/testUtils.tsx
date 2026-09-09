import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

import App from '@student/App';

const SERVER_PROJECTS = [
  {
    id: 'lunar-library',
    name: 'Lunar Library',
    summary: 'A searchable archive for the first Moon settlement.',
    description: 'Books, field notes, and technical manuals for lunar crews.',
    owner: 'Marta Lee',
    status: 'In progress',
  },
];

export const DEMO_EMAIL = 'student@projecthub.dev';
export const DEMO_PASSWORD = 'projecthub';

export function setupAuthTest() {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    window.localStorage.clear();
    window.sessionStorage.clear();
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
    window.sessionStorage.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
}

export function visit(path: string) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

export async function signIn(email = DEMO_EMAIL, password = DEMO_PASSWORD) {
  fireEvent.change(await screen.findByRole('textbox', { name: /email/i }), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
}
