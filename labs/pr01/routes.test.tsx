import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import App from '@student/App';

/**
 * The eight visible PR01 behaviours. The test names match `fullName` in
 * labs/pr01/rubric.json verbatim, so no test may be wrapped in a describe:
 * Vitest would prepend the describe block name to fullName in the JSON report
 * and the behaviour would score nothing.
 */

const PROJECT_HREF = /^\/projects\/[^/]+$/;
const PROJECTS = [
  {
    id: 'onboarding',
    name: 'Team onboarding',
    summary: 'A checklist and materials for a new developer’s first two weeks.',
    description: 'Access, a codebase tour, and the first learning task.',
    owner: 'Iryna Kovalchuk',
    status: 'In progress',
  },
  {
    id: 'analytics',
    name: 'Product analytics',
    summary: 'Dashboards for activation, retention, and weekly activity.',
    description: 'Shared metrics for product and support.',
    owner: 'Bohdan Levchenko',
    status: 'Planned',
  },
];

function visit(path: string) {
  window.history.pushState({}, '', path);

  return render(<App />);
}

function normalise(text: string | null): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

/** Tolerant heading lookup: "Onboarding" is also found inside "Project: Onboarding". */
function titlePattern(title: string): RegExp {
  return new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}

function projectLinks(): HTMLElement[] {
  return screen
    .getAllByRole('link')
    .filter((link) => {
      const href = link.getAttribute('href') ?? '';
      return href !== '/projects/new' && PROJECT_HREF.test(href);
    });
}

async function waitForProjectLinks(minimum = 1): Promise<HTMLElement[]> {
  await waitFor(() => expect(projectLinks().length).toBeGreaterThanOrEqual(minimum));
  return projectLinks();
}

function navigationLinks(): HTMLElement[] {
  return screen
    .getAllByRole('navigation')
    .flatMap((navigation) => within(navigation).getAllByRole('link'));
}

beforeEach(() => {
  window.history.pushState({}, '', '/');
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(JSON.stringify(PROJECTS), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test('/ renders the ProjectHub home page', () => {
  visit('/');

  expect(screen.getAllByRole('heading', { name: /projecthub/i }).length).toBeGreaterThan(0);
});

test('/projects renders the project list', async () => {
  visit('/projects');

  expect((await screen.findAllByRole('heading', { name: /projects/i })).length).toBeGreaterThan(0);
  expect((await waitForProjectLinks(2)).length).toBeGreaterThanOrEqual(2);
});

test('/projects/:projectId renders a single project page', async () => {
  visit('/projects');

  const links = await waitForProjectLinks();

  expect(links.length).toBeGreaterThan(0);

  const [firstProject] = links;
  const href = firstProject.getAttribute('href') ?? '';
  const title = normalise(firstProject.textContent);

  expect(title).not.toBe('');

  fireEvent.click(firstProject);

  expect(window.location.pathname).toBe(href);
  expect(
    (await screen.findAllByRole('heading', { name: titlePattern(title) })).length,
  ).toBeGreaterThan(0);
});

test('an unknown URL renders the 404 page', () => {
  visit('/no-such-page-7f3a');

  expect(screen.getAllByRole('heading', { name: /404|not found/i }).length).toBeGreaterThan(0);
});

test('UI navigation changes the route without a full reload', async () => {
  const { container } = visit('/');
  const shellBeforeNavigation = container.firstElementChild;
  const [projectsLink] = navigationLinks().filter(
    (link) => link.getAttribute('href') === '/projects',
  );

  expect(projectsLink).toBeDefined();

  fireEvent.click(projectsLink);

  expect(window.location.pathname).toBe('/projects');
  expect(container.firstElementChild).toBe(shellBeforeNavigation);
  expect(
    (await screen.findAllByRole('heading', { name: /projects/i })).length,
  ).toBeGreaterThan(0);
});

test('direct entry to a detail route works', async () => {
  visit('/projects');

  const links = await waitForProjectLinks();

  expect(links.length).toBeGreaterThan(0);

  const [firstProject] = links;
  const href = firstProject.getAttribute('href') ?? '';
  const title = normalise(firstProject.textContent);

  expect(title).not.toBe('');

  cleanup();
  visit(href);

  expect(window.location.pathname).toBe(href);
  expect(
    (await screen.findAllByRole('heading', { name: titlePattern(title) })).length,
  ).toBeGreaterThan(0);
});

test('a missing projectId is handled gracefully', async () => {
  visit('/projects/');

  expect(screen.getAllByRole('navigation').length).toBeGreaterThan(0);
  expect(
    (await screen.findAllByRole('heading', { name: /projects|404|not found/i })).length,
  ).toBeGreaterThan(0);
});

test('primary links have accessible names', () => {
  visit('/');

  const navigations = screen.getAllByRole('navigation');

  expect(navigations.length).toBeGreaterThan(0);

  const links = navigationLinks();
  const namedLinks = navigations.flatMap((navigation) =>
    within(navigation).getAllByRole('link', { name: /\S/ }),
  );

  expect(namedLinks).toHaveLength(links.length);
  expect(links.map((link) => link.getAttribute('href'))).toEqual(
    expect.arrayContaining(['/', '/projects']),
  );
});
