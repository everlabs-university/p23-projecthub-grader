import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import App from '@student/App';

/**
 * Вісім видимих поведінок PR01. Назви тестів дослівно збігаються з `fullName`
 * у labs/pr01/rubric.json, тому жоден тест не можна огортати в describe:
 * Vitest дописав би назву describe-блоку до fullName у JSON-звіті, і бали
 * за поведінку не зарахувалися б.
 */

const PROJECT_HREF = /^\/projects\/[^/]+$/;

function visit(path: string) {
  window.history.pushState({}, '', path);

  return render(<App />);
}

function normalise(text: string | null): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

/** Толерантний пошук заголовка: «Онбординг» знаходиться і в «Проєкт: Онбординг». */
function titlePattern(title: string): RegExp {
  return new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}

function projectLinks(): HTMLElement[] {
  return screen
    .getAllByRole('link')
    .filter((link) => PROJECT_HREF.test(link.getAttribute('href') ?? ''));
}

function navigationLinks(): HTMLElement[] {
  return screen
    .getAllByRole('navigation')
    .flatMap((navigation) => within(navigation).getAllByRole('link'));
}

beforeEach(() => {
  window.history.pushState({}, '', '/');
});

afterEach(() => {
  cleanup();
});

test('/ показує головну сторінку ProjectHub', () => {
  visit('/');

  expect(screen.getAllByRole('heading', { name: /projecthub/i }).length).toBeGreaterThan(0);
});

test('/projects показує список проєктів', () => {
  visit('/projects');

  expect(screen.getAllByRole('heading', { name: /проєкти/i }).length).toBeGreaterThan(0);
  expect(projectLinks().length).toBeGreaterThanOrEqual(2);
});

test('/projects/:projectId показує сторінку конкретного проєкту', async () => {
  visit('/projects');

  const links = projectLinks();

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

test('невідомий URL показує сторінку 404', () => {
  visit('/no-such-page-7f3a');

  expect(screen.getAllByRole('heading', { name: /404|не знайдено/i }).length).toBeGreaterThan(0);
});

test('навігація через UI змінює маршрут без повного reload', async () => {
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
    (await screen.findAllByRole('heading', { name: /проєкти/i })).length,
  ).toBeGreaterThan(0);
});

test('прямий перехід на detail route працює', async () => {
  visit('/projects');

  const links = projectLinks();

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

test('відсутній projectId обробляється контрольовано', () => {
  visit('/projects/');

  expect(screen.getAllByRole('navigation').length).toBeGreaterThan(0);
  expect(
    screen.getAllByRole('heading', { name: /проєкти|404|не знайдено/i }).length,
  ).toBeGreaterThan(0);
});

test('базові посилання мають доступні назви', () => {
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
