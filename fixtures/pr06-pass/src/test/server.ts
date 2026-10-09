import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const projects = [{ id: 'lunar-library', name: 'Lunar Library' }];
export const server = setupServer(
  http.get('/api/projects', () => HttpResponse.json(projects)),
);
