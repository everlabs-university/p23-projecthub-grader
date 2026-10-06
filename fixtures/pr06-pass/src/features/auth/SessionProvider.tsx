import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  createSession,
  destroySession,
  readStoredSession,
  restoreSession,
  type Credentials,
  type SessionUser,
} from './authService';

type SessionStatus = 'checking' | 'anonymous' | 'authenticated';

type SessionContextValue = {
  status: SessionStatus;
  user: SessionUser | null;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [initialUser] = useState(readStoredSession);
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [status, setStatus] = useState<SessionStatus>(
    initialUser ? 'authenticated' : 'checking',
  );

  useEffect(() => {
    let active = true;

    void restoreSession().then((restoredUser) => {
      if (!active) return;
      setUser(restoredUser);
      setStatus(restoredUser ? 'authenticated' : 'anonymous');
    });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user,
      signIn: async (credentials) => {
        const authenticatedUser = await createSession(credentials);
        setUser(authenticatedUser);
        setStatus('authenticated');
      },
      signOut: async () => {
        await destroySession();
        setUser(null);
        setStatus('anonymous');
      },
    }),
    [status, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside SessionProvider.');
  return session;
}
