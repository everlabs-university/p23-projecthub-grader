import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';

import RequireAuth from './features/auth/RequireAuth';
import { SessionProvider, useSession } from './features/auth/SessionProvider';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import CreateProjectPage from './pages/CreateProjectPage';
import LoginPage from './pages/LoginPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProjectsPage from './pages/ProjectsPage';

function AppShell() {
  const { signOut, status, user } = useSession();

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <header className="app__header">
        <Link className="brand" to="/">
          ProjectHub
        </Link>
        <nav className="nav" aria-label="Main navigation">
          <NavLink className="nav__link" end to="/">
            Home
          </NavLink>
          <NavLink className="nav__link" to="/projects">
            Projects
          </NavLink>
          {status === 'anonymous' ? (
            <NavLink className="nav__link" to="/login">
              Sign in
            </NavLink>
          ) : null}
          {status === 'authenticated' && user ? (
            <div className="session-menu">
              <span className="session-menu__user">{user.name}</span>
              <button className="nav__button" type="button" onClick={() => void signOut()}>
                Sign out
              </button>
            </div>
          ) : null}
        </nav>
      </header>

      <main className="app__main" id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/projects/new" element={<CreateProjectPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="app__footer">
        <p>ProjectHub · P-23 practicum · 2026 semester</p>
      </footer>
    </div>
  );
}

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionProvider>
          <AppShell />
        </SessionProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
