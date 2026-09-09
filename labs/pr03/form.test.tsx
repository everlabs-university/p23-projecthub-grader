import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import App from '@student/App';

const SERVER_PROJECTS = [
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

function fillValidForm() {
  fireEvent.change(screen.getByRole('textbox', { name: /^name$/i }), {
    target: { value: 'Orbital Garden' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /^summary$/i }), {
    target: { value: 'A shared plan for orbital agriculture.' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /^description$/i }), {
    target: { value: 'Research notes, crop cycles, and habitat resource planning.' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /^owner$/i }), {
    target: { value: 'Marta Lee' },
  });
  fireEvent.change(screen.getByRole('combobox', { name: /^status$/i }), {
    target: { value: 'In progress' },
  });
}

beforeEach(() => {
  window.history.pushState({}, '', '/');
  window.sessionStorage.setItem(
    'projecthub-session',
    JSON.stringify({
      id: 'student-1',
      name: 'Alex Morgan',
      email: 'student@projecthub.dev',
    }),
  );
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
  window.sessionStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test('/projects/new renders a labelled create-project form', () => {
  visit('/projects/new');

  const form = screen.getByRole('form', { name: /create project/i });

  expect(screen.getByRole('heading', { name: /create project/i })).toBeInTheDocument();
  expect(within(form).getByRole('textbox', { name: /^name$/i })).toBeInTheDocument();
  expect(within(form).getByRole('textbox', { name: /^summary$/i })).toBeInTheDocument();
  expect(within(form).getByRole('textbox', { name: /^description$/i })).toBeInTheDocument();
  expect(within(form).getByRole('textbox', { name: /^owner$/i })).toBeInTheDocument();
  expect(within(form).getByRole('combobox', { name: /^status$/i })).toBeInTheDocument();
  expect(within(form).getByRole('button', { name: /create project/i })).toBeInTheDocument();
});

test('/projects links to the create-project form', async () => {
  visit('/projects');

  const createLink = await screen.findByRole('link', { name: /create project/i });

  expect(createLink).toHaveAttribute('href', '/projects/new');
});

test('an empty submission reports every required text field', async () => {
  visit('/projects/new');

  fireEvent.click(screen.getByRole('button', { name: /create project/i }));

  await waitFor(() => {
    expect(screen.getAllByRole('alert')).toHaveLength(4);
  });

  for (const label of ['Name', 'Summary', 'Description', 'Owner']) {
    expect(screen.getByRole('textbox', { name: new RegExp(`^${label}$`, 'i') })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  }
});

test('trimmed values shorter than the schema limits are rejected', async () => {
  visit('/projects/new');

  fireEvent.change(screen.getByRole('textbox', { name: /^name$/i }), {
    target: { value: ' a ' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /^summary$/i }), {
    target: { value: ' short ' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /^description$/i }), {
    target: { value: ' too short ' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /^owner$/i }), {
    target: { value: ' x ' },
  });
  fireEvent.click(screen.getByRole('button', { name: /create project/i }));

  expect(await screen.findByText('Name must be at least 3 characters')).toBeInTheDocument();
  expect(screen.getByText('Summary must be at least 10 characters')).toBeInTheDocument();
  expect(screen.getByText('Description must be at least 20 characters')).toBeInTheDocument();
  expect(screen.getByText('Owner must be at least 2 characters')).toBeInTheDocument();
});

test('the description character count updates with the field', () => {
  visit('/projects/new');

  const description = screen.getByRole('textbox', { name: /^description$/i });
  expect(screen.getByText('0 / 240')).toBeInTheDocument();

  fireEvent.change(description, { target: { value: 'hello world' } });

  expect(screen.getByText('11 / 240')).toBeInTheDocument();
});

test('reset restores the form defaults and clears errors', async () => {
  visit('/projects/new');

  fireEvent.click(screen.getByRole('button', { name: /create project/i }));
  await screen.findAllByRole('alert');

  fireEvent.change(screen.getByRole('textbox', { name: /^name$/i }), {
    target: { value: 'Temporary project' },
  });
  fireEvent.change(screen.getByRole('combobox', { name: /^status$/i }), {
    target: { value: 'On hold' },
  });
  fireEvent.click(screen.getByRole('button', { name: /reset form/i }));

  await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(0));
  expect(screen.getByRole('textbox', { name: /^name$/i })).toHaveValue('');
  expect(screen.getByRole('combobox', { name: /^status$/i })).toHaveValue('Planned');
  expect(screen.getByText('0 / 240')).toBeInTheDocument();
});

test('a valid submission navigates to a generated project URL', async () => {
  visit('/projects/new');
  fillValidForm();

  fireEvent.click(screen.getByRole('button', { name: /create project/i }));

  await waitFor(() => expect(window.location.pathname).toBe('/projects/orbital-garden'));
});

test('the created project is available from the shared projects cache', async () => {
  visit('/projects/new');
  fillValidForm();
  fireEvent.change(screen.getByRole('textbox', { name: /^name$/i }), {
    target: { value: '  Orbital Garden  ' },
  });

  fireEvent.click(screen.getByRole('button', { name: /create project/i }));

  expect(
    await screen.findByRole('heading', { name: 'Orbital Garden', level: 1 }),
  ).toBeInTheDocument();
  expect(screen.getByText('A shared plan for orbital agriculture.')).toBeInTheDocument();
  expect(screen.getByText('Marta Lee')).toBeInTheDocument();
  expect(screen.getAllByText('In progress').length).toBeGreaterThan(0);
  expect(window.location.pathname).toBe('/projects/orbital-garden');
});
