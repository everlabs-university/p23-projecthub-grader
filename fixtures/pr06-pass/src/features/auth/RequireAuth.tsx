import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useSession } from './SessionProvider';

export default function RequireAuth() {
  const { status } = useSession();
  const location = useLocation();

  if (status === 'checking') {
    return <p role="status">Checking session…</p>;
  }

  if (status === 'anonymous') {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate replace to={`/login?returnTo=${encodeURIComponent(returnTo)}`} />;
  }

  return <Outlet />;
}
