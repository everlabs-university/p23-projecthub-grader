import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

export function setupPrimitivesTest() {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    window.localStorage.clear();
    window.sessionStorage.clear();

    if (!window.PointerEvent) {
      class PointerEvent extends MouseEvent {}
      vi.stubGlobal('PointerEvent', PointerEvent);
    }

    if (!window.ResizeObserver) {
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
      vi.stubGlobal('ResizeObserver', ResizeObserver);
    }

    Object.defineProperties(window.HTMLElement.prototype, {
      hasPointerCapture: { configurable: true, value: () => false },
      setPointerCapture: { configurable: true, value: () => undefined },
      releasePointerCapture: { configurable: true, value: () => undefined },
      scrollIntoView: { configurable: true, value: () => undefined },
    });

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

export async function openDisplaySettings() {
  const trigger = await screen.findByRole('button', { name: /display settings/i });
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
  return screen.findByRole('menu', { name: /display settings/i });
}

export async function openQuickView(projectName: string) {
  const trigger = await screen.findByRole('button', {
    name: new RegExp(`quick view ${projectName}`, 'i'),
  });
  fireEvent.click(trigger);
  return {
    dialog: await screen.findByRole('dialog', { name: new RegExp(projectName, 'i') }),
    trigger,
  };
}
