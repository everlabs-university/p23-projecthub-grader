export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export type Credentials = {
  email: string;
  password: string;
};

export const DEMO_EMAIL = 'student@projecthub.dev';
export const DEMO_PASSWORD = 'projecthub';

const SESSION_KEY = 'projecthub-session';
const DEMO_USER: SessionUser = {
  id: 'student-1',
  name: 'Alex Morgan',
  email: DEMO_EMAIL,
};

function nextTask() {
  return new Promise<void>((resolve) => window.setTimeout(resolve, 0));
}

function isSessionUser(value: unknown): value is SessionUser {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Partial<SessionUser>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string'
  );
}

export function readStoredSession(): SessionUser | null {
  const stored = window.sessionStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    const session = JSON.parse(stored) as unknown;
    return isSessionUser(session) ? session : null;
  } catch {
    window.sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function restoreSession(): Promise<SessionUser | null> {
  await nextTask();
  return readStoredSession();
}

export async function createSession(credentials: Credentials): Promise<SessionUser> {
  await nextTask();

  if (credentials.email !== DEMO_EMAIL || credentials.password !== DEMO_PASSWORD) {
    throw new Error('INVALID_CREDENTIALS');
  }

  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(DEMO_USER));
  return DEMO_USER;
}

export async function destroySession(): Promise<void> {
  await nextTask();
  window.sessionStorage.removeItem(SESSION_KEY);
}
