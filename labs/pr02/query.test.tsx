import '@testing-library/jest-dom/vitest';

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

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
  {
    id: 'reef-monitor',
    name: 'Reef Monitor',
    summary: 'Live health indicators for restoration teams.',
    description: 'Sensor observations and field reports in one shared catalog.',
    owner: 'Noah Kim',
    status: 'Planned',
  },
];

function projectsResponse(projects = SERVER_PROJECTS, status = 200) {
  return new Response(JSON.stringify(projects), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function successfulProjectsFetch(projects = SERVER_PROJECTS) {
  return vi.fn(async (input: RequestInfo | URL) => {
    if (String(input) !== '/projects.json') {
      throw new Error(`Unexpected projects endpoint: ${String(input)}`);
    }

    return projectsResponse(projects);
  });
}

function visit(path: string) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

beforeEach(() => {
  window.history.pushState({}, '', '/');
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test('a pending projects request shows a loading status', () => {
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));

  visit('/projects');

  expect(screen.getByRole('status')).toHaveTextContent(/loading.*projects/i);
});

test('a successful projects request renders the returned projects', async () => {
  vi.stubGlobal('fetch', successfulProjectsFetch());

  visit('/projects');

  expect(await screen.findByRole('link', { name: 'Lunar Library' })).toHaveAttribute(
    'href',
    '/projects/lunar-library',
  );
  expect(screen.getByRole('link', { name: 'Reef Monitor' })).toHaveAttribute(
    'href',
    '/projects/reef-monitor',
  );
});

test('an empty projects response shows an empty state', async () => {
  vi.stubGlobal('fetch', successfulProjectsFetch([]));

  visit('/projects');

  expect(
    await screen.findByRole('heading', { name: /no projects/i }),
  ).toBeInTheDocument();
});

test('a failed projects request shows an accessible error', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(JSON.stringify({ message: 'Service unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );

  visit('/projects');

  expect(await screen.findByRole('alert')).toHaveTextContent(
    /could not|couldn't|unable|failed|error/i,
  );
});

test('the error state can retry the projects request', async () => {
  let shouldSucceed = false;

  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      shouldSucceed
        ? projectsResponse()
        : new Response(JSON.stringify({ message: 'Service unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }),
    ),
  );

  visit('/projects');

  await screen.findByRole('alert');
  shouldSucceed = true;
  fireEvent.click(screen.getByRole('button', { name: /try again|retry/i }));

  expect(await screen.findByRole('link', { name: 'Lunar Library' })).toBeInTheDocument();
});

test('list-to-detail navigation reuses the cached projects', async () => {
  const fetchProjects = successfulProjectsFetch();
  vi.stubGlobal('fetch', fetchProjects);

  visit('/projects');
  fireEvent.click(await screen.findByRole('link', { name: 'Lunar Library' }));

  expect(
    await screen.findByRole('heading', { name: /lunar library/i }),
  ).toBeInTheDocument();
  await waitFor(() => expect(fetchProjects).toHaveBeenCalledTimes(1));
});

test('direct detail entry fetches and renders the matching project', async () => {
  vi.stubGlobal('fetch', successfulProjectsFetch());

  visit('/projects/reef-monitor');

  expect(
    await screen.findByRole('heading', { name: /reef monitor/i }),
  ).toBeInTheDocument();
});

test('a background refresh keeps cached projects visible', async () => {
  const refreshedProjects = [
    {
      ...SERVER_PROJECTS[0],
      id: 'solar-archive',
      name: 'Solar Archive',
    },
  ];
  let requestNumber = 0;
  let finishRefresh: (response: Response) => void = () => {};
  const pendingRefresh = new Promise<Response>((resolve) => {
    finishRefresh = resolve;
  });

  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      if (String(input) !== '/projects.json') {
        return Promise.reject(new Error(`Unexpected projects endpoint: ${String(input)}`));
      }

      requestNumber += 1;
      return requestNumber === 1 ? Promise.resolve(projectsResponse()) : pendingRefresh;
    }),
  );

  visit('/projects');
  await screen.findByRole('link', { name: 'Lunar Library' });
  fireEvent.click(screen.getByRole('button', { name: /refresh projects/i }));

  expect(screen.getByRole('link', { name: 'Lunar Library' })).toBeInTheDocument();
  expect(await screen.findByRole('status')).toHaveTextContent(/refreshing.*projects/i);

  await act(async () => finishRefresh(projectsResponse(refreshedProjects)));

  expect(await screen.findByRole('link', { name: 'Solar Archive' })).toBeInTheDocument();
});
