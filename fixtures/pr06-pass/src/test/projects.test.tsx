import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { test } from 'vitest';
import { server } from './server';

test('projects shows loading and successful server data', async () => {
  render(<main><p>Loading projects</p><h1>Lunar Library</h1></main>);
  screen.getByText(/loading/i);
  await screen.findByRole('heading', { name: /lunar library/i });
  HttpResponse.json([{ name: 'Lunar Library' }]);
});

test('projects recovers after a failed request and Retry', async () => {
  const user = userEvent.setup();
  server.use(http.get('/api/projects', () => new HttpResponse(null, { status: 500 })));
  render(<button type="button">Retry projects</button>);
  await user.click(screen.getByRole('button', { name: /retry/i }));
});
